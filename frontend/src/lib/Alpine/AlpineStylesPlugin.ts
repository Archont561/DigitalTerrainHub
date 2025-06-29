import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginMagics } from "./AlpinePluginBase";

declare module "alpinejs" {
    interface Alpine {
        stylesPlugin: AlpineStylesPlugin;
    }
    interface Magics<T> {
        $cssProperty: CSSPropertyHandler;
    }
}

class CSSPropertyHandler {
    constructor(private el: HTMLElement) {}

    toggle(name: string, value: string) {
        this.has(name) ? this.remove(name) : this.set(name, value);
        return this;
    }

    set(name: string, value: string, important = false) {
        console.log(name, value)
        this.el.style.setProperty(name, value, important ? "important" : undefined);
        return this;
    }

    isImportant(name: string) {
        return this.el.style.getPropertyPriority(name) === "important";
    }

    remove(name: string) {
        this.el.style.removeProperty(name);
        return this;
    }

    get(name: string) {
        return this.el.style.getPropertyValue(name);
    }

    has(name: string) {
        return !!this.get(name);
    }

    changeElement(el: HTMLElement) {
        this.el = el;
        return this;
    }
};

class AlpineStylesPlugin extends AlpinePluginBase {
    protected PLUGIN_NAME = "stylesPlugin";

    protected magics: PluginMagics = {
        cssProperty: (el) => new CSSPropertyHandler(el),
    };
}

export default AlpineStylesPlugin.expose();