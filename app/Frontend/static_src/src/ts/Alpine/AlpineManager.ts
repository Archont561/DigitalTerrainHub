import AlpinePluginLoaders from "./loaders/AlpinePluginLoaders";
import AlpineComponentLoaders from "./loaders/AlpineComponentLoaders";
import { type Alpine } from "alpinejs";

declare global {
    interface Window {
        Alpine: Alpine;
    }
}

// Types for loader functions
type PluginLoader = () => Promise<any>;
type ComponentLoader = () => Promise<(...args: any[]) => any>;
type LoaderMap = Record<string, PluginLoader | ComponentLoader>;
type RegisterFunction = (name: string, loaded: any) => void;

const loadedAlpinePlugins = new Set<string>();
const loadedAlpineComponents = new Set<string>();

async function loadItems(
    names: string[],
    loadedSet: Set<string>,
    loaders: LoaderMap,
    registerFn: RegisterFunction,
    itemType: "plugin" | "component"
): Promise<void> {
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
}

interface GlobalIntervalStore {
    interval: number;
    flag: boolean;
    intervalID: ReturnType<typeof setInterval> | null;

    stop(): void;
    init(): void;
    update(): void;
    setIntervalValue(interval: number): void;
    resume(): void;
}

function loadAlpineGlobalState(): void {
    window.Alpine.store("globalInterval", {
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
    } as GlobalIntervalStore);
}

async function init(): Promise<void> {
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
            loadPromises.push(loadItems(
                plugins,
                loadedAlpinePlugins,
                AlpinePluginLoaders,
                (_, plugin) => window.Alpine.plugin(plugin),
                "plugin"
            ));
        }

        if (el.hasAttribute(dataAttr)) {
            const dataAttrValue = el.getAttribute(dataAttr)?.trim();
            if (dataAttrValue && !dataAttrValue.startsWith("{")) {
                loadPromises.push(loadItems(
                    [dataAttrValue],
                    loadedAlpineComponents,
                    AlpineComponentLoaders,
                    (name, component) => window.Alpine.data(name, component),
                    "component"
                ));
            }
        }
    });

    await Promise.allSettled(loadPromises);

    loadAlpineGlobalState();
    window.Alpine.start();
}

export default {
    init
};
