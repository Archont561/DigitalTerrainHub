import Alpine from "alpinejs";
import type { alpine } from "../../types";


const GlobalIntervalStore = {
    interval: 1000,
    flag: true,

    stop() {
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
        }
    },
    init() {
        this.update();
        this.intervalID = setInterval(() => this.update(), this.interval);
    },
    update() {
        this.flag = !this.flag;
    },
    setIntervalValue(interval: number) {
        this.interval = interval;
    },
    resume() {
        this.intervalID = setInterval(() => this.update(), this.interval);
    }
} as alpine.GlobalIntervalStore;


export default {

    init() {
        window.Alpine = {
            ...Alpine,
            Manager: this,
        };
        this.loadAlpineGlobalState();
        window.Alpine.start();
    },

    loadAlpineGlobalState() {
        window.Alpine.store("globalInterval", GlobalIntervalStore);
    },

    findComponent(name) {
        const element = document.querySelector(`[x-data='${name}']`);
        if (!element) return null;
    
        return window.Alpine.$data(element as HTMLElement);
    },
    
} as alpine.AlpineManager;