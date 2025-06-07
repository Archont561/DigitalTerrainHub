import type { Alpine } from 'alpinejs'
import AlpineManager from './AlpineManager'

export default (Alpine: Alpine) => {
    window.Alpine = {
        ...Alpine,
        Manager: new AlpineManager(Alpine),
    }
    window.Alpine.Manager.init();
}