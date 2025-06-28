import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginDirectives } from "./AlpinePluginBase";

declare module "alpinejs" {
    interface Alpine {
        mediaPlugin: AlpineMediaPlugin;
    }
}

type MediaQueryEventTriggerMode = "change" | "match" | "noMatch";

interface MediaSettings {
    breakpoints: Record<string, string>;
    mediaQueriesStorage: Map<string, MediaQueryList>;
}

class AlpineMediaPlugin extends AlpinePluginBase<MediaSettings> {
    protected PLUGIN_NAME = "mediaPlugin";
    protected settings = {
        breakpoints: {
            xs: '30rem',   // 480px
            sm: '40rem',   // 640px
            md: '48rem',   // 768px
            lg: '64rem',   // 1024px
            xl: '80rem',   // 1280px
            '2xl': '96rem' // 1536px
        },
        mediaQueriesStorage: new Map(),
    } as MediaSettings;

    setBreakpoints(breakpoints: Record<string, string>) {
        Object.assign(this.settings.breakpoints, breakpoints);
        return this;
    }

    protected directives: PluginDirectives = {
        screen: (el, { modifiers, expression, value }, { evaluate, cleanup }) => {
            let mediaQueryString: string;
            let mediaQueryTriggerMode: MediaQueryEventTriggerMode = "change";

            if (value.includes("-")) {
                const [minBreakpoint, maxBreakpoint] = value.split("-").map(this.getBreakpointValue.bind(this));
                mediaQueryString = `(min-width: ${minBreakpoint}) and (max-width: calc(${maxBreakpoint} - 0.02px))`;
                mediaQueryTriggerMode = "match";
            } else {
                mediaQueryString = `(min-width: ${this.getBreakpointValue(value)})`;
                if (modifiers.includes("larger")) mediaQueryTriggerMode = "match";
                if (modifiers.includes("smaller")) mediaQueryTriggerMode = "noMatch";
            }

            const mediaQuery = this.getMediaQuery(mediaQueryString);

            const handler = this.createMediaQueryHandler(
                mediaQueryTriggerMode,
                evaluate,
                expression,
                { scope: { "$mediaQuery": mediaQuery } }
            );

            handler({ matches: mediaQuery.matches } as MediaQueryListEvent);

            mediaQuery.addEventListener("change", handler);

            cleanup(() => {
                mediaQuery.removeEventListener("change", handler);
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

    private getMediaQuery(query: string): MediaQueryList {
        const storage = this.settings.mediaQueriesStorage;
        if (!storage.has(query)) {
            storage.set(query, window.matchMedia(query));
        }
        return storage.get(query)!;
    }

    private createMediaQueryHandler(mode: MediaQueryEventTriggerMode, callback: CallableFunction, ...args: any[]) {
        if (mode === "change") return (e: MediaQueryListEvent) => callback(...args);
        if (mode === "match") return (e: MediaQueryListEvent) => e.matches && callback(...args);
        if (mode === "noMatch") return (e: MediaQueryListEvent) => !e.matches && callback(...args);
        throw new Error(`Invalid MediaQueryEventTriggerMode: ${mode}`);
    }

}

export default AlpineMediaPlugin.expose();