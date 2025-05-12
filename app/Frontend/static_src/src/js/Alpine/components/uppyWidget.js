import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import Tus from "@uppy/tus";

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

export default function() {
    return {
        init() {
            this.$el.uppy = new Uppy({
                id: `uppy-${this.$el?.id}`
            }).use(Dashboard, {
                trigger: this.$el, 
                inline: true,
                target: this.$el,
                proudlyDisplayPoweredByUppy: true,
                theme: "auto",
            }).use(Tus, {
                endpoint: this.$el.dataset.endpoint,
                headers: {
                    "X-CSRFToken": this.$el.dataset.csrftoken,
                },
                chunkSize: 50*Math.pow(1024, 2),
                onBeforeRequest: req => {
                    req.setHeader("X-Workspace-UUID", this.$el.dataset.workspaceUuid)
                },
                onSuccess: payload => {
                    console.log(payload)
                },
            })
        }
    }
}