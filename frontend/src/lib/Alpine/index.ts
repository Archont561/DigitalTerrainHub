import type { Alpine } from 'alpinejs'
import persist from "@alpinejs/persist";
import dom from "./AlpineDOMPlugin";
import time from "./AlpineTimePlugin";
import media from "./AlpineMediaPlugin";
import ajax from "./AlpineAjaxPlugin";
import styles from "./AlpineStylesPlugin";


export default (Alpine: Alpine) => {
    Alpine.plugin(persist);
    Alpine.plugin(dom);
    Alpine.plugin(time);
    Alpine.plugin(media);
    Alpine.plugin(styles);
    Alpine.plugin(ajax.setSettings({
        headers: {
            "X-CSRF-Token": document.querySelector("meta[name='csrfToken']")?.getAttribute("content") || ""
        }
    }));
    window.Alpine = Alpine;
}
