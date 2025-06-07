import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Image as ImageLayer } from 'ol/layer';
import { ImageStatic as ImageStaticSource } from 'ol/source';
import { Projection } from 'ol/proj';
import { View } from 'ol';
import { getCenter } from 'ol/extent';
import HTMLOlLayer from './HTMLOlLayer';

@customElement('ol-image-layer')
export default class HTMLOlImageLayer extends HTMLOlLayer {
  @property({ type: String }) src: string | null = null;

  constructor() {
    super(new ImageLayer());
  }

  // Lifecycle hook to run when `src` changes
  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('src')) {
      this.loadImage(this.src);
    }
  }

  // Load the image and set the OpenLayers layer source
  private loadImage(src: string | null) {
    const map = this.layer.getMapInternal();
    if (!map) return;
    
    if (!src) {
      this.layer.setSource(null); // Remove image if no `src`
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
      const extent = [0, 0, img.width, img.height];
      const projection = new Projection({
        code: 'xkcd-image',
        units: 'pixels',
        extent,
      });

      const imageStaticSource = new ImageStaticSource({
        url: src,
        imageExtent: extent,
        projection,
      });

      this.layer.setSource(imageStaticSource);

      // Add padding and adjust the view for the image
      const padding = {
        horizontal: img.width / 3,
        vertical: img.height / 3,
      };

      const view = new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 0,
        maxZoom: 6,
        extent: [
          -padding.horizontal,
          -padding.vertical,
          img.width + padding.horizontal,
          img.height + padding.vertical,
        ],
      });
      
      map.setView(view);
    };
  }
}
