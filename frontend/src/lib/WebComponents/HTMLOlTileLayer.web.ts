import { type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Tile as TileLayer } from 'ol/layer';
import { OSM, XYZ } from 'ol/source';
import { HTMLOlLayer } from './HTMLOlLayer.web';


type TileSource = OSM | XYZ;
type SourceType = "osm" | "xyz" | string;

export interface HTMLOlTileLayerProps {
    src?: URLString;
    type?: SourceType;
}


@customElement('ol-tile-layer')
export class HTMLOlTileLayer
    extends HTMLOlLayer<TileLayer, TileSource>
    implements HTMLOlTileLayerProps {
    
    declare readonly layer: TileLayer;
    declare readonly source: TileSource;
    
    @property({ type: String }) src: URLString = "";
    @property({ type: String }) type: SourceType = 'osm';

    constructor() {
        super(new TileLayer(), new OSM());
    }

    connectedCallback() {
        this.handleSource(this.src, this.type);
    }

    private handleSource(src: string, type: SourceType) {
        let source;
        switch (type) {
            case 'osm':
                source = this.source;
                break;
            case 'xyz':
                if (!src) return;
                source = new XYZ({ url: src || "" });
                break;
            default:
                console.warn(`Unsupported source type: ${type}`);
                return;
        }
        this.layer.setSource(source);
    }

    updated(changedProperties: PropertyValues<this>) {
        super.updated(changedProperties);

        if (changedProperties.has('src') || changedProperties.has('type')) {
            this.handleSource(this.src, this.type);
        }
    }
}
