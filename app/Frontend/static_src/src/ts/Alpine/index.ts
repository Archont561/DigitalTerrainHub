import Alpine from "alpinejs";
import { alpine } from "../@types";

const AlpineComponentLoaders: Record<string, alpine.ComponentLoader> = {
    OptionsForm: async () => (await import('./components/OptionsForm')).default,
    UppyWidget: async () => (await import('./components/UppyWidget')).default,
    GCPEditor: async () => (await import('./components/GCPEditor')).default,
};

const AlpinePluginLoaders: Record<string, alpine.PluginLoader> = {
    // anchor: async () => (await import('@alpinejs/anchor')).default,
    // mask: async () => (await import('@alpinejs/mask')).default,
    // focus: async () => (await import('@alpinejs/focus')).default,
    // intersect: async () => (await import('@alpinejs/intersect')).default,
    // resize: async () => (await import('@alpinejs/resize')).default,
    // persist: async () => (await import('@alpinejs/persist')).default,
    // collapse: async () => (await import('@alpinejs/collapse')).default,
    // morph: async () => (await import('@alpinejs/morph')).default,
    // sort: async () => (await import('@alpinejs/sort')).default,
};


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
    loadedAlpinePlugins: new Set(),
    loadedAlpineComponents: new Set(),

    async init() {
        window.Alpine = {
            ...Alpine,
            Manager: this,
        };
        await this.initComponents();
        this.loadAlpineGlobalState();
        window.Alpine.start();
    },

    async initComponents() {
        const dataAttr = "x-data";
        const pluginAttr = "x-plugins";
        const loadPromises: Promise<void>[] = [];
    
        const elements = document.querySelectorAll<HTMLElement>(
            [dataAttr, pluginAttr].map(attr => `[${attr}]`).join(",")
        );
    
        elements.forEach(el => {
            const pluginAttrValue = el.getAttribute(pluginAttr)?.trim();
            if (pluginAttrValue) {
                const plugins = pluginAttrValue.split(',').map(p => p.trim());
                loadPromises.push(this.loadItems(
                    plugins,
                    this.loadedAlpinePlugins,
                    AlpinePluginLoaders,
                    (_, plugin) => window.Alpine.plugin(plugin),
                    "plugin"
                ));
            }
    
            if (el.hasAttribute(dataAttr)) {
                const dataAttrValue = el.getAttribute(dataAttr)?.trim();
                if (dataAttrValue && !dataAttrValue.startsWith("{")) {
                    loadPromises.push(this.loadItems(
                        [dataAttrValue],
                        this.loadedAlpineComponents,
                        AlpineComponentLoaders,
                        (name, component) => window.Alpine.data(name, component),
                        "component"
                    ));
                }
            }
        });
    
        await Promise.allSettled(loadPromises);
    },

    loadAlpineGlobalState() {
        window.Alpine.store("globalInterval", GlobalIntervalStore);
    },

    findComponent(name) {
        const element = document.querySelector(`[x-data='${name}']`);
        if (!element) return null;
    
        return window.Alpine.$data(element as HTMLElement);
    },

    async loadItems(names, loadedSet, loaders, registerFn, itemType) {
        const results = await Promise.allSettled(
            names.map(async (name) => {
                if (!name || loadedSet.has(name)) return;
    
                const loaderFn = loaders[name];
                if (!loaderFn) {
                    console.warn(`No loader found for Alpine ${itemType}: ${name}`);
                    return;
                }
    
                loadedSet.add(name);
                const loaded = await loaderFn();
                registerFn(name, loaded);
            })
        );
    
        results.forEach((result, index) => {
            const name = names[index];
            if (result.status === "rejected") {
                console.error(`Failed to load Alpine ${itemType} "${name}":`, result.reason);
            } else {
                console.log(`Alpine ${itemType} "${name}" loaded successfully.`);
            }
        });
    },
} as alpine.AlpineManager;