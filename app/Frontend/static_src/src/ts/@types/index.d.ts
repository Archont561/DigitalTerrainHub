export  * as components from "./alpineComponents";
import { HTMX } from "./htmx";
import { alpine } from "./alpine";
import type { Alpine } from "alpinejs";
import { Utils } from './utils';

export {
    alpine,
    HTMX,
    Utils,
}

declare global {
    var htmx: HTMX.Instance;
    var Alpine: Alpine & {
        Manager: alpine.AlpineManager
    };
    var utils: Utils;
}