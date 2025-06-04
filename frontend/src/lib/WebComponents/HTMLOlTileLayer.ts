import { Tile as TileLayer,  } from 'ol/layer';
import { OSM } from 'ol/source';
import HTMLOlLayer from './HTMLOlLayer';


export default class HTMLOlTileLayer extends HTMLOlLayer {
    static get observedAttributes() {
        return ['src', 'src.osm'];
    }
    
    constructor() {
        super(new TileLayer());
    }

    private handleSource(modifier: string, src: string) {
        switch (modifier) {
            case "":
                break;
            case "osm":
            default:
                this.layer.setSource(new OSM());
                break;
        }
    }
    
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'src':
            case 'src.osm':
                const modifier = name.split(".").pop() || "";
                this.handleSource(modifier, newValue);
                break;
            default:
                console.log(`Callback function for attribute ${name} change not implemented!`);
        }
    }

}