import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Layer } from "ol/layer";
import type HTMLOlMap from "./HTMLOlMap";

@customElement('ol-layer')
export default class HTMLOlLayer extends LitElement {
  private _layer: Layer;

  constructor(layer: Layer) {
    super();
    if (!layer) {
      throw new Error("Layer must be provided during initialization.");
    }
    this._layer = layer;
    this.setMap();  // Immediately set the map after initialization
  }

  get layer(): Layer {
    return this._layer;
  }

  get map() {
    return this._layer.getMapInternal();
  }

  // Add the layer to the map
  protected setMap() {
    const mapContainer = this.closest('ol-map') as HTMLOlMap;
    mapContainer && mapContainer.map.addLayer(this._layer);
  }

}
