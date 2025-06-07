import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Map as OlMap, View } from 'ol';
import { type ProjectionLike, transform } from 'ol/proj';
import type { Coordinate } from 'ol/coordinate';

@customElement('ol-map')
export default class HTMLOlMap extends LitElement {

  // Reactive properties for attributes
  @property({ type: String, attribute: 'crs' }) crs: string = 'EPSG:3857';
  @property({ type: String, attribute: 'crs.epsg' }) crsEpsg: string | null = null;
  @property({ type: String, attribute: 'center' }) center: string | null = null;
  @property({ type: Number, attribute: 'zoom' }) zoom: number | null = null;
  @property({ type: Number, attribute: 'zoom.min' }) zoomMin: number | null = null;
  @property({ type: Number, attribute: 'zoom.max' }) zoomMax: number | null = null;

  // Private state for OpenLayers map and view
  private _map: OlMap = new OlMap();
  private _projection: ProjectionLike = 'EPSG:3857';
  private _view: View = new View({ projection: this.projection });

  get map() {
    return this._map;
  }

  get view() {
    return this._view;
  }

  get projection() {
    return this._projection;
  }

  constructor() {
    super();
    this.loadStyles();
    this.map.setView(this.view);
    this.map.setTarget(this);
  }

  // Load external stylesheet
  private loadStyles() {
    window.utils.loadStylesheet('/src/css/openlayers.css');
  }

  // Handle updates to reactive properties
  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    // Handle crs.epsg changes
    if (changedProperties.has('crsEpsg') && this.crsEpsg) {
      this._projection = `EPSG:${this.crsEpsg}`;
      this._view = new View({ projection: this.projection });
      this.map.setView(this.view);
    }

    // Handle center changes
    if (changedProperties.has('center') && this.center) {
      const [lon, lat] = this.center.split(' ').map(Number);
      if (!isNaN(lon) && !isNaN(lat)) {
        this.view.setCenter(transform([lon, lat] as Coordinate, 'EPSG:4326', this.projection));
      }
    }

    // Handle zoom changes
    if (changedProperties.has('zoom') && this.zoom !== null && !isNaN(this.zoom)) {
      this.view.setZoom(this.zoom);
    }

    // Handle zoom.min changes
    if (changedProperties.has('zoomMin') && this.zoomMin !== null && !isNaN(this.zoomMin)) {
      this.view.setMinZoom(this.zoomMin);
    }

    // Handle zoom.max changes
    if (changedProperties.has('zoomMax') && this.zoomMax !== null && !isNaN(this.zoomMax)) {
      this.view.setMaxZoom(this.zoomMax);
    }

    // Note: 'crs' attribute is not handled as in the original code
    if (changedProperties.has('crs') && this.crs) {
      console.log(`Attribute crs changed to ${this.crs}, but no callback implemented.`);
    }
  }
}