import "./assetsImports"
import AlpineManager from "./Alpine/AlpineManager";
import HTMXInnerExtensionOptions from "./htmx/innerExtension";
import { DateTime } from "luxon";

(() => {
    // @ts-ignore
    window.luxon = { DateTime };
    window.htmx = htmx;
    window.addEventListener("DOMContentLoaded", () => {
        window.htmx.defineExtension("inner", HTMXInnerExtensionOptions);     
        AlpineManager.init();
    });

    const setThemeBasedOnPreference = (preference: Boolean) => {
        document.documentElement.setAttribute('data-theme', preference ? 'night' : 'bumblebee');
    }
    
    const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    themeMediaQuery.addEventListener('change', e => setThemeBasedOnPreference(e.matches));
    setThemeBasedOnPreference(themeMediaQuery.matches)
})();