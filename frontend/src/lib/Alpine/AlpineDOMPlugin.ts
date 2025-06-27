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
type FindMagic = DOMQueryBuilder & {
    (...args: Parameters<DOMQueryBuilder["query"]>): ReturnType<DOMQueryBuilder["query"]>;
};;
type SelectorFunction = "querySelector" | "querySelectorAll" | "closest";

class DOMQueryBuilder {
    private filters: Record<string, (el: HTMLElement) => boolean> = {};
    private from: HTMLElement | Document = document;
    private selectorFunction: SelectorFunction = 'querySelector';
    private isInsideSet = false;
    private isAllSet = false;

    constructor(private el: HTMLElement) { }

    get all() {
        if (!this.isAllSet) {
            this.selectorFunction = 'querySelectorAll';
            this.isAllSet = true;
        }
        return this;
    }

    get inside() {
        if (!this.isInsideSet) {
            this.from = this.el;
            this.isInsideSet = true;
        }
        return this;
    }

    get closest() {
        if (!this.isInsideSet && !this.isAllSet) {
            this.from = this.el;
            this.selectorFunction = 'closest';
        }
        return this;
    }

    get visible() {
        if (!("visible" in this.filters)) {
            this.filters["visible"] = (el: HTMLElement) => el.checkVisibility();
        }
        return this;
    }

    withClass(className: string) {
        if (!("withClass" in this.filters)) {
            this.filters["withClass"] = (el: HTMLElement) => el.classList.contains(className);
        }
        return this;
    }

    query(query: string): HTMLElement | HTMLElement[] | null {
        // Call selectorFunction with the query string
        //@ts-ignore
        const rawResult = this.from[this.selectorFunction].call(this.from, query);

        let results: HTMLElement[] = rawResult instanceof NodeList
            ? Array.from(rawResult) as HTMLElement[]
            : rawResult instanceof Element
                ? [rawResult as HTMLElement]
                : [];

        Object.values(this.filters).forEach(filter => {
            results = results.filter(filter);
        });

        return rawResult instanceof NodeList ? results : (results.at(0) || null);
    }
}

class AlpineDOMPlugin {
    private settings = {};
    private CallableDOMQueryBuilder = makeClassCallable(DOMQueryBuilder, "query");

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