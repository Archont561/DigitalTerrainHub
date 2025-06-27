import type { Alpine } from "alpinejs";
import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginMagics } from "./AlpinePluginBase";
import { makeClassCallable } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        domPlugin: AlpineDOMPlugin;
    }
    interface Magics<T> {
        $find: FindMagic;
        $component: (id: string) => {};
    }
}

type FindMagic = SingleDOMQueryBuilder & {
    (...args: Parameters<SingleDOMQueryBuilder["query"]>): ReturnType<SingleDOMQueryBuilder["query"]>;
};;

type SelectorFunction = "querySelector" | "querySelectorAll" | "closest";

interface QueryBuilderSettings {
    from?: HTMLElement | Document;
    selectorFunction?: SelectorFunction;
    shouldLookInsideElement?: boolean;
    filters?: ((el: HTMLElement) => boolean)[];
}

abstract class BaseQueryBuilder<TQueryResult> {
    protected filters: ((el: HTMLElement) => boolean)[] = [];
    protected from: HTMLElement | Document = document;
    protected selectorFunction: SelectorFunction = "querySelector";
    protected shouldLookInsideElement = false;

    constructor(protected el: HTMLElement, protected Alpine: Alpine, startSettings: QueryBuilderSettings = {}) {
        if (startSettings.from) this.from = startSettings.from;
        if (startSettings.shouldLookInsideElement) this.shouldLookInsideElement = startSettings.shouldLookInsideElement;
        if (startSettings.selectorFunction) this.selectorFunction = startSettings.selectorFunction;
        if (startSettings.filters) this.filters = [...startSettings.filters];
    }

    get inside(): this {
        this.from = this.el;
        this.shouldLookInsideElement = true;
        return this;
    }

    get closest(): this {
        if (!this.shouldLookInsideElement) {
            this.from = this.el;
            this.selectorFunction = "closest";
        }
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
    constructor(el: HTMLElement, Alpine: Alpine, startSettings: Omit<QueryBuilderSettings, "selectorFunction"> = {}) {
        super(el, Alpine, startSettings);
        this.selectorFunction = "querySelectorAll";
    }

    query(selector: string): HTMLElement[] {
        //@ts-ignore
        const results = Array.from(this.from[this.selectorFunction].call(this.from, selector) as NodeListOf<HTMLElement>);
        return this.applyFilters(results).map(el => this.createProxyForQueryResultHTMLElement(el));
    }
}

const CallableMultiDOMQueryBuilder = makeClassCallable(MultiDOMQueryBuilder, "query");

class SingleDOMQueryBuilder extends BaseQueryBuilder<HTMLElement | null> {
    private allCalled = false;

    constructor(el: HTMLElement, Alpine: Alpine, startSettings: Omit<QueryBuilderSettings, "selectorFunction"> = {}) {
        super(el, Alpine, startSettings);
        this.selectorFunction = "querySelector";
    }

    get all(): InstanceType<typeof CallableMultiDOMQueryBuilder> {
        if (this.allCalled) {
            throw new Error("`.all` has already been called on this builder instance.");
        }
        this.allCalled = true;

        return new CallableMultiDOMQueryBuilder(this.el, this.Alpine, {
            filters: this.filters,
            from: this.from,
            shouldLookInsideElement: this.shouldLookInsideElement,
        });
    }

    query(selector: string): HTMLElement | null {
        //@ts-ignore
        const result = this.from[this.selectorFunction].call(this.from, selector) as (HTMLElement | null);
        const resultAfterFiltration = this.applyFilters(result === null ? [] : [result]).at(0) || null;
        return resultAfterFiltration === null ? null : this.createProxyForQueryResultHTMLElement(resultAfterFiltration);
    }
}

const CallableSingleDOMQueryBuilder = makeClassCallable(SingleDOMQueryBuilder, "query");


class AlpineDOMPlugin extends AlpinePluginBase {
    protected PLUGIN_NAME = "domPlugin"

    protected magics: PluginMagics = {
        find: (el, { Alpine }) => new CallableSingleDOMQueryBuilder(el, Alpine),
    }
}

export default AlpineDOMPlugin.expose();