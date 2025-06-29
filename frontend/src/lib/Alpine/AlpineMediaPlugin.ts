import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginDirectives } from "./AlpinePluginBase";

declare module "alpinejs" {
    interface Alpine {
        mediaPlugin: AlpineMediaPlugin;
    }
}

interface MediaQueryObj {
    mediaQuery: MediaQueryList;
    directivesThatUsesQuery: number;
    reactive: {
        matches: boolean;
    };
    cleanup(): void;
}

interface MediaSettings {
    breakpoints: Record<string, string>;
}

class AlpineMediaPlugin extends AlpinePluginBase<MediaSettings> {
    protected PLUGIN_NAME = "mediaPlugin";
    private mediaQueriesStorage = new Map<string, MediaQueryObj>();

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
        screen: (el, { expression, value }, { evaluate, cleanup, effect }) => {
            const mediaQueryString = (() => {
                if (value.includes("-")) {
                    const [minBreakpoint, maxBreakpoint] = value.split("-").map(this.getBreakpointValue.bind(this));
                    return `(min-width: ${minBreakpoint}) and (max-width: calc(${maxBreakpoint} - 0.02px))`;
                } else {
                    return `(min-width: ${this.getBreakpointValue(value)})`;
                }
            })();

            const mediaQueryObj = this.getMediaQueryObj(mediaQueryString);

            effect(() => {
                mediaQueryObj.reactive.matches;
                evaluate(expression, { scope: { $mediaQuery: mediaQueryObj.mediaQuery } });
            });

            cleanup(() => {
                mediaQueryObj.directivesThatUsesQuery--;
                mediaQueryObj.cleanup();
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

    private getMediaQueryObj(query: string) {
        const mediaQueryObj = this.mediaQueriesStorage.has(query) 
            ? this.mediaQueriesStorage.get(query)! 
            : this.registerMediaQuery(query);
        mediaQueryObj.directivesThatUsesQuery++;
        return mediaQueryObj;
    }

    private registerMediaQuery(query: string) {
        const mediaQuery = window.matchMedia(query);
        // Create reactive proxy with initial matches state
        const reactiveMediaQueryMatches = this.Alpine.reactive({ matches: mediaQuery.matches });
        reactiveMediaQueryMatches

        // Update reactive state on native media query change event
        const listener = (e: MediaQueryListEvent) => {
            reactiveMediaQueryMatches.matches = e.matches;
        };
        mediaQuery.addEventListener("change", listener);
        
        const mediaQueriesStorage = this.mediaQueriesStorage;
        const mediaQueryObj: MediaQueryObj = {
            mediaQuery,
            directivesThatUsesQuery: 0,
            reactive: reactiveMediaQueryMatches,
            cleanup() {
                if (!this.directivesThatUsesQuery) {
                    mediaQuery.removeEventListener("change", listener);
                    mediaQueriesStorage.delete(query);
                }
            },
        };
        this.mediaQueriesStorage.set(query, mediaQueryObj);
        return mediaQueryObj;
    }

}

export default AlpineMediaPlugin.expose();