import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginDirectives } from "./AlpinePluginBase";

declare module "alpinejs" {
    interface Alpine {
        mediaPlugin: AlpineMediaPlugin;
    }
}

interface MediaQueryBroadcaster {
    mediaQuery: MediaQueryList;
    callbacks: CallableFunction[];
    
    init(): void;
    broadcast(e: MediaQueryListEvent): void;
    unsubscrbe(callback: CallableFunction): void;
    subscribe(callback: CallableFunction): void;
}

interface MediaSettings {
    breakpoints: Record<string, string>;
}

class AlpineMediaPlugin extends AlpinePluginBase<MediaSettings> {
    protected PLUGIN_NAME = "mediaPlugin";
    private mediaQueriesStorage = new Map<string, MediaQueryBroadcaster>();

    protected settings = {
        breakpoints: {
            xs: '30rem',   // 480px
            sm: '40rem',   // 640px
            md: '48rem',   // 768px
            lg: '64rem',   // 1024px
            xl: '80rem',   // 1280px
            '2xl': '96rem' // 1536px
        },
    } as MediaSettings;

    setBreakpoints(breakpoints: Record<string, string>) {
        Object.assign(this.settings.breakpoints, breakpoints);
        return this;
    }

    protected directives: PluginDirectives = {
        screen: (el, { expression, value }, { evaluate, cleanup }) => {
            if (value.trim() === "") {
                throw new Error("x-screen directive must have value defined!");
            }

            const mediaQueryString = (() => {
                if (value.includes("-")) {
                    const [minBreakpoint, maxBreakpoint] = value.split("-").map(this.getBreakpointValue.bind(this));
                    return `(min-width: ${minBreakpoint}) and (max-width: calc(${maxBreakpoint} - 0.02px))`;
                } else {
                    return `(min-width: ${this.getBreakpointValue(value)})`;
                }
            })();

            const callback = (mediaQuery: MediaQueryList) => {
                evaluate(expression, { scope: { "$mediaQuery": mediaQuery } });
            };

            const mediaQueryBroadcaster = this.getMediaQueryBroadcaster(mediaQueryString);
            mediaQueryBroadcaster.subscribe(callback);

            cleanup(() => {
                mediaQueryBroadcaster.unsubscrbe(callback);
            });
        }
    }

    private normalizeLength(length: number | string): string {
        if (typeof length === "number"
            || (typeof length === "string" && (/^\d+(\.\d+)?$/.test(length)))) {
            return `${length}px`;
        }
        return length;
    }

    private replaceBreakpointAliases(expr: string): string {
        return expr.replace(/\b([a-zA-Z_][\w-]*)\b/g, (match) => {
            // Only replace if alias exists in breakpoints
            if (match in this.settings.breakpoints) {
                return this.normalizeLength(this.settings.breakpoints[match]);
            }
            return match;
        });
    };

    private getBreakpointValue(value: string): string {
        if (/^calc\(.+\)$/.test(value.trim())) {
            // Extract inside of calc() and replace aliases
            const insideCalc = value.trim().slice(5, -1); // remove 'calc(' and ')'
            const replaced = this.replaceBreakpointAliases(insideCalc);
            return `calc(${replaced})`;
        }

        const toReturn = value in this.settings.breakpoints ? 
            this.settings.breakpoints[value] : value;

        return this.normalizeLength(toReturn);
    }

    private getMediaQueryBroadcaster(query: string) {
        return this.mediaQueriesStorage.has(query) 
            ? this.mediaQueriesStorage.get(query)! 
            : this.registerMediaQueryBroadcaster(query);
    }

    private registerMediaQueryBroadcaster(query: string) {
        const mediaQueriesStorage = this.mediaQueriesStorage;
        const mediaQueryBroadcaster: MediaQueryBroadcaster = {
            mediaQuery: window.matchMedia(query),
            callbacks: [],

            init() {
                this.mediaQuery.addEventListener("change", this.broadcast.bind(this));
            },

            subscribe(callback) {
                this.callbacks.push(callback);
                this.mediaQuery.matches && callback(this.mediaQuery)
            },

            unsubscrbe(callback) {
                const i =  this.callbacks.findIndex(el => el === callback);
                if (i !== -1) {
                    this.callbacks.splice(i, 1);
                }
                if (!this.callbacks.length) {
                    this.mediaQuery.removeEventListener("change", this.broadcast.bind(this));
                    mediaQueriesStorage.delete(query);
                }
            },

            broadcast(e) {
                this.callbacks.forEach(callback => callback(this.mediaQuery));
            },
        };
        mediaQueryBroadcaster.init();
        this.mediaQueriesStorage.set(query, mediaQueryBroadcaster);
        return mediaQueryBroadcaster;
    }

}

export default AlpineMediaPlugin.expose();