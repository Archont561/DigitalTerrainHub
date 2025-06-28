import type { Alpine } from 'alpinejs';
import AlpinePluginBase from "./AlpinePluginBase";
import type { PluginDirectives, PluginMagics } from "./AlpinePluginBase";
import { isEqual } from "lodash";
import { replaceElementContent, replaceElement, CallableClass } from "@utils";

declare module "alpinejs" {
    interface Alpine {
        ajaxPlugin: AlpineAjaxPlugin;
    }
    interface Magics<T> {
        $ajax: AjaxRequestBuilder;
    }
}

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type SwapStrategy = "after" | "append" | "before" | "inside" | "none" | "prepend" | "replace" | "remove";

type AjaxAlpineElement = HTMLElement & {
    _x_ajax_headers?: Record<string, any>;
    _x_ajax_target?: HTMLElement;
    _x_ajax_swap_strategy?: SwapStrategy;
    _x_ajax_values?: Record<string, any>;
    _x_ajax_eventSource?: EventSource;
};

interface AjaxSettings {
    headers: Record<string, any>;
    swapStrategy: SwapStrategy;
    transitions: boolean;
    defaultListenerDelay: number;
}

class AjaxRequestBuilder extends CallableClass<AjaxRequestBuilder> {
    private method: HTTPMethod = "GET";
    private options?: {
        ajaxURL: string;
        ajaxHandler: CallableFunction;
    };

    public GET!: this;
    public POST!: this;
    public PUT!: this;
    public DELETE!: this;
    public PATCH!: this;

    public after!: this;
    public append!: this;
    public before!: this;
    public inside!: this;
    public none!: this;
    public prepend!: this;
    public replace!: this;
    public remove!: this;

    constructor(private el: AjaxAlpineElement, private Alpine: Alpine, private createAjaxHandler: CallableFunction) {
        super("send");
        const httpMethods = ["get", "post", "put", "delete", "patch"] as const;
        const swapStrategies = [
            "after",
            "append",
            "before",
            "inside",
            "none",
            "prepend",
            "replace",
            "delete"
        ] as const;

        httpMethods.forEach(method => {
            Object.defineProperty(this, method, {
                get: () => {
                    this.method = method.toUpperCase() as HTTPMethod;
                    return this;
                }
            });
        });

        swapStrategies.forEach(strategy => {
            Object.defineProperty(this, strategy, {
                get: () => {
                    this.el._x_ajax_swap_strategy = strategy as SwapStrategy;
                    return this;
                }
            });
        });
    }

    setTarget(target: HTMLElement) {
        if (!isEqual(this.el._x_ajax_target, target)) {
            this.el._x_ajax_target = target;
        }
        return this;
    }

    setHeaders(headers: Record<string, string>) {
        if (!isEqual(this.el._x_ajax_headers, headers)) {
            this.el._x_ajax_headers = headers;
        }
        return this;
    }

    setValues(values: Record<string, string>) {
        if (!isEqual(this.el._x_ajax_values, values)) {
            this.el._x_ajax_values = values;
        }
        return this;
    }

    send(ajaxURL: string) {
        if (!isEqual(this.options?.ajaxURL, ajaxURL)) {
            this.options?.ajaxHandler(this.Alpine.evaluate(this.el, ajaxURL));
            return;
        }
        const ajaxHandler = this.createAjaxHandler(this.el, this.method);
        this.options = { ajaxURL, ajaxHandler };
        ajaxHandler(this.Alpine.evaluate(this.el, ajaxURL));
    }
}

class AlpineAjaxPlugin extends AlpinePluginBase<AjaxSettings> {
    protected PLUGIN_NAME = "ajaxPlugin";
    protected settings = {
        headers: {},
        swapStrategy: "replace",
        transitions: false,
        defaultListenerDelay: 300,
    } as AjaxSettings;

    public readonly DEFAULT_AJAX_HEADERS = {
        "X-Alpine-Ajax-Request": true
    } as const;

    public readonly AjaxEvent = {
        BeforeRequest: 'ajax:before-request',
        Error: 'ajax:error',
        Success: 'ajax:success',
        Failure: 'ajax:failure',
        JsonBeforeSwap: 'ajax:json:before-swap',
        HTMLBeforeSwap: 'ajax:html:before-swap',
        AfterSwap: 'ajax:after-swap',
    } as const;

    protected magics: PluginMagics = {
        ajax: (el, { Alpine }) => new AjaxRequestBuilder(el, Alpine, this.createAjaxHandler),
    };

