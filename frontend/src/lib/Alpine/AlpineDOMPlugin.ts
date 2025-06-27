import type { Alpine } from "alpinejs";
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

type AlpineMagicCallback = Parameters<Alpine["magic"]>[1];
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

    constructor(protected el: HTMLElement, startSettings: QueryBuilderSettings = {}) {
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
}

class MultiDOMQueryBuilder extends BaseQueryBuilder<HTMLElement[]> {
    constructor(el: HTMLElement, startSettings: Omit<QueryBuilderSettings, "selectorFunction"> = {}) {
        super(el, startSettings);
        this.selectorFunction = "querySelectorAll";
    }

    query(selector: string): HTMLElement[] {
        //@ts-ignore
        const results = Array.from(this.from[this.selectorFunction].call(this.from, selector) as NodeListOf<HTMLElement>);
        return this.applyFilters(results);
    }
}

class SingleDOMQueryBuilder extends BaseQueryBuilder<HTMLElement | null> {
    private allCalled = false;

    constructor(el: HTMLElement, startSettings: Omit<QueryBuilderSettings, "selectorFunction"> = {}) {
        super(el, startSettings);
        this.selectorFunction = "querySelector";
    }

    get all(): MultiDOMQueryBuilder {
        if (this.allCalled) {
            throw new Error("`.all` has already been called on this builder instance.");
        }
        this.allCalled = true;

        return new MultiDOMQueryBuilder(this.el, {
            filters: this.filters,
            from: this.from,
            shouldLookInsideElement: this.shouldLookInsideElement,
        });
    }

    query(selector: string): HTMLElement | null {
        //@ts-ignore
        const result = this.from[this.selectorFunction].call(this.from, selector) as (HTMLElement | null);

        const filtered = this.applyFilters(result === null ? [] : [result]);
        return filtered.at(0) || null;
    }
}

class AlpineDOMPlugin {
    private settings = {};
    private CallableDOMQueryBuilder = makeClassCallable(SingleDOMQueryBuilder, "query");

    getSettings() {
        return { ...this.settings };
    }

    install(Alpine: Alpine) {
        Alpine.magic("find", this.$find);
        Alpine.magic("component", this.$component);
        Alpine.domPlugin = this;
    }

    private $find: AlpineMagicCallback = (el) => new this.CallableDOMQueryBuilder(el);

    private $component: AlpineMagicCallback = (el, { Alpine }) => (id: string) => {
        const componentElement = document.querySelector(`[x-id='${id}']`);
        if (!componentElement) {
            console.warn(`$component: No component found with x-id="${id}"`);
            return {};
        }
        return Alpine.$data(componentElement as any);
    }

}

export default new (makeClassCallable(AlpineDOMPlugin, "install"));