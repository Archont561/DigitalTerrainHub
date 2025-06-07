import { Vector as VectorLayer } from "ol/layer";
import { type Interaction } from "ol/interaction";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import HTMLOlLayer from './HTMLOlLayer';
import type { Coordinate } from "ol/coordinate";


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

        this.map && this.map.addInteraction(interaction);

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

                lines.slice(startIndex).forEach((line) => {
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

    createMarkerAtViewCenter(transform = true) {
        const center = this.map?.getView()?.getCenter();
        if (!center) return null;
        return this.createPoint({
            coords: center,
            transform
        });
    }

    createPoint({
        coords,
        transform = true,
        properties = {},
        id = undefined,
    }: PointOptions) {
        const applyTransformation = transform ? fromLonLat : (_: Coordinate) => _
        const pointFeature = new Feature({
            geometry: new Point(applyTransformation(coords)),
            ...properties
        });
        pointFeature.setId(id);
        this.source.addFeature(pointFeature);
        return pointFeature;
    }
}

interface PointOptions {
    coords: Coordinate;
    transform?: boolean;
    properties?: Record<string, any>; 
    id?: number;
}