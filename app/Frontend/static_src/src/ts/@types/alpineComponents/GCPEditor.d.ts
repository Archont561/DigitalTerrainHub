import type L from "leaflet";
import { AlpineComponent } from 'alpinejs';

interface BindedGCP {
    id: string;
    image?: {
        name: string;
        marker: L.Marker;
    };
    gcp?: {
        marker: L.Marker;
        height?: number;
    },
}

interface GCPBinding {
    layer: L.FeatureGroup;
    bindedGCPs: BindedGCP[];
}

interface ImageBinding {
    imageLayer: L.ImageOverlay;
    imageBounds: L.LatLngBounds;
    activeMarker: L.Marker | null;
    markersLayer: L.FeatureGroup;
}

interface GCPEditor {
    imageMap?: L.Map;
    gcpMap?: L.Map;
    storage: Map<string, BindedGCP[]>;
    showMap: boolean;
    
    changeGCPs(workspaceUUID: string | null): void;
    bindGCP(GCPMarker: L.Marker): void;
    readFile(file: File): void; 
    parseGCPFile(content: string): BindedGCP[];
    bindedGCPsToTXT(workspaceUUID: string | null): string;
    changeImage(imageUrl: string | null): void;
    createMarker(event: Event): void;
    onImageMarkerDrag(event: L.LeafletEvent): void;
    onImageMarkerClick(event: L.LeafletMouseEvent): void;
    onGCPMarkerClick(event: L.LeafletMouseEvent): void;
    onImageMapMouseMove(event: L.LeafletMouseEvent): void;
}

type GCPEditorComponent = AlpineComponent<GCPEditor>;

export {
    BindedGCP,
    ImageBinding,
    GCPBinding,
    GCPEditorComponent,
}