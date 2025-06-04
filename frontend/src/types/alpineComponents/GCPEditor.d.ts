import type { Map as OlMap, Feature, Overlay } from 'ol';
import type { Vector as VectorLayer, Image as ImageLayer } from 'ol/layer';
import type { Vector as VectorSource, ImageStatic } from 'ol/source';
import type { Point } from 'ol/geom';
import type { Extent } from "ol/extent";
import type { Coordinate } from 'ol/coordinate';
import type { AlpineComponent } from 'alpinejs';

export type UUID = string;
export type Binding = Map<UUID, BindedGCP>;
export type Store = Map<UUID, Binding>;
export type OlPoint = Feature<Point>;

export interface BindedGCP {
    gcp?: OlPoint;
    image?: OlPoint;
}

export interface GCPEditor {
    workspaceBinding: null | Binding;
    currentGCPFeature: null | OlPoint;
    currentImageMarkerFeature: null | OlPoint;

    changeImage(imageUrl: string): void;
    registerImageMarker(marker: OlPoint, imageUrl: string): void;
    registerGCPMarker(marker: OlPoint): void;
    bindCurrentSelection(): void ;
    loadGCPsFromFile(file: File): void;
    getOrCreateBinding(workspaceUUID: UUID): Binding;
    getOrSetUUID(feature: OlPoint): UUID;
    onReveal(): void;
}

export type GCPEditorComponent = AlpineComponent<GCPEditor>;
