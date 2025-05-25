import { Vector as VectorLayer } from "ol/layer";
import { type Interaction, Select, Translate } from "ol/interaction";
import { click } from "ol/events/condition";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import HTMLOlLayer from "./HTMLOlLayer";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { Coordinate } from "ol/coordinate";


export default class HTMLOlVectorLayer extends HTMLOlLayer {

    private interactions = new Map<string, Interaction>();
    private source = new VectorSource();

    getSource() { return this.source; }
    getLayerInteractions() { return this.interactions; }

    constructor() {
        super(new VectorLayer());
        this.layer.setSource(this.source);
        this.setStyle();
    }

    private setStyle() {
        (this.layer as VectorLayer).setStyle(new Style({
            image: new Circle({
                radius: 3,
                fill: new Fill({ color: 'blue' }),
                stroke: new Stroke({ color: 'red', width: 2 }),
            }),
        }))
    }


    setInteraction(name: string, interaction: Interaction) {
        this.interactions.set(name, interaction);

        const map = this.getMap();
        map && map.addInteraction(interaction);

        return this;
    }

    async loadGroundControlPointsFile(file: File, append = false) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const lines = (reader.result as string).split('\n').map(line => line.trim());
                if (!lines) {
                    resolve(this);
                    return;
                }

                const projString = lines[0];
                let startIndex = 0;
                if (isNaN(Number(projString[0]))) {
                    startIndex = 1;
                }
                !append && this.source.clear();

                lines.slice(startIndex).forEach((line, i) => {
                    const coords = line.split(" ").map(Number);
                    const feature = new Feature({
                        geometry: new Point(fromLonLat(coords)),
                    });
                    feature.setId(crypto.randomUUID());
                    this.source.addFeature(feature);
                });

                resolve(this);
            };
            reader.readAsText(file);
        });
    }

    createMarkerAtViewCenter() {
        const center = this.getMap()?.getView()?.getCenter();
        if (!center) return null;
        const feature = new Feature({ geometry: new Point(center)});
        this.source.addFeature(feature);
        return feature;
    }
}
