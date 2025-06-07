import { customElement, property } from 'lit/decorators.js';
import { Tile as TileLayer } from 'ol/layer';
import { OSM, XYZ } from 'ol/source';
import HTMLOlLayer from './HTMLOlLayer';

@customElement('ol-tile-layer')
export default class HTMLOlTileLayer extends HTMLOlLayer {
    @property({ type: String }) src = '';
    @property({ type: String }) type = 'osm';

    constructor() {
        super(new TileLayer());
    }

    private handleSource(src: string, type: string) {
        let source;
        switch (type) {
            case 'osm':
                source = new OSM();
                break;
            case 'xyz':
                source = new XYZ({ url: src });
                break;
            default:
                console.warn(`Unsupported source type: ${type}`);
                return;
        }
        this.layer.setSource(source);
    }

    // Use the `updated` lifecycle hook to check changes to the properties
    updated(changedProperties: Map<string | number | symbol, unknown>): void {
        super.updated(changedProperties);

        // Only call handleSource if either 'src' or 'type' has changed
        if (changedProperties.has('src') || changedProperties.has('type')) {
            this.handleSource(this.src, this.type);
        }
    }
}
