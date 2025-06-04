import { alpine, HTMX, Utils } from "./types";

declare global {
    var Alpine: import('alpinejs').Alpine & {
        Manager: alpine.AlpineManager;
    };
    var htmx: HTMX.Instance;
    var utils: Utils;
}