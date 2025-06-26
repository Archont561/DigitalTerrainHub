import type { Alpine, ElementWithXAttributes } from "alpinejs";
import { makeClassCallable } from "@utils";

declare module "alpinejs" {
    interface Magics<T> {
        $find: FindMagic;
        $component: (id: string) => {};
    }
}

type FindMagic = {
    <T extends Element = Element>(query: string): T | null;
    inside: <T extends Element = Element>(query: string) => T | null;
    closest: <T extends Element = Element>(query: string) => T | null;
    exists: (query: string) => boolean;
    count: (query: string) => number;
    text: (query: string) => string;
    attr: (query: string, attr: string) => string | null;
    all: {
        <T extends Element = Element>(query: string): NodeListOf<T>;
        inside: <T extends Element = Element>(query: string) => NodeListOf<T>;
    };
};

export default function (Alpine: Alpine) {
    const CallableDOMQueryBuilder = makeClassCallable(DOMQueryBuilder, "execute");

    Alpine.magic("find", (el) => new CallableDOMQueryBuilder(el));

    Alpine.magic("$component", el => (id: string) => {
        const componentElement = document.querySelector(`[x-id='${id}']`);
        if (!componentElement) {
            console.warn(`$component: No component found with x-id="${id}"`);
            return {};
        }
        return Alpine.$data(componentElement as ElementWithXAttributes);
    });
}

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

    execute(query: string): HTMLElement | HTMLElement[] | null {
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
