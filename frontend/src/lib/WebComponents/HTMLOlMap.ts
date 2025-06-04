import { Map as OlMap, View } from "ol";
import { type ProjectionLike, transform } from "ol/proj";
import type { Coordinate } from "ol/coordinate";


export default class HTMLOlMap extends HTMLElement {
    static get observedAttributes() {
        return ["crs", "crs.epsg", "center", "zoom", "zoom.min", "zoom.max"];
    }

    private map: OlMap = new OlMap();
    private projection: ProjectionLike = "EPSG:3857";
    private view: View = new View({ projection: this.projection });

    getMap() { return this.map; }
    getView() { return this.view; }
    getProjection() { return this.projection; }

    constructor() {
        super();
        this.loadStyles();
        this.map.setView(this.view);
        this.map.setTarget(this);
    }

    private loadStyles() {
        this.style.display = "inline-block";
        const styleUrl = new URL("/src/css/openlayers.css", import.meta.url).href;
        window.utils.loadStylesheet(styleUrl);
        return this;
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (!newValue || newValue === oldValue) return;
        switch (name) {
            case 'center':
                if (!newValue) return;
                const [lon, lat] = newValue.split(' ').map(Number);
                if (!isNaN(lon) && !isNaN(lat)) {
                    this.view.setCenter(transform([lon, lat] as Coordinate, "EPSG:4326", this.projection));
                }
                break;
            case 'zoom':
            case 'zoom.min':
            case 'zoom.max':
                if (!newValue) return;
                const zoom = Number(newValue);
                if (!isNaN(zoom)) {
                    const modifier = name.split(".").pop() || "";
                    switch (modifier) {
                        case "zoom": this.view.setZoom(zoom);
                            break;
                        case "max": this.view.setMaxZoom(zoom);
                            break;
                        case "min": this.view.setMinZoom(zoom);
                            break;
                    }
                }
                break;
            case 'crs':
                break;
            case 'crs.epsg':
                if (newValue) this.projection = `EPSG:${newValue}`;
                break;
            default:
                console.log(`Callback for attribute ${name} not implemented.`);
        }
    }

}