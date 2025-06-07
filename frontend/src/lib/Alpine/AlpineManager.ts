import GlobalIntervalStore from "./GlobalIntervalStore";

export default class AlpineManager implements alpine.AlpineManager {
    private Alpine: alpine.Alpine;

    constructor(Alpine: alpine.Alpine) {
        this.Alpine = Alpine;
    }

    init(): void {
        this.loadAlpineGlobalState();
    }

    loadAlpineGlobalState() {
        this.Alpine.store("globalInterval", GlobalIntervalStore);
    }

    findComponent(name: string) {
        const element = document.querySelector(`[x-data='${name}']`);
        if (!element) return null;
    
        return this.Alpine.$data(element as HTMLElement);
    }
}