import type { Map as OlMap, Feature, Overlay } from 'ol';
import type { SelectEvent } from "ol/interaction/Select";
import type { Vector as VectorLayer, Image as ImageLayer } from 'ol/layer';
import type { Vector as VectorSource, ImageStatic } from 'ol/source';
import type { Point } from 'ol/geom';
import type { Extent } from "ol/extent";
import type { Coordinate } from 'ol/coordinate';
import type { AlpineComponent } from 'alpinejs';
import type { GCPointBinding } from '@lib/db/GCPPointsDB';


export type OlPoint = Feature<Point>;

export interface GCPEditor {
    currentGCPFeature: null | OlPoint;
    currentImageMarkerFeature: null | OlPoint;

    onImagePointSelection(event: SelectEvent): void;
    onGCPointShiftSelection(event: SelectEvent): void;
    changeImage(imageUrl: string): void;
    registerImageMarker(marker: OlPoint, imageUrl: string): void;
    registerGCPMarker(marker: OlPoint): void;
    loadGCPsFromFile(file: File): void;
    onReveal(): void;
}

export type GCPEditorComponent = AlpineComponent<GCPEditor>;
