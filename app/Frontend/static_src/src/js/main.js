import "./assetsImports"
import Alpine from "alpinejs";
import AlpineManager from "./Alpine/AlpineManager";
import HTMXInnerExtensionOptions from "./htmx/innerExtension";
import { DateTime } from "luxon";

(() => {
    window.luxon = { 
        DateTime
    }

    window.Alpine = Alpine;
    window.htmx = htmx;
    window.addEventListener("DOMContentLoaded", () => {
        window.htmx.defineExtension("inner", HTMXInnerExtensionOptions);     
        AlpineManager.init();
    });
})();