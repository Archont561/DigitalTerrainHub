import type { Alpine } from 'alpinejs'
import GlobalIntervalStore from "./GlobalIntervalStore";
import persist from "@alpinejs/persist";
import helpers from "./AlpineHelpersPlugin";
import semantics from "./AlpineSemanticsPlugin";
import ajax from "./AlpineAjaxPlugin";


export default (Alpine: Alpine) => {
    Alpine.plugin(persist);
    Alpine.plugin(helpers);
    Alpine.plugin(semantics);
    Alpine.plugin(ajax.setSettings({
        headers: {
            "X-CSRF-Token": document.querySelector("meta[name='csrfToken']")?.getAttribute("content") || ""
        }
    }));
    Alpine.store("globalInterval", GlobalIntervalStore);
    window.Alpine = Alpine;
}
