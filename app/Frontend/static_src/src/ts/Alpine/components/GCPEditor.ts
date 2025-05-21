import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import proj4 from "proj4";
import { html } from "../../utils";
import { BindedGCP, BindedGCPs, GCPEditorComponent } from "../../@types/alpineComponents/GCPEditor";

export default () => {
    window.L = L;
    window.Alpine.store("GCPMapData", new Map<string, BindedGCPs>());
    
    const WGS84Proj = "EPSG:4326";
    const leafIcon = L.icon({
        iconUrl: "https://docs.maptiler.com/sdk-js/examples/custom-points-icon-png/underground.png", //your custom pin
        iconSize: [24, 26],
    });
    const coordDisplay = html`
        <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-1 px-2 text-xs rounded z-10">
            Coordinates Display
        </div>
    `;
    
    return {
        currentMarker: null,
        isMarkerInBinding: false,
        imageBounds: null,
        overlay: null,
        bindedGCPs: null,
        storage: window.Alpine.store("GCPMapData"),
        markerFeatureLayer: new L.FeatureGroup,

        init() {
            const imageMapContainer = this.$el.querySelector(".mapContainer") as HTMLElement;
            const imageMap = L.map(imageMapContainer, {
                crs: L.CRS.Simple,
                minZoom: -3,
                maxZoom: 1,
                maxBoundsViscosity: 1,
            });
            imageMapContainer.appendChild(coordDisplay);
            imageMap.on("mousemove", this.onMapMouseMove);
            this.imageMap = imageMap;

            const gcpMapContainer = this.$el.querySelector(".gcp-map") as HTMLElement;
            const gcpMap = L.map(gcpMapContainer).setView([0, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(gcpMap);
            this.markerFeatureLayer.addTo(gcpMap);
            this.gcpMap = gcpMap;
        },
        readFile(file) {
            const reader = new FileReader();
            reader.onload = () => {
                const currentWorkspaceUUID = window.Alpine.store("currentWorkspaceUUID") as string;
                this.storage.set(currentWorkspaceUUID, this.parseGCPFile(reader.result as string));
                this.loadGCPs(currentWorkspaceUUID);
            };
            reader.readAsText(file);
        },
        parseGCPFile(content) {
            const lines = content.split('\n').map(line => line.trim());
            if (!lines) return;
            
            const binding = [] as BindedGCP[];
            const gcpProj = lines[0];

            lines.slice(1).forEach((line, index) => {
                const gcpPoint = {
                    id: `gcp${index}`,
                } as BindedGCP;
                
                const parts = line.split(/\s+/);
                if (parts.length < 3) return;

                const [x, y, height] = parts.slice(0, 3).map(part => Number(part));
                gcpPoint.gcp = { 
                    // x - longitude, y - latitude
                    latLong: proj4(gcpProj, WGS84Proj, [x, y]).reverse(),
                    height
                };
                
                if (parts.length > 3) {
                    if (isNaN(Number(parts[3])))  gcpPoint.id = parts[3];
                    else if (parts.length >= 6) {
                        const [imX, imY, imName] = parts.slice(3, 6);
                        gcpPoint.image = {
                            x: Number(imX),
                            y: Number(imY),
                            name: imName
                        };
        
                        if (parts.length > 6)  gcpPoint.id = parts[6];
                    } else console.warn('Invalid GCP file format!');
                }

                binding.push(gcpPoint);
            });
            return { proj: gcpProj, binding };
        },
        loadGCPs(workspaceUUID) {
            this.bindedGCPs = this.storage.get(workspaceUUID) as BindedGCPs;
            if (!this.bindedGCPs) return;
            
            const gcpMap = this.gcpMap as L.Map;
            this.bindedGCPs.binding.forEach(binding => {
                const [lat, long] = binding.gcp.latLong;
                L.marker([lat, long], {
                    icon: leafIcon
                })
                .bindTooltip('WORKS!')
                .addTo(this.markerFeatureLayer as L.FeatureGroup);
            });
            gcpMap.fitBounds(this.markerFeatureLayer.getBounds());
        },
        bindGCP(image, GCPMarker) {
            
        },
        changeImage(imageUrl: string | null) {
            if (!this.imageMap) return;

            if (!imageUrl) {
                if (!this.overlay) return;
                this.overlay.remove();
                this.overlay = null;
                return;
            }

            const image = new Image();
            const map = this.imageMap;
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
            if (!this.imageMap || !this.imageBounds) return;
            if (this.currentMarker) this.currentMarker = null;

            const center = this.imageMap.getCenter();

            this.currentMarker = L.marker(center, {
                icon: L.icon({
                    iconUrl: "http://localhost:5173/static/src/assets/pin.png",
                    iconSize: [50, 50],
                }),
                draggable: true,
            }).bindTooltip("gcpLabel", {
                permanent: true,
                direction: "top",
            }).addTo(this.imageMap);

            this.currentMarker.on('drag', this.onMarkerDrag);
            this.currentMarker.on('click', this.onMarkerClick);
        },
        onMarkerDrag(event) {
            const { lat, lng } = this.currentMarker?.getLatLng() as L.LatLng;
            const bounds = this.imageBounds as L.LatLngBounds;                
            const clampedLat = Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), lat));
            const clampedLng = Math.max(bounds.getWest(), Math.min(bounds.getEast(), lng));
            this.currentMarker?.setLatLng([clampedLat, clampedLng]);
        },
        onMarkerClick(event) {
            if (event.originalEvent.shiftKey) {
                this.isMarkerInBinding = !this.isMarkerInBinding;
            }
        },
        onMapMouseMove(e) {
            coordDisplay.textContent = `X: ${e.latlng.lng.toFixed(2)} | Y: ${e.latlng.lat.toFixed(2)}`;
        },
    } as GCPEditorComponent;
};