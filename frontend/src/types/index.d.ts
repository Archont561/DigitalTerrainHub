import  * as components from "./alpineComponents";
import type htmx from "htmx.org";
import { alpine } from "./alpine";
import { Utils } from './utils';

declare global {
    var Alpine: import('alpinejs').Alpine & {
        Manager: alpine.AlpineManager;
    };
    var htmx: htmx;
    var utils: Utils;
}

export {
    alpine,
}