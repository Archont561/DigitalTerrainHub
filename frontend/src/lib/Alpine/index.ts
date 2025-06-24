import type { Alpine } from 'alpinejs'
import GlobalIntervalStore from "./GlobalIntervalStore";
import persist from "@alpinejs/persist";

export default (Alpine: Alpine) => {
    Alpine.plugin(persist);
    Alpine.store("globalInterval", GlobalIntervalStore);
    Alpine.magic("find", () => (query: string) => document.querySelector(query));
    window.Alpine = Alpine;
}