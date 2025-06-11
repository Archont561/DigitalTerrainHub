import { type PropertyValues } from 'lit';
import { Vector as VectorLayer } from "ol/layer";
import { type Interaction } from "ol/interaction";
import Feature from "ol/Feature";
import { Point } from "ol/geom";
import { fromLonLat, transform, type ProjectionLike } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { HTMLOlLayer } from './HTMLOlLayer.web';
import type { Coordinate } from "ol/coordinate";


interface PointOptions {
    coords: Coordinate;
    sourceProjection?: ProjectionLike;
    properties?: Record<string, any>;
    id?: number | string;
}

export interface HTMLOlVectorLayerProps {
    readonly interactions: Map<string, Interaction>;
}


export class HTMLOlVectorLayer 
    extends HTMLOlLayer<VectorLayer, VectorSource>
    implements HTMLOlVectorLayerProps {

    declare readonly layer: VectorLayer;
    declare readonly source: VectorSource;
    readonly interactions = new Map<string, Interaction>();

    constructor() {
        super(new VectorLayer(), new VectorSource());
        this.layer.setSource(this.source);
        this.setStyle();
    }

    private setStyle() {
        this.layer.setStyle(new Style({
            image: new Circle({
                radius: 3,
                fill: new Fill({ color: 'blue' }),
                stroke: new Stroke({ color: 'red', width: 2 }),
            }),
        }))
    }


    setInteraction(name: string, interaction: Interaction) {
        this.interactions.set(name, interaction);
        this.map.addInteraction(interaction);
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

    createMarkerAtViewCenter() {
        const center = this.map.getView()?.getCenter();
        if (!center) return null;
        return this.createPoint({ coords: center });
    }

    createPoint({
        coords,
        sourceProjection = "EPSG:3857",
        properties = {},
        id = undefined,
    }: PointOptions) {
        const reprojectCoords =  (_: Coordinate) => 
            (sourceProjection == this.projection)
            ? _ : transform(_, sourceProjection, this.projection);

        const pointFeature = new Feature();
        pointFeature.setGeometry(new Point(reprojectCoords(coords)));
        pointFeature.setProperties(properties);
        pointFeature.setId(id);
        this.source.addFeature(pointFeature);
        return pointFeature;
    }
}