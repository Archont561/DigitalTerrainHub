interface HTMX {
    process(element: HTMLElement): void;
    find(selector: string): HTMLElement | null;
    findAll(selector: string): HTMLElement[] | null;
    swap(target: HTMLElement, html: string, options?: { swapStyle: string }): void;
}

interface Api {
    triggerErrorEvent(element: HTMLElement, event: string, detail: object): void;
    getTarget(element: HTMLElement): HTMLElement | null;
}

interface HTMXExtension {
    init: (api: any) => void;
    getSelectors: () => string[];
    onEvent: (name: string, evt: Event) => void;
}


declare const window: {
    htmx: HTMX;
};


const InnerExtension: HTMXExtension = (() => {
    let API: Api | null = null;
    return {
        init(api: Api) {
            API = api;
            document.querySelectorAll(this.getSelectors().join(" ")).forEach(el => {
                el.setAttribute("hx-trigger", el.getAttribute("hx-trigger") || "click");
                el.setAttribute("hx-swap", el.getAttribute("hx-swap") || "innerHTML");
                el.setAttribute("hx-target", el.getAttribute("hx-target") || "this");
                window.htmx.process(el as HTMLElement);
            });
        },

        getSelectors(): string[] {
            return ['[hx-source]'];
        },

        onEvent(name: string, evt: Event) {
            if (name !== "htmx:trigger") return;

            const el = (evt as CustomEvent).detail.elt as HTMLElement;
            const [sourceSelector] = this.getSelectors();
            const sourceAttr = sourceSelector.replace(/\[|\]/g, '');
            const sourceQuery = el.getAttribute(sourceAttr);
            if (!sourceQuery) return;

            const source = window.htmx.find(sourceQuery) || window.htmx.findAll(sourceQuery)?.[0];
            if (!source) {
                API?.triggerErrorEvent(el, "htmx:sourceError", {
                    error: `No element found for source query: ${sourceQuery}`
                });
                return;
            }

            const target = API?.getTarget(el);
            if (!target) {
                API?.triggerErrorEvent(el, "htmx:targetError", {
                    error: `No element found for target!`
                });
                return;
            }

            window.htmx.swap(target, source.outerHTML, {
                swapStyle: el.getAttribute("hx-swap") || "innerHTML",
            });

            evt.preventDefault();
        }
    }
})();

export default InnerExtension;