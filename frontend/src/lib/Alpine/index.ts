import type { Alpine } from 'alpinejs'
import persist from "@alpinejs/persist";
import dom from "./AlpineDOMPlugin";
import time from "./AlpineTimePlugin";
import media from "./AlpineMediaPlugin";
import styles from "./AlpineStylesPlugin";
import astro from "./AlpineAstroPlugin";


export default (Alpine: Alpine) => {
    Alpine.plugin(persist);
    Alpine.plugin(dom);
    Alpine.plugin(time);
    Alpine.plugin(media);
    Alpine.plugin(styles);
    Alpine.plugin(astro);
    window.Alpine = Alpine;
}
