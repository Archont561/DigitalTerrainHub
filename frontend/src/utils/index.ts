import _ from "lodash";

export * from "./time";
export * from "./url";
export * from "./html";

export function createCSSVarName(...parts: string[]) {
    return `--${_.filter(parts, Boolean).map(part => _.kebabCase(part)).join("-")}`;
}

export function toTitleCase(str: string) {
    return _.startCase(_.toLower(str));
}

type CallableMethods<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export abstract class CallableClass<T> extends Function {
    constructor(methodName: keyof T & string) {
        super()
        return new Proxy(this, {
            apply: (target, thisArg, args) => (target as any)[methodName](...args)
        });
    }
}


export function getOrCreateStylesheet(href: string) {
    let link = document.querySelector(`link[href=${href}]`) as HTMLLinkElement | null;
    if (link) return link;

    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => console.log(`Stylesheet loaded: ${href}`);
    link.onerror = () => console.error(`Failed to load stylesheet: ${href}`);
    document.appendChild(link);
    return link;
}
