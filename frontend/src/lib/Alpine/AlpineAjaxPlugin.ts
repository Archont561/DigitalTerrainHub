import type {
    Alpine,
    DirectiveData,
    DirectiveUtilities,
    ElementWithXAttributes,
} from 'alpinejs';
import { isEqual } from "lodash";
import { replaceElementContent, replaceElement } from "@utils";

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type SwapStrategy = "after" | "append" | "before" | "inside" | "none" | "prepend" | "replace" | "delete";

type AjaxAlpineElement<T extends HTMLElement> = ElementWithXAttributes<T> & {
    _x_ajax_headers?: Record<string, any>;
    _x_ajax_target?: T;
    _x_ajax_swap_strategy?: SwapStrategy;
    _x_ajax_values?: Record<string, any>;
    _x_ajax_eventSource?: EventSource;
    _x_ajax_magic_previous?: { 
        ajaxURL: string;
        ajaxOptions: AjaxMagicsOptions;
        ajaxHandler: CallableFunction;
    };
};

type AjaxDirectiveCallback = (
    el: AjaxAlpineElement<HTMLElement>,
    directive: DirectiveData,
    utilities: DirectiveUtilities
) => {};

interface AjaxMagicsOptions {
    method?: HTTPMethod;
    target?: HTMLElement;
    swapStrategy?: SwapStrategy;
    headers?: Record<string, any>;
    values?: Record<string, any>;
}

type AjaxMagicFunction = {
    (ajaxURL: string, ajaxOptions?: AjaxMagicsOptions): void;
} & {
    [M in Lowercase<HTTPMethod> | HTTPMethod]: AjaxMagicFunction & {
        [S in SwapStrategy]: AjaxMagicFunction;
    };
};

interface AjaxSettings {
    headers: Record<string, any>;
    swapStrategy: SwapStrategy;
    transitions: boolean;
    defaultListenerDelay: number;
}

declare module "alpinejs" {
    interface Magics<T> {
        $ajax: AjaxMagicFunction;
    }
}

const DEFAULT_AJAX_HEADERS = {
    "X-Alpine-Ajax-Request": true
}

const settings = {
    headers: {},
    swapStrategy: "replace",
    transitions: false,
    defaultListenerDelay: 300,
} as AjaxSettings;

ajaxPlugin.setSettings = function (options: Partial<AjaxSettings>) {
    Object.entries(options).forEach(([key, value]) => {
        if (!(key in settings)) throw new Error(`Invalid settings property: ${key}`);
        //@ts-ignore
        settings[key] = value;
    });
    return ajaxPlugin;
}