    protected directives: PluginDirectives<AjaxAlpineElement> = {
        'ajax-target': (el,
            { value, modifiers, expression },
            { evaluate }
        ) => {
            let from = document.querySelector;
            if (value === "closest") from = el.closest;
            else if (value === "inside") from = el.querySelector;
            el._x_ajax_target = (from(evaluate(expression) as string) || el) as HTMLElement;
            el._x_ajax_swap_strategy = (modifiers.at(0) || this.settings.swapStrategy) as SwapStrategy;
        },
        'ajax-headers': (el, { expression }, { evaluate }) => {
            el._x_ajax_headers = JSON.parse(evaluate(expression));
        },
        'ajax-values': (el, { expression, value }, { evaluate }) => {
            const values = JSON.parse(evaluate(expression) || "");
            if (value === "append") {
                el._x_ajax_values = Object.assign(el._x_ajax_values || {}, values);
            } else {
                el._x_ajax_values = values;
            }
        },
        ajax: (el,
            { value, modifiers, expression },
            { Alpine, effect, cleanup, evaluateLater, evaluate }
        ) => {
            const method = modifiers.find(modifier => ["get", "put", "post", "delete", "patch"].includes(modifier.toLowerCase())) || "get";
            const ajaxHandler = this.createAjaxHandler(el, method.toUpperCase() as HTTPMethod);
    
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
                    const delay = this.getDelay(modifiers.find(modifier => /^\d+(ms|s)?$/.test(modifier)));
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
        },
        'ajax-sse': (el,
            { value, expression },
            { cleanup, evaluate }
        ) => {
            if (!value) {
                const source = el._x_ajax_eventSource = new EventSource(evaluate(expression));
                source.onerror = error => {
                    if (!this.dispatch(el, 'ajax-sse:error', { detail: { error } })) return;
                    console.error(`SSE Error: ${error}`);
                };
    
                cleanup(() => {
                    source.close();
                });
            } else {
                const handler = (() => {
                    const hasTarget = el.getAttributeNames().some(attr => attr.startsWith("x-ajax-target"));
                    const isExpressionEmpty = expression.trim() === "";
    
                    if (!isExpressionEmpty) return (event: MessageEvent) => evaluate(expression, { $sse: event, $swap: this.swap });
    
                    if (hasTarget) return (event: MessageEvent) => this.swap(
                        el._x_ajax_target as HTMLElement,
                        el._x_ajax_swap_strategy as SwapStrategy,
                        event.data
                    );
    
                    return (event: MessageEvent) => this.swap(el, "replace", event.data);
                })();
    
                const closestSSEAjaxAlpineElement = el.closest("[x-ajax-sse]") as AjaxAlpineElement;
                const source = closestSSEAjaxAlpineElement._x_ajax_eventSource;
                if (!source) {
                    throw new Error('No event source specified!');
                }
    
                source.addEventListener(value, handler);
                cleanup(() => {
                    source.removeEventListener(value, handler);
                });
            }
        },
    };

    private createAjaxHandler(el: AjaxAlpineElement, method: HTTPMethod) {
        const target = el._x_ajax_target || el;
        const swapStrategy = el._x_ajax_swap_strategy || this.settings.swapStrategy;
        const headers = Object.assign({}, this.DEFAULT_AJAX_HEADERS, el._x_ajax_headers || {}, this.settings.headers);

        return async (ajaxURL: string) => {
            let body: BodyInit | null = null;

            if (el instanceof HTMLFormElement && !el.hasAttribute("x-ajax-ignore")) {
                if (method === "GET") {
                    const queryString = new URLSearchParams(new FormData(el) as any).toString();
                    ajaxURL += (ajaxURL.includes('?') ? '&' : '?') + queryString;
                } else if (el.hasAttribute("x-jsonify")) {
                    headers["Content-Type"] = "application/json";
                    body = JSON.stringify({
                        ...this.formToJSON(el),
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

            if (!this.dispatch(el, this.AjaxEvent.BeforeRequest, {
                detail: { target, swapStrategy, method, headers, body }
            })) return;

            try {
                const response = await fetch(ajaxURL, { method, headers, body });

                if (!response.ok) {
                    if (!this.dispatch(el, this.AjaxEvent.Failure, {
                        detail: { response }
                    })) return;
                } else {

                    if (!this.dispatch(el, this.AjaxEvent.Success, {
                        detail: { response }
                    })) return;

                    const mimeType = response.headers.get('content-type')?.split(';')[0].trim();

                    switch (mimeType) {
                        case 'application/json': {
                            const json = await response.json();
                            if (!this.dispatch(el, this.AjaxEvent.JsonBeforeSwap, { detail: { json, response } })) return;
                            await this.swap(target, "none", "");
                            break;
                        }
                        case 'text/plain':
                        case 'text/html': {
                            const htmlString = await response.text();
                            if (!this.dispatch(el, this.AjaxEvent.HTMLBeforeSwap, { detail: { htmlString, response } })) return;
                            await this.swap(target, swapStrategy, htmlString);
                            break;
                        }
                        default:
                            console.error(`Invalid response mime type ${mimeType}`);
                            break;
                    }

                    if (!this.dispatch(el, this.AjaxEvent.AfterSwap)) return;
                }
            } catch (error) {
                if (!this.dispatch(el, this.AjaxEvent.Error, { detail: { error } })) return;
                console.error(error);
            }
        };
    }

    private async swap(el: HTMLElement, strategy: SwapStrategy, htmlString: string) {
        if (this.settings.transitions && document.startViewTransition) {
            const transition = document.startViewTransition(() => {
                this.performSwap(el, strategy, htmlString);
            });
            await transition.updateCallbackDone;
        } else {
            this.performSwap(el, strategy, htmlString);
        }
    }

    private performSwap(el: HTMLElement, strategy: SwapStrategy, htmlString: string) {
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
            case "remove":
                el.remove();
                break;
            default:
                throw new Error(`Invalid Merge Strategy: ${strategy}`);
        }
    }

    private dispatch(from: HTMLElement | Window, eventName: string, eventDict: Object = {}) {
        return from.dispatchEvent(new CustomEvent(eventName, eventDict));
    }

    private getDelay(delayModifier?: string): number {
        if (!delayModifier) return this.settings.defaultListenerDelay;

        const match = /^(\d+)(ms|s)?$/.exec(delayModifier);
        if (!match) return this.settings.defaultListenerDelay;

        const [, value, unit] = match;
        return parseInt(value, 10) * (unit === 's' ? 1000 : 1);
    }

    private formToJSON(form: HTMLFormElement) {
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

}

export default AlpineAjaxPlugin.expose();
