import type { Alpine } from 'alpinejs'
import GlobalIntervalStore from "./GlobalIntervalStore";
import persist from "@alpinejs/persist";
import helpers from "./AlpineHelpersPlugin";
import semantics from "./AlpineSemanticsPlugin";


export default (Alpine: Alpine) => {
    Alpine.plugin(persist);
    Alpine.plugin(helpers);
    Alpine.plugin(semantics);
    Alpine.store("globalInterval", GlobalIntervalStore);
    window.Alpine = Alpine;
}
