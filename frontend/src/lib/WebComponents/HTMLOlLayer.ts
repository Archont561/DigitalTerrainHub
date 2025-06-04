import { Layer } from "ol/layer";
import type HTMLOlMap from "./HTMLOlMap";

export default abstract class HTMLOlLayer extends HTMLElement {
    protected layer: Layer;

    getLayer() { return this.layer }
    getMap() { return this.layer.getMapInternal(); }

    constructor(layer: Layer) {
        super();
        this.layer = layer;
        this.setMap();
    }

    protected setMap() {
        const mapContainer = this.closest('ol-map') as HTMLOlMap;
        mapContainer && mapContainer.getMap().addLayer(this.layer);
    }
}