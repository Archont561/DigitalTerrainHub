//@ts-ignore
import { actions } from "astro:actions";
import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginMagics } from "./AlpinePluginBase";

declare module "alpinejs" {
    interface Alpine {
        astroPlugin: AlpineAstroPlugin;
    }
    interface Magics<T> {
        $actions: {};
    }
}

class AlpineAstroPlugin extends AlpinePluginBase {
    protected PLUGIN_NAME = "astroPlugin";

    protected magics: PluginMagics = {
        actions: (el) => actions,
    };
}

export default AlpineAstroPlugin.expose();