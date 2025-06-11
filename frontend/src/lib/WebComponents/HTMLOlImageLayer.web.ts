import { type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Image as ImageLayer } from 'ol/layer';
import { ImageStatic as ImageStaticSource } from 'ol/source';
import { Projection } from 'ol/proj';
import { View } from 'ol';
import { getCenter } from 'ol/extent';
import { HTMLOlLayer } from './HTMLOlLayer.web';

export interface HTMLOlImageLayerProps {
  src?: string,
}

@customElement('ol-image-layer')
export class HTMLOlImageLayer
  extends HTMLOlLayer<ImageLayer<ImageStaticSource>, ImageStaticSource>
  implements HTMLOlImageLayerProps {

  declare readonly layer: ImageLayer<ImageStaticSource>;
  declare readonly source: ImageStaticSource;

  @property({ type: String, reflect: true }) src: URLString = "";

  constructor() {
    super(new ImageLayer(), new ImageStaticSource({ url: "", imageExtent: [] }));
  }

  updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    if (changedProperties.has('src')) {
      this.loadImage(this.src);
    }
  }

  private loadImage(src: string) {
    if (!src) {
      this.layer.setSource(null);
      return;
    }

    const map = this.map;
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
