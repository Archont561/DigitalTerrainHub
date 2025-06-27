import type { Alpine, DirectiveCallback } from 'alpinejs';
import { makeClassCallable } from "@utils";

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

class AlpineMediaPlugin {
    private settings: MediaSettings = {
        breakpoints: {
            xs: '30rem',   // 480px
            sm: '40rem',   // 640px
            md: '48rem',   // 768px
            lg: '64rem',   // 1024px
            xl: '80rem',   // 1280px
            '2xl': '96rem' // 1536px
        },
        mediaQueriesStorage: new Map(),
    };

    getSettings() {
        return {...this.settings};
    }

    setBreakpoints(breakpoints: Record<string, string>) {
        Object.assign(this.settings.breakpoints, breakpoints);
        return this;
    }

    install(Alpine: Alpine) {
        Alpine.directive("screen", this['x-screen']);
        Alpine.mediaPlugin = this;
    }

    private 'x-screen': DirectiveCallback = (el, { modifiers, expression, value }, { evaluate, cleanup }) => {
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
            { "$mediaQuery": mediaQuery }
        );

        handler({ matches: mediaQuery.matches } as MediaQueryListEvent);

        mediaQuery.addEventListener("change", handler);

        cleanup(() => {
            mediaQuery.removeEventListener("change", handler);
        });
    }

    private getBreakpointValue(value: string): string {
        return value in this.settings.breakpoints
            ? this.settings.breakpoints[value]
            : /^\d+(\.\d+)?$/.test(value)
                ? `${value}px`
                : value;
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

export default new (makeClassCallable(AlpineMediaPlugin, "install"));