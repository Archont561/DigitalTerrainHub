import type { Alpine, PluginCallback } from 'alpinejs'
import persist from "@alpinejs/persist";
import dom from "./AlpineDOMPlugin";
import time from "./AlpineTimePlugin";
import media from "./AlpineMediaPlugin";
import styles from "./AlpineStylesPlugin";
import astro from "./AlpineAstroPlugin";


export default (Alpine: Alpine) => {
    Alpine.plugin(persist);
    Alpine.plugin(dom.toPluginCallback());
    Alpine.plugin(time.toPluginCallback());
    Alpine.plugin(media.toPluginCallback());
    Alpine.plugin(styles.toPluginCallback());
    Alpine.plugin(astro.toPluginCallback());
    window.Alpine = Alpine;
}
