import type L from "leaflet";
import { AlpineComponent } from 'alpinejs';

interface BindedGCP {
    id: string;
    image: {
        name: string;
        x: number;
        y: number;
    };
    gcp: {
        latLong: number[];
        height: number;
    },
}

interface BindedGCPs {
    proj: string;
    binding: BindedGCP[];
}

interface GCPEditor {
    imageMap?: L.Map;
    gcpMap?: L.Map;
    bindedGCPs: BindedGCPs | null;
    overlay: L.ImageOverlay | null;
    currentMarker: L.Marker | null;
    imageBounds: L.LatLngBounds | null;
    markerFeatureLayer: L.FeatureGroup;
    storage: Map<string, BindedGCPs>;
    isMarkerInBinding: boolean;
    
    loadGCPs(workspaceUUID: string): void;
    bindGCP(image: string, GCPMarker: HTMLElement): void;
    readFile(file: File): void; 
    parseGCPFile(content: string): BindedGCPs;
    changeImage(imageUrl: string | null): void;
    createMarker(event: Event): void;
    onMarkerDrag(event: L.LeafletEvent): void;
    onMarkerClick(event: L.LeafletMouseEvent): void;
    onMapMouseMove(event: L.LeafletMouseEvent): void;
}

type GCPEditorComponent = AlpineComponent<GCPEditor>;

export {
    BindedGCP,
    BindedGCPs,
    GCPEditorComponent,
}