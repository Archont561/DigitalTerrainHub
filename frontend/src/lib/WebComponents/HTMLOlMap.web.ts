import { LitElement, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Map as OlMap, View } from 'ol';
import { type ProjectionLike, transform } from 'ol/proj';
import type { Coordinate } from 'ol/coordinate';
import OpenLayersStyleURL from "@assets/styles/openlayers.css?url";

type ZoomString = `${number}` | `${number}, ${number}, ${number}`
type CenterString = `${number} ${number}` | `${number}, ${number}`

export interface HTMLOlMapProps {
  crs?: ProjectionLike;
  center?: CenterString;
  zoom?: ZoomString;
}


@customElement('ol-map')
export class HTMLOlMap extends LitElement implements HTMLOlMapProps {
  @property({ type: String, attribute: 'crs' }) crs = "";
  @property({ type: String, attribute: 'center' }) center = "" as CenterString;
  @property({ type: String, attribute: 'zoom' }) zoom = "" as ZoomString;

  readonly map: OlMap;
  private view = new View({ projection: 'EPSG:3857' });

  constructor() {
    super();
    this.map = new OlMap({
      target: this,
      view: this.view,
    });
    this.crs && this.updateProjection(this.crs);
    this.loadStyles();
  }

  get mapView() { return this.view }

  private loadStyles() {
    if (window?.utils?.loadStylesheet) {
      window.utils.loadStylesheet(OpenLayersStyleURL);
    } else {
      console.warn('window.utils.loadStylesheet is not available');
    }
  }

  updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if (changedProperties.has('crs') && this.crs) {
      this.crs && this.updateProjection(this.crs);
    }

    if (changedProperties.has('center') && this.center) {
      this.updateCenter(this.center);
    }

    if (changedProperties.has('zoom') && this.zoom) {
      this.updateZoom(this.zoom);
    }
  }

  private updateZoom(zoomStr: ZoomString) {
    const zoomValues = zoomStr.split(',').map(s => parseInt(s.trim()));

    if (zoomValues.length === 1) {
      if (isNaN(zoomValues[0])) {
        console.warn(`Invalid zoom value: "${zoomStr}". Must be a number`);
        return;
      }

      this.view.setZoom(zoomValues[0]);
    } else {
      if (zoomValues.length !== 3 || zoomValues.some(z => isNaN(z))) {
        console.warn(`Invalid zoom value: "${zoomStr}". Must be numbers as 'min,default,max'.`);
        return;
      }

      const [minZoom, defaultZoom, maxZoom] = zoomValues;
      this.view.setMinZoom(minZoom);
      this.view.setZoom(defaultZoom);
      this.view.setMaxZoom(maxZoom);
    }
  }

  private updateProjection(projection: ProjectionLike) {
    this.view = new View({ projection });
    this.map.setView(this.view);
  }

  private updateCenter(centerStr: CenterString) {
    const parts = centerStr.includes(',') ? centerStr.split(',') : centerStr.split(' ');
    const coords = parts.map(part => Number(part.trim()));
    if (coords.length === 2 && coords.every(n => !isNaN(n))) {
      this.view.setCenter(transform(coords as Coordinate, 'EPSG:4326', this.view.getProjection()));
    } else {
      console.warn('Invalid center attribute:', centerStr);
    }
  }
}

