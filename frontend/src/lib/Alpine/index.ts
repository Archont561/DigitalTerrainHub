import type { Alpine } from 'alpinejs'
import GlobalIntervalStore from "./GlobalIntervalStore";
import persist from "@alpinejs/persist";
import dom from "./AlpineDOMPlugin";
import time from "./AlpineTimePlugin";
import media from "./AlpineMediaPlugin";
import semantics from "./AlpineSemanticsPlugin";
import ajax from "./AlpineAjaxPlugin";


export default (Alpine: Alpine) => {
    Alpine.plugin(persist);
    Alpine.plugin(dom);
    Alpine.plugin(time);
    Alpine.plugin(media);
    Alpine.plugin(semantics);
    Alpine.plugin(ajax.setSettings({
        headers: {
            "X-CSRF-Token": document.querySelector("meta[name='csrfToken']")?.getAttribute("content") || ""
        }
    }));
    Alpine.store("globalInterval", GlobalIntervalStore);
    window.Alpine = Alpine;
}
