import "./assetsImports"
import Alpine from "alpinejs";
import AlpineManager from "./Alpine/AlpineManager";
import { DateTime } from "luxon";

window.DateTime = DateTime;
window.htmx = htmx;
window.Alpine = Alpine;
window.addEventListener("DOMContentLoaded", async () => {
    await AlpineManager.init();
});