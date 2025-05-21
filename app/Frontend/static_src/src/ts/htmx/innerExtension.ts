import { HTMX } from "../@types";


const InnerExtension = (() => {
    let api: HTMX.ExtensionAPI;
    return {
        init(apiRef) {
            api = apiRef;
            const selectors = this.getSelectors?.() || [];
            document.querySelectorAll(selectors.join(" ")).forEach(el => {
                el.setAttribute("hx-trigger", el.getAttribute("hx-trigger") || "click");
                el.setAttribute("hx-swap", el.getAttribute("hx-swap") || "innerHTML");
                el.setAttribute("hx-target", el.getAttribute("hx-target") || "this");
                window.htmx.process(el as HTMLElement);
            });
        },
        getSelectors() { return ['[hx-source]']; },
        onEvent(name, evt) {
            if (name !== "htmx:trigger") return;

            const el = evt.detail.elt as HTMLElement;
            const [sourceSelector] = this.getSelectors?.() as string[];
            const sourceAttr = sourceSelector.replace(/\[|\]/g, '');
            const sourceQuery = el.getAttribute(sourceAttr);
            if (!sourceQuery) return;

            const source = window.htmx.find(sourceQuery) || window.htmx.findAll(sourceQuery)?.[0];
            if (!source) {
                api.triggerErrorEvent(el, "htmx:sourceError", {
                    error: `No element found for source query: ${sourceQuery}`
                });
                return;
            }

            const target = api.getTarget(el);
            if (!target) {
                api.triggerErrorEvent(el, "htmx:targetError", {
                    error: `No element found for target!`
                });
                return;
            }

            const swapStyle = (el.getAttribute("hx-swap") || "innerHTML") as HTMX.SwapStyle;
            window.htmx.swap(target, source.outerHTML, { swapStyle });

            evt.preventDefault();
        }
    } as HTMX.Extension;
})();

export default InnerExtension;