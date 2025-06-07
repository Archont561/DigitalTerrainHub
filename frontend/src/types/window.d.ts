export {};

declare global {
    interface Window {
        Alpine: import('alpinejs').Alpine & {
            Manager: alpine.AlpineManager;
        };
        htmx: typeof import("htmx.org");
        utils: import("./utils").Utils;
    }
}
