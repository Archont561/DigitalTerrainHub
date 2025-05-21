import type L from "leaflet";

interface ImageMap {
    map: L.Map | null;
    overlay: L.ImageOverlay | null;
    marker: L.Marker | null;
    imageBounds: L.LatLngBounds | null;
    bindingMarker: boolean;

    changeImage(imageUrl: string | null): void;
    createMarker(event: Event): void;
    onMarkerDrag(event: L.LeafletEvent): void;
    onMarkerClick(event: L.LeafletMouseEvent): void;
    onMapMouseMove(event: L.LeafletMouseEvent): void;
}

import { AlpineComponent } from 'alpinejs';

type ImageMapComponent = AlpineComponent<ImageMap>;

export {
    ImageMapComponent
}