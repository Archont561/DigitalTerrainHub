import type { Alpine } from 'alpinejs'
import AlpineManager from './AlpineManager'
import persist from "@alpinejs/persist";

export default (Alpine: Alpine) => {
    Alpine.plugin(persist);
    window.Alpine = {
        ...Alpine,
        Manager: new AlpineManager(Alpine),
    }
    window.Alpine.Manager.init();
}