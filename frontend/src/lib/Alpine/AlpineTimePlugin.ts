import type { Alpine, DirectiveCallback } from 'alpinejs';
import { getRelativeTimeBetweenDates, makeClassCallable } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        timePlugin: AlpineTimePlugin;
    }
    interface Magics<T> {
        $relativeTime: typeof getRelativeTimeBetweenDates;
    }
}

type AlpineMagicCallback = Parameters<Alpine["magic"]>[1];

class AlpineTimePlugin {
    private settings = {
        defaultInterval: 100,
    };

    getSettings() {
        return { ...this.settings };
    }

    install(Alpine: Alpine) {
        this.settings = Alpine.reactive(this.settings);
        Alpine.magic("$relativeTime", this.$relativeTime);
        Alpine.directive("screen", this['x-interval']);
        Object.entries(this.pluginStoreCallbacks).forEach(([key, callback]) => {
            Alpine.store(key, callback(Alpine));
        });
        Alpine.timePlugin = this;
    }

    private $relativeTime: AlpineMagicCallback = () => getRelativeTimeBetweenDates;

    private "x-interval": DirectiveCallback = (el,
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

    private pluginStoreCallbacks: Record<string, (Alpine: Alpine) => any> = {
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

export default new (makeClassCallable(AlpineTimePlugin, "install"));