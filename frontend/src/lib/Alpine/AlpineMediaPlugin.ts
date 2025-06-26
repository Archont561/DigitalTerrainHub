import type { Alpine } from 'alpinejs';

type MediaQueryEventTriggerMode = "change" | "match" | "noMatch";
interface MediaSettings {
    breakpoints: Record<string, string>;
    mediaQueriesStorage: Map<string, MediaQueryList>;
}

mediaPlugin.settings = Object.freeze({
    breakpoints: {
        xs: '30rem',   // 480px
        sm: '40rem',   // 640px
        md: '48rem',   // 768px
        lg: '64rem',   // 1024px
        xl: '80rem',   // 1280px
        '2xl': '96rem' // 1536px
    },
    mediaQueriesStorage: new Map(),
} as MediaSettings);

mediaPlugin.setBreakpoints = function(breakpoints: Record<string, string>) {
    Object.assign(mediaPlugin.settings.breakpoints, breakpoints);
    return mediaPlugin;
};

export default function mediaPlugin(Alpine: Alpine) {
    Alpine.directive("screen", (el, { modifiers, expression, value }, { evaluate, cleanup }) => {
        let mediaQueryString;
        let mediaQueryTriggerMode = "change" as MediaQueryEventTriggerMode;

        if (value.includes("-")) {
            // Range breakpoint like "md-lg"
            const [minBreakpoint, maxBreakpoint] = value.split("-").map(getBreakpointValue);
            // max-width just less than maxBreakpoint to avoid overlap
            mediaQueryString = `(min-width: ${minBreakpoint}) and (max-width: calc(${maxBreakpoint} - 0.02px))`;
            mediaQueryTriggerMode = "match";
        } else {
            // Single breakpoint
            mediaQueryString = `(min-width: ${getBreakpointValue(value)})`;
            if (modifiers.includes("larger")) mediaQueryTriggerMode = "match";
            if (modifiers.includes("smaller")) mediaQueryTriggerMode = "noMatch";
        }

        const mediaQuery = getMediaQuery(mediaQueryString);

        const handler = createMediaQueryHandler(
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
    });
}

function getBreakpointValue(value: string): string {
    // Check Tailwind key first
    if (value in mediaPlugin.settings.breakpoints) {
        return mediaPlugin.settings.breakpoints[value];
    }

    // Check if numeric (integer or float)
    if (/^\d+(\.\d+)?$/.test(value)) {
        return `${value}px`;
    }

    // Otherwise assume already CSS length with units
    return value;
}

function getMediaQuery(query: string): MediaQueryList {
    const storage = mediaPlugin.settings.mediaQueriesStorage;
    if (!storage.has(query)) {
        storage.set(query, window.matchMedia(query));
    }
    return storage.get(query)!;
}

function createMediaQueryHandler(mediaQueryTriggerMode: MediaQueryEventTriggerMode, callback: CallableFunction, ...calbackArgs: any[]) {
    if (mediaQueryTriggerMode === "change") return (e: MediaQueryListEvent) => callback(...calbackArgs);
    else if (mediaQueryTriggerMode === "match") return (e: MediaQueryListEvent) => e.matches && callback(...calbackArgs);
    else if (mediaQueryTriggerMode === "noMatch") return (e: MediaQueryListEvent) => !e.matches && callback(...calbackArgs);
    throw new Error(`Invalid value: ${mediaQueryTriggerMode}`);
}