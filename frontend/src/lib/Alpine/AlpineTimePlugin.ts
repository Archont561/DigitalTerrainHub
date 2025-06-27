import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginDirectives, PluginMagics, PluginStore } from "./AlpinePluginBase";
import { getRelativeTimeBetweenDates } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        timePlugin: AlpineTimePlugin;
    }
    interface Magics<T> {
        $relativeTime: typeof getRelativeTimeBetweenDates;
    }
}

interface TimeSettings {
    defaultInterval: number,
}

class AlpineTimePlugin extends AlpinePluginBase<TimeSettings> {
    protected PLUGIN_NAME = "timePlugin";

    protected settings = {
        defaultInterval: 100,
    } as TimeSettings;

    protected magics: PluginMagics = {
        relativeTime: () => getRelativeTimeBetweenDates,
    };

    protected directives: PluginDirectives = {
        interval: (el,
            { modifiers, expression },
            { evaluate, cleanup, effect, Alpine }
        ) => {
            const firstModifier = modifiers.at(0);
            if (firstModifier === "global") {
                const globalInterval = Alpine.store('globalInterval') as alpine.GlobalIntervalStore;
                effect(() => {
                    globalInterval.flag;
                    evaluate(expression, { "$globalInterval": globalInterval });
                });
            } else {
                let intervalID: ReturnType<typeof setInterval>;
                const shouldUseDefaultInterval = !firstModifier || isNaN(Number(firstModifier));
    
                effect(() => {
                    const interval = shouldUseDefaultInterval
                        ? this.settings.defaultInterval
                        : parseInt(firstModifier);
    
                    clearInterval(intervalID);
                    intervalID = setInterval(evaluate, interval, expression);
                });
                
                cleanup(() => {
                    clearInterval(intervalID);
                });
    
            }
        }
    }

    protected pluginStore: PluginStore = {
        globalInterval: () => {
            const globalInterval =  {
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
            } as alpine.GlobalIntervalStore;

            globalInterval.init();
            return globalInterval;
        },
    }
}

export default AlpineTimePlugin.expose();