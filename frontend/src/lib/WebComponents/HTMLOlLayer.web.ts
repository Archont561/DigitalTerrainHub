import { LitElement } from 'lit';
import { type Map as OlMap } from "ol";
import { type Layer } from "ol/layer";
import { type Source } from "ol/source";
import { type HTMLOlMap } from ".";

export interface HTMLOlLayerProps<L extends Layer = Layer, S extends Source = Source> {
  readonly layer: L;
  readonly source: S;
  readonly map: OlMap | null;
}

export abstract class HTMLOlLayer<L extends Layer, S extends Source>
  extends LitElement
  implements HTMLOlLayerProps<L, S> {

  readonly layer: L;
  readonly source: S;

  constructor(layer: L, source: S) {
    super();
    if (!layer) {
      throw new Error("Layer must be provided during initialization.");
    }
    if (!source) {
      throw new Error("Source must be provided during initialization.");
    }
    this.layer = layer;
    this.source = source;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setMap();
  }

  get map() {
    const map = this.layer.getMapInternal?.();
    if (!map) {
      throw new Error('Map is not available for the layer.');
    }
    return map;
  }

  get projection() {
    return this.map.getView().getProjection();
  }

  private setMap() {
    const mapContainer = this.closest('ol-map') as HTMLOlMap;
    if (mapContainer?.map) {
      mapContainer.map.addLayer(this.layer);
    } else {
      console.warn('Map container or map not found in setMap');
    }
  }
}