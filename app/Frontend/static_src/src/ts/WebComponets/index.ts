export { default as HTMLOlImageLayer } from "./HTMLOlImageLayer";
export { default as HTMLOlMap } from "./HTMLOlMap";
export { default as HTMLOlTileLayer } from "./HTMLOlTileLayer";
export { default as HTMLOlVectorLayer } from "./HTMLOlVectorLayer";
export { default as HTMLOlMapControl } from "./HTMLOlMapControl";
export { default as HTMLOlLayer } from "./HTMLOlLayer";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";


export default {
    async init() {
        this.registerProjections();
        await this.registerWebComponentes();
    },
    
    registerProjections() {
        proj4.defs('EPSG:2180', '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
        register(proj4);
    },
    
    async registerWebComponentes() {
        customElements.define("ol-map", (await import ("./HTMLOlMap")).default);
        customElements.define("ol-control", (await import ("./HTMLOlMapControl")).default);
        customElements.define("ol-image-layer", (await import ("./HTMLOlImageLayer")).default);
        customElements.define("ol-tile-layer", (await import ("./HTMLOlTileLayer")).default);
        customElements.define("ol-vector-layer", (await import ("./HTMLOlVectorLayer")).default);
    }
}
