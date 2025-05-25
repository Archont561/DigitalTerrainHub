import "./assets.import"
import AlpineManager from "./Alpine";
import HTMXManager from "./htmx";
import WebComponentsManager from "./WebComponets";
import UtilsManager from "./utils";
import { DateTime } from "luxon";

(() => {
    
    window.addEventListener("DOMContentLoaded", async () => {
        // @ts-ignore
        window.luxon = { DateTime };
        UtilsManager.init();
        HTMXManager.init();   
        await WebComponentsManager.init();
        await AlpineManager.init();
    });

    const setThemeBasedOnPreference = (preference: Boolean) => {
        document.documentElement.setAttribute('data-theme', preference ? 'night' : 'bumblebee');
    }
    
    const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    themeMediaQuery.addEventListener('change', e => setThemeBasedOnPreference(e.matches));
    setThemeBasedOnPreference(themeMediaQuery.matches);
    
})();