import "./assetsImports"
import Alpine from "alpinejs";
import AlpineManager from "./utils/AlpineManager";
import themeSwitcher from "./utils/themeSwitcher";
import { toggleLoader } from "./utils/loader";

window.addEventListener("DOMContentLoaded", async () => {
    window.htmx = htmx;
    window.Alpine = Alpine;

    themeSwitcher.init();
    AlpineManager.init()

    document.addEventListener("htmx:configRequest", event => {
        toggleLoader(event, true);
    });
    
    document.addEventListener("htmx:afterRequest", event => {
        toggleLoader(event, false);    
    });
    
    document.addEventListener("htmx:responseError", event => {
        toggleLoader(event, false);
    });
});