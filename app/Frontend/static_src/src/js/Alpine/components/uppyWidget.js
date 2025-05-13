import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import Tus from "@uppy/tus";

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

export default () => ({
    init() {
        this.$el.uppy = new Uppy({ id: `uppy-${this.$el?.id}` });
        this.setDashboard();
        this.setTusProtocol();
    },
    close() {
        this.$el.closest("dialog").close()
    },
    setDashboard() {
        this.$el.uppy.use(Dashboard, {
            inline: true,
            target: this.$el,
            proudlyDisplayPoweredByUppy: true,
            theme: "auto",
            width: "100%",
            height: "100%",
            doneButtonHandler: () => {
                this.$el.uppy.cancelAll();
                this.close();
            }
        });
        this.setCustomStyle();
    },
    setCustomStyle() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.id="uppyWidgetModifications";
        style.innerHTML = `.uppy-Root, .uppy-Dashboard { height: 100%; width: 100%; }`;
        document.head.appendChild(style);
    },
    setTusProtocol() {
        this.$el.uppy.use(Tus, {
            endpoint: this.$el.dataset.endpoint,
            headers: {
                "X-CSRFToken": this.$el.dataset.csrftoken,
            },
            chunkSize: 50*Math.pow(1024, 2),
            onBeforeRequest: req => {
                req.setHeader("X-Workspace-UUID", window.Alpine.store("currentWorkspaceUUID"))
            },
            onSuccess: payload => {
                console.log(payload);
            },
        });
    },
})