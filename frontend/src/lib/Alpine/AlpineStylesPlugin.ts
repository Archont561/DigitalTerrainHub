import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginMagics } from "./AlpinePluginBase";
import { toggleCSSProperty } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        stylesPlugin: AlpineStylesPlugin;
    }
    interface Magics<T> {
        $toggleCSSProperty: typeof toggleCSSProperty;
    }
}


class AlpineStylesPlugin extends AlpinePluginBase {
    protected PLUGIN_NAME = "stylesPlugin";

    protected magics: PluginMagics = {
        $toggleCSSProperty: () => toggleCSSProperty,
    };
}

export default AlpineStylesPlugin.expose();