export default function ajaxPlugin(Alpine: Alpine) {
    Alpine.directive("ajax", function (
        el, { value, modifiers, expression }, { Alpine, effect, cleanup, evaluateLater, evaluate }
    ) {
        const method = modifiers.find(modifier => ["get", "put", "post", "delete", "patch"].includes(modifier.toLowerCase())) || "get";
        const ajaxHandler = createAjaxHandler(el, method.toUpperCase(), el.hasAttribute("x-jsonify"));

        if (value) {
            const ajaxURL = evaluate(expression) as URLString;
            if (value === "load") {
                Alpine.nextTick(() => {
                    ajaxHandler(ajaxURL);
                })
            } else {
                const shouldDebounce = modifiers.includes("debounce");
                const shouldThrottle = modifiers.includes("throttle");
                const eventListenerModifier = shouldDebounce
                    ? Alpine.debounce
                    : shouldThrottle
                        ? Alpine.throttle
                        : (func: CallableFunction) => func();
                const delay = getDelay(modifiers.find(modifier => /^\d+(ms|s)?$/.test(modifier)));
                const listener = () => eventListenerModifier(() => ajaxHandler(ajaxURL), delay);

                el.addEventListener(value, listener);
                cleanup(() => {
                    el.removeEventListener(value, listener);
                });
            }
        } else {
            const getAjaxURL = evaluateLater(expression);
            effect(() => {
                getAjaxURL(ajaxURL => {
                    ajaxHandler(ajaxURL as URLString);
                });
            });
        }
    } as AjaxDirectiveCallback).before("ajax-sse");

    Alpine.directive("ajax-headers", function (
        el, { expression }, { evaluate }
    ) {
        el._x_ajax_headers = JSON.parse(evaluate(expression));
    } as AjaxDirectiveCallback).before("ajax");

    Alpine.directive("ajax-target", function (
        el, { value, modifiers, expression }, { evaluate }
    ) {
        let from = document.querySelector;
        if (value === "closest") from = el.closest;
        else if (value === "child") from = el.querySelector;
        el._x_ajax_target = (from(evaluate(expression) as string) || el) as HTMLElement;
        el._x_ajax_swap_strategy = (modifiers.at(0) || settings.swapStrategy) as SwapStrategy;
    } as AjaxDirectiveCallback).before("ajax");

    Alpine.directive("ajax-values", function (
        el, { expression, value }, { evaluate }
    ) {
        const values = JSON.parse(evaluate(expression) || "");
        if (value === "append") {
            el._x_ajax_values = Object.assign(el._x_ajax_values || {}, values);
        } else {
            el._x_ajax_values = values;
        }
    } as AjaxDirectiveCallback).before("ajax");

    Alpine.directive('ajax-sse', function (el,
        { value, expression },
        { cleanup, evaluate }
    ) {
        if (!value) {
            const source = el._x_ajax_eventSource = new EventSource(evaluate(expression));
            source.onerror = error => {
                if (!dispatch(el, 'ajax-sse:error', { detail: { error } })) return;
                console.error(`SSE Error: ${error}`);
            };

            cleanup(() => {
                source.close();
            });
        } else {
            const handler = (() => {
                const hasTarget = el.getAttributeNames().some(attr => attr.startsWith("x-ajax-target"));
                const isExpressionEmpty = expression.trim() === "";

                if (!isExpressionEmpty) return (event: MessageEvent) => evaluate(expression, { $sse: event, $swap: swap });

                if (hasTarget) return (event: MessageEvent) => swap(
                    el._x_ajax_target as HTMLElement,
                    el._x_ajax_swap_strategy as SwapStrategy,
                    event.data
                );

                return (event: MessageEvent) => swap(el, "replace", event.data);
            })();

            const closestSSEAjaxAlpineElement = el.closest("[x-ajax-sse]") as AjaxAlpineElement<HTMLElement>;
            const source = closestSSEAjaxAlpineElement._x_ajax_eventSource;
            if (!source) {
                throw new Error('No event source specified!');
            }

            source.addEventListener(value, handler);
            cleanup(() => {
                source.removeEventListener(value, handler);
            });
        }
    } as AjaxDirectiveCallback);

    Alpine.magic("ajax", (el: AjaxAlpineElement<HTMLElement>) => {
        function ajax(ajaxURL: string, ajaxOptions: AjaxMagicsOptions = {}) {
            if (
                el._x_ajax_magic_previous && 
                isEqual(ajaxURL, el._x_ajax_magic_previous.ajaxURL) &&
                isEqual(ajaxOptions, el._x_ajax_magic_previous.ajaxOptions)
            ) {
                el._x_ajax_magic_previous.ajaxHandler(Alpine.evaluate(el, ajaxURL));
                return;
            }

            ajaxOptions.target && (el._x_ajax_target = ajaxOptions.target);
            ajaxOptions.headers && (el._x_ajax_headers = ajaxOptions.headers);
            ajaxOptions.swapStrategy && (el._x_ajax_swap_strategy = ajaxOptions.swapStrategy);
            ajaxOptions.values && (el._x_ajax_values = ajaxOptions.values);

            const method = (ajaxOptions.method?.toUpperCase() || "GET") as HTTPMethod;
            const shouldJsonify = el.hasAttribute("x-jsonify");
            const ajaxHandler = createAjaxHandler(el, method, shouldJsonify);
            el._x_ajax_magic_previous = { ajaxURL, ajaxOptions, ajaxHandler };
            ajaxHandler(Alpine.evaluate(el, ajaxURL));
        }

        const httpMethods = ["get", "post", "put", "delete", "patch"];
        const swapStrategies = ["after", "append", "before", "inside", "none", "prepend", "replace", "delete"];

        httpMethods.forEach(method => {
            //@ts-ignore
            const ajaxMethod = ajax[method] = ajax[method.toUpperCase()] = (ajaxURL, ajaxOptions = {}) =>
                ajax(ajaxURL, { ...ajaxOptions, method: method.toUpperCase() as HTTPMethod });

            swapStrategies.forEach(swapStrategy => {
                //@ts-ignore
                ajaxMethod[swapStrategy] = (ajaxURL, ajaxOptions = {}) => 
                    ajaxMethod(ajaxURL, { ...ajaxOptions, swapStrategy });
            });
        });

        return ajax;
    });
};

