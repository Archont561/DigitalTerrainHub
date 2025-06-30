import type {
    Alpine,
    DirectiveData,
    DirectiveUtilities,
    MagicUtilities,
    ElementWithXAttributes,
    Stores,
    PluginCallback
} from "alpinejs";
import { CallableClass } from "@utils";

export declare namespace AlpinePlugin {
    type DirectiveCallback<T extends HTMLElement = HTMLElement> = (
        el: ElementWithXAttributes<T>,
        directive: DirectiveData,
        utilities: DirectiveUtilities
    ) => void;
    
    interface MagicCallback<T extends HTMLElement = HTMLElement> {
        (el: ElementWithXAttributes<T>, options: MagicUtilities): void;
    }
    
    type StoreCallback<K extends keyof Stores> = () => Stores[K];
    
    interface Settings { }
    interface Protocol {
        install: PluginCallback;
    }
    
    interface API<T extends Settings = Settings, E extends HTMLElement = HTMLElement> {
        addMagic(name: string, callback: MagicCallback<E>): this;
        addGlobalMagic(name: string, callback: (Alpine: Alpine) => unknown): this;
        addDirective(name: string, callback: DirectiveCallback<E>, before?: string): this;
        addStore<K extends keyof Stores>(name: K, callback: StoreCallback<K>): this;
        addSettings(settings: Partial<T>): this;
    }
}


export default abstract class AlpinePluginBase<
    TSettings extends AlpinePlugin.Settings = AlpinePlugin.Settings,
    Element extends HTMLElement = HTMLElement
> extends CallableClass<AlpinePluginBase> implements AlpinePlugin.Protocol {

    static expose<T extends AlpinePluginBase<any>>(this: new () => T): T & PluginCallback {
        return new this() as T & PluginCallback;
    }
    
    public constructor() { super("install") }

    protected abstract PLUGIN_NAME: string;
    protected abstract configure(api: AlpinePlugin.API<TSettings, Element>): void;

    readonly install = (Alpine: Alpine) => {
        if (this.initialized) {
            console.warn(`Alpine ${this.PLUGIN_NAME} has been already initialized!`);
            return this;
        }
        this.configure(this.api());

        Object.defineProperty(Alpine, this.PLUGIN_NAME, {
            get() { return this; },
        });

        this.pluginStore.map(([name, callback]) => {
            Alpine.store(name, callback());
        });
        this.directives.map(([name, callback, before]) => {
            const directive = Alpine.directive(name, callback);
            before && directive.before(before);
        });
        this.magics.map(([name, callback]) => {
            Alpine.magic(name, callback);
        });
        this.globalMagics.map(([name, callback]) => {
            Object.defineProperty(Alpine, name, {
                get() { return callback(Alpine); },
            });
        });

        this.initialized = true;
        return this;
    }

    protected readonly settings = {} as TSettings;
    private initialized = false;
    private directives: [string, AlpinePlugin.DirectiveCallback, string | undefined][] = []
    private magics: [string, AlpinePlugin.MagicCallback][] = [];
    private globalMagics: [string, (Alpine: Alpine) => unknown][] = [];
    private pluginStore: [keyof Stores, () => Stores[keyof Stores]][] = [];

    private api() {
        const self = this;
        return {
            addMagic(name, callback: any) {
                self.magics.push([name, callback]);
                return this;
            },
            addGlobalMagic(name, callback) {
                self.globalMagics.push([`$${name}`, callback]);
                return this;
            },
            addDirective(name, callback: any, before?) {
                self.directives.push([name, callback, before]);
                return this;
            },
            addStore(name, callback) {
                self.pluginStore.push([name, callback]);
                return this;
            },
            addSettings(settings) {
                Object.assign(self.settings, settings);
                return this;
            },
        } as AlpinePlugin.API<TSettings, Element>;
    }
}