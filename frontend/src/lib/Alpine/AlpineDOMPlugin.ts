import type { Alpine } from "alpinejs";
import AlpinePluginBuilder from "./AlpinePluginBuilder";
import { CallableClass } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        domPlugin: typeof AlpineDOMPlugin;
        $find: InstanceType<typeof AlpineDOMPlugin.SingleDOMQueryBuilder>;
    }
    interface Magics<T> {
        $find: InstanceType<typeof AlpineDOMPlugin.SingleDOMQueryBuilder>;
    }
}

type SelectorFunction = "querySelector" | "querySelectorAll" | "closest";

interface QueryBuilderSettings {
    searchStartNode?: HTMLElement | Document;
    filters?: ((el: HTMLElement) => boolean)[];
}

const AlpineDOMPlugin = AlpinePluginBuilder.create("domPlugin")
.extend(plugin => {
    abstract class BaseQueryBuilder<TQueryResult> extends CallableClass<BaseQueryBuilder<TQueryResult>> {
        protected filters: ((el: HTMLElement) => boolean)[] = [];
        protected searchStartNode: HTMLElement | Document = document;
        protected selectorFunction!: SelectorFunction;

        constructor(protected Alpine: Alpine, startSettings: QueryBuilderSettings = {}) {
            super("query");
            if (startSettings.searchStartNode) this.searchStartNode = startSettings.searchStartNode;
            if (startSettings.filters) this.filters = [...startSettings.filters];
        }

        from(from: HTMLElement | Document): this {
            this.searchStartNode = from;
            return this;
        }

        private visibleFilterAdded = false;

        get visible(): this {
            if (!this.visibleFilterAdded) {
                this.filters.push(el =>
                    !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
                );
                this.visibleFilterAdded = true;
            }
            return this;
        }

        withClass(className: string): this {
            this.filters.push(el => el.classList.contains(className));
            return this;
        }

        protected applyFilters(elements: HTMLElement[]): HTMLElement[] {
            return this.filters.reduce((acc, fn) => acc.filter(fn), elements);
        }

        abstract query(selector: string): TQueryResult;

        protected createProxyForQueryResultHTMLElement(target: HTMLElement) {
            const Alpine = this.Alpine;
            return new Proxy(target, {
                get(obj, prop, receiver) {
                    if (prop === "text") return () => obj.textContent ?? "";
                    if (prop === "$data") return Alpine.$data(obj);
                    return Reflect.get(obj, prop, receiver);
                },
            });
        }
    }

    class MultiDOMQueryBuilder extends BaseQueryBuilder<HTMLElement[]> {
        constructor(Alpine: Alpine, settings: QueryBuilderSettings = {}) {
            super(Alpine, settings);
            this.selectorFunction = "querySelectorAll";
        }

        get closest(): this {
            console.warn("Cannot query closest element in 'all' mode.");
            return this;
        }

        get all(): this {
            console.warn("Already in 'all' mode.");
            return this;
        }

        query(selector: string): HTMLElement[] {
            //@ts-ignore
            const result = Array.from(this.searchStartNode[this.selectorFunction](selector)) as HTMLElement[];
            return this.applyFilters(result).map(el => this.createProxyForQueryResultHTMLElement(el));
        }
    }

    class SingleDOMQueryBuilder extends BaseQueryBuilder<HTMLElement | null> {
        private allCalled = false;

        constructor(Alpine: Alpine, settings: QueryBuilderSettings = {}) {
            super(Alpine, settings);
            this.selectorFunction = "querySelector";
        }

        get closest(): this {
            if (this.searchStartNode instanceof Document) {
                console.warn("Cannot query closest element of Document");
                return this;
            }
            this.selectorFunction = "closest";
            return this;
        }

        get all(): InstanceType<typeof MultiDOMQueryBuilder> {
            if (this.allCalled) {
                throw new Error("`.all` has already been called on this builder instance.");
            }
            this.allCalled = true;

            return new MultiDOMQueryBuilder(this.Alpine, {
                filters: this.filters,
                searchStartNode: this.searchStartNode,
            });
        }

        query(selector: string): HTMLElement | null {
            //@ts-ignore
            const result = this.searchStartNode[this.selectorFunction](selector) as HTMLElement | null;
            const filtered = this.applyFilters(result === null ? [] : [result]);
            const el = filtered[0] ?? null;
            return el === null ? null : this.createProxyForQueryResultHTMLElement(el);
        }
    }

    return {
        BaseQueryBuilder,
        MultiDOMQueryBuilder,
        SingleDOMQueryBuilder,
    };
}).addMagic(plugin => ({
    name: "find",
    callback: (_, { Alpine }) => new plugin.SingleDOMQueryBuilder(Alpine)
})).addGlobalMagic(plugin => ({
    name: "find",
    callback: Alpine => new plugin.SingleDOMQueryBuilder(Alpine)
}));

export default AlpineDOMPlugin;