enum AjaxEvent {
    BeforeRequest = 'ajax:before-request',
    Error = 'ajax:error',
    Success = 'ajax:success',
    Failure = 'ajax:failure',
    JsonBeforeMerge = 'ajax:json:before-merge',
    HTMLBeforeMerge = 'ajax:before-merge',
    Merged = 'ajax:merged',
}

function createAjaxHandler(
    el: AjaxAlpineElement<HTMLElement>,
    method: string,
    shouldJsonifyFormData = false,
) {
    const target = el._x_ajax_target || el;
    const swapStrategy = el._x_ajax_swap_strategy || settings.swapStrategy;
    const headers = Object.assign({}, DEFAULT_AJAX_HEADERS, el._x_ajax_headers || {}, settings.headers);

    return async function ajaxHandler(ajaxURL: string) {
        let body: BodyInit | null = null;

        if (el instanceof HTMLFormElement) {
            if (method === "GET") {
                const queryString = new URLSearchParams(new FormData(el) as any).toString();
                ajaxURL += (ajaxURL.includes('?') ? '&' : '?') + queryString;
            } else if (shouldJsonifyFormData) {
                headers["Content-Type"] = "application/json";
                body = JSON.stringify({
                    ...formToJSON(el),
                    ...(el._x_ajax_values || {})
                });
            } else {
                const formData = body = new FormData(el);
                el._x_ajax_values && Object.entries(el._x_ajax_values).forEach(([k, v]) => {
                    formData.append(k, v as string);
                });
                delete headers["Content-Type"];
            }
        } else if (el._x_ajax_values) {
            headers["Content-Type"] = "application/json";
            body = JSON.stringify(el._x_ajax_values);
        }

        if (!dispatch(el, AjaxEvent.BeforeRequest, {
            detail: { target, swapStrategy, method, headers, body }
        })) return;

        try {
            const response = await fetch(ajaxURL, { method, headers, body });

            if (!response.ok) {
                if (!dispatch(el, AjaxEvent.Failure, {
                    detail: { response }
                })) return;
            } else {

                if (!dispatch(el, AjaxEvent.Success, {
                    detail: { response }
                })) return;

                const mimeType = response.headers.get('content-type')?.split(';')[0].trim();

                switch (mimeType) {
                    case 'application/json': {
                        const json = await response.json();
                        if (!dispatch(el, AjaxEvent.JsonBeforeMerge, { detail: { json, response } })) return;
                        await swap(target, "none", "");
                        break;
                    }
                    case 'text/plain':
                    case 'text/html': {
                        const htmlString = await response.text();
                        if (!dispatch(el, AjaxEvent.HTMLBeforeMerge, { detail: { htmlString, response } })) return;
                        await swap(target, swapStrategy, htmlString);
                        break;
                    }
                    default:
                        console.error(`Invalid response mime type ${mimeType}`);
                        break;
                }

                if (!dispatch(el, AjaxEvent.Merged)) return;
            }
        } catch (error) {
            if (!dispatch(el, AjaxEvent.Error, { detail: { error } })) return;
            console.error(error);
        }
    };
}

async function swap(el: HTMLElement, strategy: SwapStrategy, htmlString: string) {
    if (settings.transitions && document.startViewTransition) {
        const transition =  document.startViewTransition(() => {
            performSwap(el, strategy, htmlString);
        });
        await transition.updateCallbackDone;
    } else {
        performSwap(el, strategy, htmlString);
    }
}

