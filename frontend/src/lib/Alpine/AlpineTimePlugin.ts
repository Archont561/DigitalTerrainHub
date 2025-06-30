import type { Stores } from "alpinejs";
import AlpinePluginBuilder from "./AlpinePluginBuilder";
import { getRelativeTimeBetweenDates } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        timePlugin: typeof AlpineTimePlugin;
    }
    interface Magics<T> {
        $relativeTime: typeof getRelativeTimeBetweenDates;
    }
    interface Stores {
        globalInterval: {
            interval: number;
            flag: boolean;
            intervalID: ReturnType<typeof setInterval> | null;

            stop(): void;
            init(): void;
            update(): void;
            setIntervalValue(interval: number): void;
            resume(): void;
        };
    }
}

interface TimePluginSettings {
    defaultInterval: number
}

const AlpineTimePlugin = AlpinePluginBuilder.create<TimePluginSettings>("timePlugin", {
    defaultInterval: 100,
}).addMagic((plugin) => ({
    name: "relativeTime",
    callback: () => getRelativeTimeBetweenDates,
})).addStore((plugin) => ({
        name: "globalInterval",
        callback: () => {
            const globalInterval = {
                interval: 1000,
                flag: true,
                intervalID: null as ReturnType<typeof setInterval> | null,

                stop() {
                    if (this.intervalID !== null) clearInterval(this.intervalID);
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
                },
            } as Stores["globalInterval"];

            globalInterval.init();
            return globalInterval;
        },
})).addDirective((plugin) => ({
        name: "interval",
        callback: (el, { modifiers, expression }, { evaluate, cleanup, effect, Alpine }) => {
            const firstModifier = modifiers[0];
            if (firstModifier === "global") {
                const globalInterval = Alpine.store("globalInterval");
                effect(() => {
                    globalInterval.flag;
                    evaluate(expression, { scope: { $globalInterval: globalInterval } });
                });
            } else {
                let intervalID: ReturnType<typeof setInterval>;
                const shouldUseDefaultInterval = !firstModifier || isNaN(Number(firstModifier));
                const settings = plugin.getSettings();

                effect(() => {
                    const interval = shouldUseDefaultInterval
                        ? settings.defaultInterval
                        : parseInt(firstModifier);

                    clearInterval(intervalID);
                    intervalID = setInterval(() => evaluate(expression), interval);
                });

                cleanup(() => {
                    clearInterval(intervalID);
                });
            }
        },
}));

export default AlpineTimePlugin;