import AlpinePluginLoaders from "./loaders/AlpinePluginLoaders";
import AlpineComponentLoaders from "./loaders/AlpineComponentLoaders";

const loadedAlpinePlugins = new Set();
const loadedAlpineComponents = new Set();

async function loadItems(names, loadedSet, loaders, registerFn, itemType) {
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
        if (result.status === 'rejected') {
            console.error(`Failed to load Alpine ${itemType} "${name}":`, result.reason);
        } else {
            console.log(`Alpine ${itemType} "${name}" loaded successfully.`);
        }
    });
}

async function init() {
    const dataAttr = "x-data";
    const pluginAttr = "x-plugins";
    const loadPromises = [];

    const elements = document.querySelectorAll([dataAttr, pluginAttr].map(el => `[${el}]`).join(","));
    elements.forEach(el => {
        const pluginAttrValue = el.getAttribute(pluginAttr)?.trim();
        if (pluginAttrValue) {
            const plugins = el.getAttribute(pluginAttr).split(',').map(p => p.trim());
            loadPromises.push(loadItems(
                plugins,
                loadedAlpinePlugins,
                AlpinePluginLoaders,
                (_, plugin) => window.Alpine.plugin(plugin),
                'plugin'
            ));
        }

        if (el.hasAttribute(dataAttr)) {
            const dataAttrValue = el.getAttribute(dataAttr)?.trim();
            if (dataAttrValue && !dataAttrValue.startsWith("{")) {
                loadPromises.push(loadItems(
                    [dataAttrValue],
                    loadedAlpineComponents,
                    AlpineComponentLoaders,
                    (name, component) => window.Alpine.data(name, () => component),
                    'component'
                ));
            }
        }
    });
    
    await Promise.allSettled(loadPromises);
    window.Alpine.start();
}

export default {
    init
}
