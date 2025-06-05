export {};

declare global {
    interface Window {
        Alpine: import('alpinejs').Alpine & {
            Manager: import("./types/alpine").alpine.AlpineManager;
        };
        htmx: typeof import("htmx.org");
        utils: import("./types/utils").Utils;
    }
}
