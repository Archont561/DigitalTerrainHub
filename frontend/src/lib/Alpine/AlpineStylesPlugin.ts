import AlpinePluginBuilder from "./AlpinePluginBuilder";

declare module "alpinejs" {
    interface Alpine {
        stylesPlugin: typeof AlpineStylesPlugin;
    }
    interface Magics<T> {
        $cssProperty: InstanceType<typeof AlpineStylesPlugin.CSSPropertyHandler>;
    }
}



const AlpineStylesPlugin = AlpinePluginBuilder.create("stylesPlugin")
.extend(plugin => ({
    CSSPropertyHandler: class CSSPropertyHandler {
        constructor(private el: HTMLElement) { }
    
        toggle(name: string, value: string) {
            this.has(name) ? this.remove(name) : this.set(name, value);
            return this;
        }
    
        set(name: string, value: string, important = false) {
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
    },
})).addMagic(plugin => ({
    name: "cssProperty",
    callback: (el) => new plugin.CSSPropertyHandler(el),
}));

export default AlpineStylesPlugin;
