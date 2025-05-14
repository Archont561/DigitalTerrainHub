export default {
    init: function(api) {
        this.api = api;
        document.querySelectorAll(this.getSelectors()).forEach(el => {
            el.setAttribute("hx-trigger", el.getAttribute("hx-trigger") || "click");
            el.setAttribute("hx-swap", el.getAttribute("hx-swap") || "innerHTML");
            el.setAttribute("hx-target", el.getAttribute("hx-target") || "this");
            window.htmx.process(el);
        });
    },
    getSelectors: function() {
        return ['[hx-source]'];
    },
    onEvent: function (name, evt) {
        if (name !== "htmx:trigger") return;

        const el = evt.detail.elt;
        const [sourceSelector] = this.getSelectors();
        const sourceAttr = sourceSelector.replace(/\[|\]/g, '');
        const sourceQuery = el.getAttribute(sourceAttr);
        if (!sourceQuery) return;

        const source = window.htmx.find(sourceQuery) || window.htmx.findAll(sourceQuery)?.[0];
        if (!source) {
            this.api.triggerErrorEvent(el, "htmx:sourceError", {
                error: `No element found for source query: ${sourceQuery}`
            });
            return;
        }

        const target = this.api.getTarget(el);
        if (!target) {
            this.api.triggerErrorEvent(el, "htmx:targetError", {
                error: `No element found!`
            });
            return;
        }
        window.htmx.swap(target, source.outerHTML, {
            swapStyle: el.getAttribute("hx-swap"),
        });
        
        evt.preventDefault();
    }
}