function performSwap(el: HTMLElement, strategy: SwapStrategy, htmlString: string) {
    switch (strategy) {
        case "before":
            el.insertAdjacentHTML("beforebegin", htmlString);
            break;
        case "replace":
            replaceElement(el, htmlString);
            break;
        case "prepend":
            el.insertAdjacentHTML("afterbegin", htmlString);
            break;
        case "inside":
            replaceElementContent(el, htmlString);
            break;
        case "append":
            el.insertAdjacentHTML("beforeend", htmlString);
            break;
        case "after":
            el.insertAdjacentHTML("afterend", htmlString);
            break;
        case "none":
            break;
        case "delete":
            el.remove();
            break;
        default:
            throw new Error(`Invalid Merge Strategy: ${strategy}`);
    }
}

function dispatch(from: HTMLElement | Window, eventName: string, eventDict: Object = {}) {
    return from.dispatchEvent(new CustomEvent(eventName, eventDict));
}

function getDelay(delayModifier?: string): number {
    if (!delayModifier) return settings.defaultListenerDelay;

    const match = /^(\d+)(ms|s)?$/.exec(delayModifier);
    if (!match) return settings.defaultListenerDelay;

    const [, value, unit] = match;
    return parseInt(value, 10) * (unit === 's' ? 1000 : 1);
}

function formToJSON(form: HTMLFormElement) {
    const shouldIgnoreDeepKey = form.hasAttribute("ignore-deep-key");
    const json: Record<string, any> = {};

    type PathKey = string | number | null;

    const ensureArray = (current: any): PathKey[] => {
        if (!Array.isArray(current)) current = [];
        return current;
    };

    const fillSparseArray = (arr: PathKey[], index: number) => {
        while (arr.length < index) {
            arr.push(null);
        }
        return arr;
    };

    const createChildObject = (key: PathKey) => {
        return (typeof key === "number" || key === null) ? [] : {};
    };

    const nextObject = (key: any, obj: any[] | Record<any, any>) => {
        if (!(key in obj)) {
            (obj as any)[key] = createChildObject(key);
        }
        return (obj as any)[key];
    };

    const setValue = (obj: any, path: PathKey[], value: any) => {
        let current = obj;

        path.forEach((key, index) => {
            const isLast = index === path.length - 1;

            if (isLast) {
                // Final assignment
                if (key === null) {
                    ensureArray(current).push(value);
                } else if (typeof key === "number") {
                    fillSparseArray(ensureArray(current), key)[key] = value;
                } else {
                    current[key] = value;
                }
            } else {
                const nextKey = path[index + 1];
                // Intermediate step
                if (key === null) {
                    current = ensureArray(current);
                    const child = createChildObject(nextKey);
                    current.push(child);
                    current = child;
                } else if (typeof key === "number") {
                    current = nextObject(nextKey, fillSparseArray(ensureArray(current), key));
                } else {
                    current = nextObject(nextKey, current);
                }
            }
        });
    };

    const parsePath = (key: string): PathKey[] => {
        const path: (string | number | null)[] = [];
        // Any sequence of characters that is not a dot (.), 
        // opening bracket ([), or closing bracket (]), or exactlt ([]);
        const regex = /[^.\[\]]+|\[\]/g;
        let match;
        while ((match = regex.exec(key)) !== null) {
            if (match[0] === '[]') {
                path.push(null); // push mode
            } else if (!isNaN(Number(match[0]))) {
                path.push(Number(match[0]));
            } else {
                path.push(match[0]);
            }
        }
        return path;
    };

    const handleDeepKey = (key: string, value: any) => {
        if (shouldIgnoreDeepKey) {
            json[key] = value;
        } else {
            const path = parsePath(key);
            setValue(json, path, value);
        }
    };

    Array.from(form.elements).forEach(el => {
        if (!(
            el instanceof HTMLInputElement ||
            el instanceof HTMLSelectElement ||
            el instanceof HTMLTextAreaElement
        ) || el.disabled || !el.name || el.hasAttribute("ajax-ignore")) return;

        if ("_x_ajax_values" in el) {
            json[el.name] = el._x_ajax_values;
            return;
        }

        let value: any;
        if (el instanceof HTMLInputElement) {
            switch (el.type) {
                case "checkbox":
                    value = el.checked ? (el.value === "on" ? true : el.value) : false;
                    break;
                case "number":
                    value = el.value === "" ? null : Number(el.value);
                    break;
                case "file":
                    return; // skip files
                default:
                    value = el.value;
            }
        } else {
            value = el.value;
        }

        handleDeepKey(el.name, value);
    });

    return json;
}
