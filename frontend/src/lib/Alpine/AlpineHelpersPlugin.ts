import type { Alpine } from "alpinejs";
import { getRelativeTimeBetweenDates } from "@utils";

declare module "alpinejs" {
    interface Magics<T> {
        $find: FindMagic;
        $relativeTime: typeof getRelativeTimeBetweenDates;
    }
}

type FindMagic = {
    <T extends Element = Element>(query: string): T | null;
    inside: <T extends Element = Element>(query: string) => T | null;
    closest: <T extends Element = Element>(query: string) => T | null;
    exists: (query: string) => boolean;
    count: (query: string) => number;
    text: (query: string) => string;
    attr: (query: string, attr: string) => string | null;
    all: {
        <T extends Element = Element>(query: string): NodeListOf<T>;
        inside: <T extends Element = Element>(query: string) => NodeListOf<T>;
    };
};

export default function (Alpine: Alpine) {
    Alpine.magic("find", el => {
        const find = ((query: string) => document.querySelector(query)) as FindMagic;

        find.inside = (query: string) => el.querySelector(query);
        find.closest = (query: string) => el.closest(query);

        const all = ((query: string) => document.querySelectorAll(query)) as FindMagic["all"];
        all.inside = (query: string) => el.querySelectorAll(query);
        find.all = all;

        find.exists = (query: string) => !!find(query);
        find.count = (query: string) => find.all(query).length;
        find.text = (query: string) => find(query)?.textContent ?? '';
        find.attr = (query: string, attr: string) => find(query)?.getAttribute(attr) ?? null;

        return find;
    });
    Alpine.magic("relativeTime", () => getRelativeTimeBetweenDates);

    Alpine.directive("interval", (el, { modifiers, expression }, { evaluate, cleanup }) => {
        if (modifiers.length !== 1) throw new Error("Directive 'x-interval' should have interval duration defined as modifier");

        const intervalID = setInterval(evaluate, parseInt(modifiers[0]), expression);
        cleanup(() => {
            clearInterval(intervalID);
        });
    });

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

const tailwindcssBreakpoints = {
    xs: '30rem',   // 480px
    sm: '40rem',   // 640px
    md: '48rem',   // 768px
    lg: '64rem',   // 1024px
    xl: '80rem',   // 1280px
    '2xl': '96rem' // 1536px
} as Record<string, string>;

function getBreakpointValue(value: string): string {
    // Check Tailwind key first
    if (value in tailwindcssBreakpoints) {
        return tailwindcssBreakpoints[value];
    }

    // Check if numeric (integer or float)
    if (/^\d+(\.\d+)?$/.test(value)) {
        return `${value}px`;
    }

    // Otherwise assume already CSS length with units
    return value;
}

const mediaQueryCache = new Map<string, MediaQueryList>();

function getMediaQuery(query: string): MediaQueryList {
    if (!mediaQueryCache.has(query)) {
        mediaQueryCache.set(query, window.matchMedia(query));
    }
    return mediaQueryCache.get(query)!;
}

type MediaQueryEventTriggerMode = "change" | "match" | "noMatch";

function createMediaQueryHandler(mediaQueryTriggerMode: MediaQueryEventTriggerMode, callback: CallableFunction, ...calbackArgs: any[]) {
    if (mediaQueryTriggerMode === "change") return (e: MediaQueryListEvent) => callback(...calbackArgs);
    else if (mediaQueryTriggerMode === "match") return (e: MediaQueryListEvent) => e.matches && callback(...calbackArgs);
    else if (mediaQueryTriggerMode === "noMatch") return (e: MediaQueryListEvent) => !e.matches && callback(...calbackArgs);
    throw new Error(`Invalid value: ${mediaQueryTriggerMode}`);
}