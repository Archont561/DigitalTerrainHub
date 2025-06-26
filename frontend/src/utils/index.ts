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

type CallableInstance<T, A extends any[], R> = T & {
    (...args: A): R;
};

export function makeClassCallable<
    T extends { new (...args: any[]): any },
    M extends keyof InstanceType<T> = "call"
>(
    baseClass: T,
    classMethodToCall: M = "call" as M
): new (...args: ConstructorParameters<T>) => CallableInstance<
    InstanceType<T>,
    Parameters<InstanceType<T>[M]>,
    ReturnType<InstanceType<T>[M]>
> {
    const handler: ProxyHandler<any> = {
        get(target, prop, receiver) {
            return Reflect.get(target, prop, receiver);
        },
        apply(target, thisArg, argArray) {
            const method = target[classMethodToCall];
            if (typeof method !== "function") {
                throw new TypeError(`${String(classMethodToCall)} is not a function`);
            }
            return method.apply(target, argArray);
        }
    };

    return class CallableClass extends baseClass {
        constructor(...args: any[]) {
            super(...args);

            // Create callable function delegating to `call()`
            const callable = (...args: any[]) => {
                return handler.apply!(this, this, args);
            };

            Object.setPrototypeOf(callable, this);
            return new Proxy(callable, handler);
        }
    } as any;
}

