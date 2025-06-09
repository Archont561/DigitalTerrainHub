export function buildPathname(...segments: (string | number | null | undefined)[]): string {
    return '/' + segments
        .filter(Boolean)
        .map(s => s!.toString().trim().replace(/^\/+|\/+$/g, ''))
        .join('/');
}

export function getURLWithBase(url: string): string {
    return buildPathname(import.meta.env.BASE_URL, url);
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
    : (
        // Exclude keys that are 'pk' | 'endpoints' | 'name'
        & {
            [K in keyof T as K extends "pk" | "endpoints" | "name" ? never : K]:
            T[K] extends object ? URLObject<T[K]> : never
        }
        & (
            T extends { endpoints: readonly string[] }
            ? EndpointMap<T["endpoints"]>
            : {}
        )
    );

import { kebabToCamel } from "@utils";

export function resolveURLTree<T>(config: T, basePath = ""): URLObject<T> {
    const obj: any = {};

    if (Array.isArray((config as any).endpoints)) {
        for (const ep of (config as any).endpoints) {
            // Convert kebab-case endpoint key to camelCase for object keys and URLs
            const key = ep === "" ? "home" : kebabToCamel(ep);
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
            return resolveURLTree({ ...(config as any), pk: undefined }, newBase);
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