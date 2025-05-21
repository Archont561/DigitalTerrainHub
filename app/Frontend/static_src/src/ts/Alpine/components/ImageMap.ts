import L, { LatLngBounds } from "leaflet";
import 'leaflet/dist/leaflet.css';
import { html } from "../../utils";
import { ImageMapComponent } from "../../@types/alpineComponents/ImageMap";

const ImageMap = () => {
    const coordDisplay = html`
        <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-1 px-2 text-xs rounded z-10">
            Coordinates Display
        </div>
    `;
    
    return {
        map: null,
        marker: null,
        bindingMarker: false,
        imageBounds: null,
        overlay: null,

        init() {
            const mapContainer = this.$el.querySelector(".mapContainer") as HTMLElement;
            const map = L.map(mapContainer, {
                crs: L.CRS.Simple,
                minZoom: -3,
                maxZoom: 1,
                maxBoundsViscosity: 1,
            });
            mapContainer.appendChild(coordDisplay);
            map.on("mousemove", this.onMapMouseMove);
            this.map = map;
        },
        changeImage(imageUrl: string | null) {
            if (!this.map) return;

            if (!imageUrl) {
                if (!this.overlay) return;
                this.overlay.remove();
                this.overlay = null;
                return;
            }

            const image = new Image();
            const map = this.map
            image.onload = () => {         
                const imageBounds = new L.LatLngBounds([[0, 0], [image.height, image.width]]);             
                const overlay = L.imageOverlay(imageUrl, imageBounds).addTo(map);
                map.fitBounds(imageBounds).setMaxBounds(imageBounds);
                this.overlay = overlay;
                this.imageBounds = imageBounds;
            };
            image.src = imageUrl;
        },
        createMarker() {
            if (!this.map || !this.imageBounds) return;
            if (this.marker) this.marker = null;

            const center = this.map.getCenter();

            this.marker = L.marker(center, {
                icon: L.icon({
                    iconUrl: "http://localhost:5173/static/src/assets/pin.png",
                    iconSize: [50, 50],
                }),
                draggable: true,
            }).bindTooltip("gcpLabel", {
                permanent: true,
                direction: "top",
            }).addTo(this.map);

            this.marker.on('drag', this.onMarkerDrag);
            this.marker.on('click', this.onMarkerClick);
        },
        onMarkerDrag(event) {
            const { lat, lng } = this.marker?.getLatLng() as L.LatLng;
            const bounds = this.imageBounds as L.LatLngBounds;                
            const clampedLat = Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), lat));
            const clampedLng = Math.max(bounds.getWest(), Math.min(bounds.getEast(), lng));
            this.marker?.setLatLng([clampedLat, clampedLng]);
        },
        onMarkerClick(event) {
            if (event.originalEvent.shiftKey) {
                this.bindingMarker = !this.bindingMarker;
            }
        },
        onMapMouseMove(e) {
            coordDisplay.textContent = `X: ${e.latlng.lng.toFixed(2)} | Y: ${e.latlng.lat.toFixed(2)}`;
        },
    } as ImageMapComponent;
};

export default ImageMap;