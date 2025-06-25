import _ from "lodash";
import { DateTime } from "luxon";

export function buildPathname(...segments: (string | number | null | undefined)[]): string {
    return '/' + segments
        .filter(Boolean)
        .map(s => s!.toString().trim().replace(/^\/+|\/+$/g, ''))
        .join('/');
}

export function getURLWithBase(url: string): string {
    return buildPathname(import.meta.env.ASTRO_BASE_URL, url);
}

export function getURLWithBaseIfDev(url: string): string {
    return import.meta.env.DEV ? getURLWithBase(url) : url;
}

export function resolveURL(strings: TemplateStringsArray, ...expressions: any[]) {
    const result = [strings[0]];
    expressions.forEach((expr, i) => {
        result.push(expr + strings[i + 1]);
    });
    return buildPathname(...result);
}

export function resolveURLWithBase(strings: TemplateStringsArray, ...expressions: any[]) {
    return buildPathname(import.meta.env.BASE_URL, resolveURL(strings, ...expressions));
}

type KebabToCamel<S extends string> =
    S extends `${infer Head}-${infer Tail}`
    ? `${Head}${Capitalize<KebabToCamel<Tail>>}`
    : S;

type EndpointFunction = () => string;

type EndpointMap<T extends readonly string[]> = {
    [K in T[number]as K extends "" ? "home" : KebabToCamel<K>]: EndpointFunction;
};

type URLObject<T> =
    T extends { pk: string }
    ? (pkValue: string | number) => URLObject<Omit<T, "pk">>
    : {
        self: EndpointFunction;
    } & {
        [K in keyof T as K extends "pk" | "endpoints" | "name" ? never : K]:
        T[K] extends object ? URLObject<T[K]> : never;
    } & (T extends { endpoints: readonly string[] }
        ? EndpointMap<T["endpoints"]>
        : {});

export function resolveURLTree<T>(config: T, basePath = ""): URLObject<T> {
    const obj: any = {};

    if (Array.isArray((config as any).endpoints)) {
        for (const ep of (config as any).endpoints) {
            // Convert kebab-case endpoint key to camelCase for object keys and URLs
            const key = ep === "" ? "home" : _.camelCase(ep);
            if (ep === "") {
                obj["home"] = () => resolveURL`${basePath}`;
            } else {
                const url = basePath.length > 1 ? resolveURL`${basePath}/${key}` : resolveURL`${key}`;
                obj[key] = () => url;
            }
        }
    }

    if (typeof (config as any).pk === "string") {
        return ((pkValue: string | number) => {
            const newBase = resolveURL`${basePath}/${pkValue}`;
            const resolved = resolveURLTree({ ...(config as any), pk: undefined }, newBase);
            return {
                ...resolved,
                self: () => newBase,
            };
        }) as any;
    }

    for (const key of Object.keys(config as any)) {
        if (key === "endpoints" || key === "pk" || key === "name") continue;
        const val = (config as any)[key];
        if (typeof val === "object" && val !== null) {
            obj[key] = resolveURLTree(val, `${basePath}/${key}`);
        }
    }

    return obj;
}

export function createCSSVarName(...parts: string[]) {
    return `--${_.filter(parts, Boolean).map(part => _.kebabCase(part)).join("-")}`;
};

export function toTitleCase(str: string) {
    return _.startCase(_.toLower(str));
};

interface RelativeTimeOptions {
    locale?: string;
    zone?: string;
    calendar?: boolean;
    format?: string;
}
export function getRelativeTimeBetweenDates(fromInput: any, toInput: any = DateTime.now(), options: RelativeTimeOptions = {}) {
    function parse(input: any) {
        if (typeof input === 'string') {
            let dt = DateTime.fromISO(input);
            if (!dt.isValid) dt = DateTime.fromRFC2822(input);
            if (!dt.isValid && options.format)
                dt = DateTime.fromFormat(input, options.format);
            return dt;
        } else if (typeof input === 'number') {
            return input > 1e12
                ? DateTime.fromMillis(input)
                : DateTime.fromSeconds(input);
        } else if (input instanceof Date) {
            return DateTime.fromJSDate(input);
        } else if (DateTime.isDateTime(input)) {
            return input;
        } else {
            return DateTime.invalid("Unsupported input");
        }
    }

    const from = parse(fromInput);
    const to = parse(toInput);

    if (!from.isValid || !to.isValid) return 'Invalid date(s)';

    if (options.zone) to.setZone(options.zone);
    if (options.locale) to.setLocale(options.locale);

    return options.calendar
        ? to.toRelativeCalendar({ base: from })
        : to.toRelative({ base: from });
}
