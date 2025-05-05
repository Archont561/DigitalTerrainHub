import AlpinePluginLoaders from "./AlpinePluginLoaders";
import AlpineComponentLoaders from "./AlpineComponentLoaders";

const loadedAlpinePlugins = new Set();
const loadedAlpineComponents = new Set();

export const AlpineDataAttrName = "x-data";
export const AlpinePluginsAttrName = "x-plugins";

export async function loadAlpinePlugin(name) {
    if (loadedAlpinePlugins.has(name)) return;

    const loaderFn = AlpinePluginLoaders[name];
    if (!loaderFn) console.warn(`No loader found for Alpine plugin: ${name}`);

    const plugin = await loaderFn();
    loadedAlpinePlugins.add(name);
    window.Alpine.plugin(plugin);
}

export async function loadAlpineComponent(name) {
    if (loadedAlpineComponents.has(name)) return;

    const loaderFn = AlpineComponentLoaders[name];
    if (!loaderFn) console.warn(`No loader found for Alpine component: ${name}`);

    const component = await loaderFn();
    loadAlpineComponents.add(name);
    window.Alpine.data(component);
}
