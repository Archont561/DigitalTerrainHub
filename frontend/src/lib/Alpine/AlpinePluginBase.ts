import type { Alpine, DirectiveCallback, Stores } from "alpinejs";
import { makeClassCallable } from "@utils";
import { cloneDeep } from "lodash";

type DirectiveEntry = DirectiveCallback | [DirectiveCallback, string];
type MagicCallback = Parameters<Alpine["magic"]>[1];
type StoreCallback<T extends keyof Stores> = (Alpine: Alpine) => Stores[T];
interface AlpinePluginSettings extends Object { }

export type PluginDirectives = Record<string, DirectiveEntry>;
export type PluginMagics = Record<string, MagicCallback>;
export type PluginStore = {
    [K in keyof Stores]: StoreCallback<K>;
};

export default abstract class AlpinePluginBase<TSettings extends AlpinePluginSettings = AlpinePluginSettings> {
    protected abstract PLUGIN_NAME: string;
    protected Alpine!: Alpine;
    private initialized = false;

    static expose<
        T extends new (...args: any[]) => AlpinePluginBase<any>
    >(this: T, ...args: ConstructorParameters<T>) {
        const CallablePlugin = makeClassCallable(this, "install");
        return new CallablePlugin(...args);
    }

    protected afterInstall(Alpine: Alpine) { };

    install(Alpine: Alpine): this {
        if (this.initialized) {
            console.warn(`Alpine ${this.PLUGIN_NAME} has been already initialized!`);
            return this;
        }

        this.Alpine = Alpine;
        Object.defineProperty(Alpine, this.PLUGIN_NAME, {
            get() {
                return this;
            },
        });
        Object.entries(this.directives).forEach(([key, directiveBuilder]) => {
            if (Array.isArray(directiveBuilder)) {
                const [callback, before] = directiveBuilder;
                Alpine.directive(key, callback).before(before);
            } else Alpine.directive(key, directiveBuilder);
        });
        Object.entries(this.magics).forEach(([key, callback]) => {
            Alpine.magic(key, callback);
        });
        Object.entries(this.pluginStore).forEach(([key, callback]) => {
            Alpine.store(key, callback(Alpine));
        });
        this.afterInstall(Alpine);
        this.initialized = true;
        return this;
    }

    protected settings = {} as TSettings;
    setSettings(settings: Partial<TSettings>) {
        for (const key in settings) {
            if (!(key in this.settings)) throw new Error(`Invalid settings property: ${key}`);
            //@ts-ignore
            this.settings[key] = settings[key];
        }
        return this;
    };
    getSettings(): TSettings { return cloneDeep(this.settings) };

    protected directives: PluginDirectives = {};
    protected magics: PluginMagics = {};
    protected pluginStore: PluginStore = {};
}