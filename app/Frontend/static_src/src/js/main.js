import "./assetsImports"
import Alpine from "alpinejs";
import AlpineManager from "./Alpine/AlpineManager";
import { DateTime } from "luxon";

(() => {
    window.luxon = { 
        DateTime
    }

    window.Alpine = Alpine;
    window.htmx = htmx;
    loadCustomHTMXExtension();
    window.addEventListener("DOMContentLoaded", () => {
        AlpineManager.init();
    });
})();