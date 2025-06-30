import type {
    Alpine,
    DirectiveData,
    DirectiveUtilities,
    MagicUtilities,
    ElementWithXAttributes,
    Stores,
    PluginCallback,
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

    type StoreCallback<K extends keyof Stores = keyof Stores> = () => Stores[K];

    interface Settings { }

    // Reusable entry types
    type MagicEntry<Element extends HTMLElement = HTMLElement> = {
        name: string;
        callback: MagicCallback<Element>;
    };

    type GlobalMagicEntry = {
        name: string;
        callback: (Alpine: Alpine) => unknown;
    };

    type DirectiveEntry<Element extends HTMLElement = HTMLElement> = {
        name: string;
        callback: DirectiveCallback<Element>;
        before?: string;
    };

    type StoreEntry = {
        name: string;
        callback: StoreCallback;
    };

    type BuilderCallback<
        Entry,
        Element extends HTMLElement = HTMLElement,
        TExtends extends object = {},
        TSettings extends AlpinePlugin.Settings = AlpinePlugin.Settings
    > = (
        plugin: AlpinePlugin.Protocol<Element, TExtends, TSettings> & TExtends
    ) => Entry;

    interface Protocol<
        Element extends HTMLElement = HTMLElement,
        TExtends extends object = {},
        TSettings extends AlpinePlugin.Settings = AlpinePlugin.Settings
    > {
        setPluginName(
            name: string
        ): Protocol<Element, TExtends, TSettings> & TExtends;

        setSettings<T extends Partial<TSettings>>(
            settings: T
        ): Protocol<Element, TExtends, TSettings & T> & TExtends;

        getSettings(): TSettings;

        addMagic(
            callback: BuilderCallback<
                { name: string; callback: AlpinePlugin.MagicCallback<Element> },
                Element,
                TExtends,
                TSettings
            >
        ): Protocol<Element, TExtends, TSettings> & TExtends;

        addGlobalMagic(
            callback: BuilderCallback<
                { name: string; callback: (Alpine: Alpine) => unknown },
                Element,
                TExtends,
                TSettings
            >
        ): Protocol<Element, TExtends, TSettings> & TExtends;

        addDirective(
            callback: BuilderCallback<
                {
                    name: string;
                    callback: AlpinePlugin.DirectiveCallback<Element>;
                    before?: string;
                },
                Element,
                TExtends,
                TSettings
            >
        ): Protocol<Element, TExtends, TSettings> & TExtends;

        addStore(
            callback: BuilderCallback<
                { name: string; callback: AlpinePlugin.StoreCallback },
                Element,
                TExtends,
                TSettings
            >
        ): Protocol<Element, TExtends, TSettings> & TExtends;

        extend<T extends Record<string, any>>(
            callback: (
                instance: Protocol<Element, TExtends, TSettings> & TExtends
            ) => T
        ): Protocol<Element, TExtends & T, TSettings> & TExtends & T;

        install(
            Alpine: Alpine
        ): Protocol<Element, TExtends, TSettings> & TExtends;

        toPluginCallback(): PluginCallback;
    }
}

export default class AlpinePluginBuilder<
    TSettings extends AlpinePlugin.Settings = AlpinePlugin.Settings,
    Element extends HTMLElement = HTMLElement,
    TExtends extends object = {}
> extends CallableClass<AlpinePluginBuilder> implements AlpinePlugin.Protocol<Element, TExtends, TSettings> {
    private pluginName: string;
    protected settings: TSettings;

    private directives: AlpinePlugin.DirectiveEntry<Element>[] = [];
    private magics: AlpinePlugin.MagicEntry<Element>[] = [];
    private globalMagics: AlpinePlugin.GlobalMagicEntry[] = [];
    private pluginStore: AlpinePlugin.StoreEntry[] = [];
    private initialized = false;

    protected cast<TNewSettings extends TSettings = TSettings, TNewExtends extends object = TExtends>() {
        return this as unknown as AlpinePlugin.Protocol<Element, TNewExtends, TNewSettings> & TNewExtends;
    }

    constructor(pluginName: string, settings: Partial<TSettings> = {}) {
        super("install");
        this.pluginName = pluginName;
        this.settings = { ...settings } as TSettings;
    }

    static create<
        TSettings extends AlpinePlugin.Settings = AlpinePlugin.Settings,
        Element extends HTMLElement = HTMLElement
    >(pluginName: string, settings: Partial<TSettings> = {}) {
        return new this<TSettings, Element>(pluginName, settings);
    }

    setPluginName(name: string) {
        this.pluginName = name;
        return this.cast();
    }

    getSettings(): TSettings {
        return { ...this.settings };
    }

    setSettings<T extends Partial<TSettings>>(settings: T) {
        this.settings = {
            ...this.settings,
            ...settings,
        } as TSettings & T;

        return this.cast<TSettings & T>();
    }

    addMagic(
        callback: AlpinePlugin.BuilderCallback<AlpinePlugin.MagicEntry<Element>, Element, TExtends, TSettings>
    ) {
        this.magics.push(callback(this.cast()));
        return this.cast();
    }

    addGlobalMagic(
        callback: AlpinePlugin.BuilderCallback<AlpinePlugin.GlobalMagicEntry, Element, TExtends, TSettings>
    ) {
        this.globalMagics.push(callback(this.cast()));
        return this.cast();
    }

    addDirective(
        callback: AlpinePlugin.BuilderCallback<AlpinePlugin.DirectiveEntry<Element>, Element, TExtends, TSettings>
    ) {
        this.directives.push(callback(this.cast()));
        return this.cast();
    }

    addStore(
        callback: AlpinePlugin.BuilderCallback<AlpinePlugin.StoreEntry, Element, TExtends, TSettings>
    ) {
        this.pluginStore.push(callback(this.cast()));
        return this.cast();
    }

    extend<T extends Record<string, any>>(
        callback: (instance: AlpinePlugin.Protocol<Element, TExtends, TSettings> & TExtends) => T
    ) {
        const props = callback(this.cast());

        for (const key in props) {
            Object.defineProperty(this, key, {
                get() {
                    const val = props[key];
                    return typeof val === 'function' ? val.bind(this)() : val;
                },
                configurable: true,
                enumerable: true,
            });
        }

        return this.cast<TSettings, TExtends & T>();
    }

    install(Alpine: Alpine) {
        if (this.initialized) {
            console.warn(`Alpine plugin '${this.pluginName}' already installed.`);
            return this.cast();
        }

        Object.defineProperty(Alpine, this.pluginName, {
            get: () => this.cast(),
        });

        this.pluginStore.forEach(({ name, callback }) => {
            Alpine.store(name, callback());
        });

        this.directives.forEach(({ name, callback, before }) => {
            const directive = Alpine.directive(name, callback as any);
            if (before) directive.before(before);
        });

        this.magics.forEach(({ name, callback }) => {
            Alpine.magic(name, callback as any);
        });

        this.globalMagics.forEach(({ name, callback }) => {
            Object.defineProperty(Alpine, name, {
                get: () => callback(Alpine),
            });
        });

        this.initialized = true;
        return this.cast();
    }

    toPluginCallback() {
        return this as unknown as PluginCallback;
    }
}