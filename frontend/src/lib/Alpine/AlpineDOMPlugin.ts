import type { Alpine } from "alpinejs";
import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginMagics } from "./AlpinePluginBase";
import { CallableClass } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        domPlugin: AlpineDOMPlugin;
        $find: SingleDOMQueryBuilder;
    }
    interface Magics<T> {
        $find: SingleDOMQueryBuilder;
    }
}

type SelectorFunction = "querySelector" | "querySelectorAll" | "closest";

interface QueryBuilderSettings {
    searchStartNode?: HTMLElement | Document;
    filters?: ((el: HTMLElement) => boolean)[];
}

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
            this.filters.push((el: HTMLElement) =>
                !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
            this.visibleFilterAdded = true;
        }
        return this;
    }

    withClass(className: string): this {
        this.filters.push(el => el.classList.contains(className));
        return this;
    }

    protected applyFilters(elements: HTMLElement[]): HTMLElement[] {
        return this.filters.reduce(
            (filtered, filter) => filtered.filter(filter),
            elements
        );
    }

    abstract query(selector: string): TQueryResult;

    protected createProxyForQueryResultHTMLElement(target: HTMLElement) {
        const Alpine = this.Alpine;
        return new Proxy(target, {
            get(obj, prop, receiver) {
                if (prop === "text") {
                    return () => obj.textContent ?? "";
                }
                if (prop === "$data") {
                    return Alpine.$data(obj);
                }
                return Reflect.get(obj, prop, receiver);
            },
        });
    }
}

class MultiDOMQueryBuilder extends BaseQueryBuilder<HTMLElement[]> {
    constructor(Alpine: Alpine, startSettings: QueryBuilderSettings = {}) {
        super(Alpine, startSettings);
        this.selectorFunction = "querySelectorAll";
    }

    get closest(): this {
        console.warn(`Cannot query closest element when 'all' mode!`);
        return this;
    }

    get all(): this {
        console.warn(`Already in 'all mode!`);
        return this;
    }

    query(query: string): HTMLElement[] {
        //@ts-ignore
        const results = Array.from(this.searchStartNode[this.selectorFunction].call(this.searchStartNode, query) as NodeListOf<HTMLElement>);
        return this.applyFilters(results).map(el => this.createProxyForQueryResultHTMLElement(el));
    }
}

class SingleDOMQueryBuilder extends BaseQueryBuilder<HTMLElement | null> {
    private allCalled = false;

    constructor(Alpine: Alpine, startSettings: QueryBuilderSettings = {}) {
        super(Alpine, startSettings);
        this.selectorFunction = "querySelector";
    }

    get closest(): this {
        if (this.searchStartNode instanceof Document) {
            console.warn(`Cannot query closest element of Document`);
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

    query(query: string): HTMLElement | null {
        //@ts-ignore
        const result = this.searchStartNode[this.selectorFunction].call(this.searchStartNode, query) as (HTMLElement | null);
        const resultAfterFiltration = this.applyFilters(result === null ? [] : [result]).at(0) || null;
        return resultAfterFiltration === null ? null : this.createProxyForQueryResultHTMLElement(resultAfterFiltration);
    }
}

class AlpineDOMPlugin extends AlpinePluginBase {
    protected PLUGIN_NAME = "domPlugin"

    protected magics: PluginMagics = {
        find: (el, { Alpine }) => new SingleDOMQueryBuilder(Alpine),
    }

    protected afterInstall(Alpine: Alpine): void {
        Object.defineProperty(Alpine, "$find", {
            get() {
                return new SingleDOMQueryBuilder(Alpine);
            },
        });
    }
}

export default AlpineDOMPlugin.expose();