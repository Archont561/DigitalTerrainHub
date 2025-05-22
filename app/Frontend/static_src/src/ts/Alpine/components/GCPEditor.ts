import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import proj4 from "proj4";
import { html } from "../../utils";
import { 
    BindedGCP,
    GCPEditorComponent,
    GCPBinding,
    ImageBinding,
} from "../../@types/alpineComponents/GCPEditor";

export default () => {
    window.Alpine.store("GCPMapData", new Map<string, BindedGCP[]>());
    
    const WGS84Proj = "EPSG:4326";
    const leafIcon = L.icon({
        iconUrl: "https://docs.maptiler.com/sdk-js/examples/custom-points-icon-png/underground.png",
        iconSize: [24, 26],
    });
    const coordDisplay = html`
        <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-1 px-2 text-xs rounded z-10">
            Coordinates Display
        </div>
    `;
    
    let isMarkerInBinding = false;
    let currentImageBinding: ImageBinding | null = null;
    let currentGCPBinding: GCPBinding | null = null;
    
    const component = {
        showMap: false,
        storage: window.Alpine.store("GCPMapData") as Map<string, BindedGCP[]>,

        init() {
            const imageMap = L.map(this.$refs.imageMapContainer, {
                crs: L.CRS.Simple,
                minZoom: -3,
                maxZoom: 1,
                maxBoundsViscosity: 1,
            });
            this.$refs.imageMapContainer.appendChild(coordDisplay);
            imageMap.on("mousemove", this.onImageMapMouseMove);
            this.imageMap = imageMap;

            const gcpMap = L.map(this.$refs.gcpMapContainer).setView([0, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(gcpMap);
            this.gcpMap = gcpMap;
        },
        readFile(file) {
            const reader = new FileReader();
            reader.onload = () => {
                const currentWorkspaceUUID = window.Alpine.store("currentWorkspaceUUID") as string;
                this.storage.set(currentWorkspaceUUID, this.parseGCPFile(reader.result as string));
                this.changeGCPs(currentWorkspaceUUID);
                currentImageBinding && this.changeImage(currentImageBinding.imageLayer.getElement()?.src as string);
            };
            reader.readAsText(file);
        },
        parseGCPFile(content) {
            const lines = content.split('\n').map(line => line.trim());
            if (!lines) return;
            
            const bindedGCPs = [] as BindedGCP[];
            const gcpProj = lines[0];

            lines.slice(1).forEach((line, index) => {
                const parts = line.split(/\s+/);
                if (parts.length < 3) return;
                
                const gcpPoint = {} as BindedGCP;
                gcpPoint.id = `gcp${index}`;
                
                const [x, y, height] = parts.slice(0, 3).map(part => Number(part));
                // x - longitude, y - latitude
                const marker = new L.Marker(proj4(gcpProj, WGS84Proj, [x, y]).reverse() as L.LatLngExpression);
                marker.on("click", this.onGCPMarkerClick);
                gcpPoint.gcp = { marker, height };
                
                if (parts.length > 3) {
                    if (isNaN(Number(parts[3])))  gcpPoint.id = parts[3];
                    else if (parts.length >= 6) {
                        const [imX, imY, imName] = parts.slice(3, 6);
                        gcpPoint.image = {
                            marker: new L.Marker([Number(imY), Number(imX)]),
                            name: imName,
                        };
        
                        if (parts.length > 6)  gcpPoint.id = parts[6];
                    } else console.warn('Invalid GCP file format!');
                }

                bindedGCPs.push(gcpPoint);
            });
            return bindedGCPs;
        },
        changeGCPs(workspaceUUID) {
            if (!workspaceUUID) {
                currentGCPBinding?.layer.remove();
                currentGCPBinding = null;
                this.showMap = false;
                return;
            }

            window.htmx.ajax('GET', 
                `/pyodm/workspace/${workspaceUUID}/?images`, 
                this.$refs.thumbnailContainer
            );

            const bindedGCPs = this.storage.get(workspaceUUID) as BindedGCP[];
            if (!bindedGCPs) {
                this.showMap = false;
                return;
            }

            const gcpMap = this.gcpMap as L.Map;
            const layer = new L.FeatureGroup().addTo(gcpMap);
            bindedGCPs.forEach(bindedGCP => {
                bindedGCP.gcp && bindedGCP.gcp.marker
                .setIcon(leafIcon)
                .bindTooltip('WORKS!')
                .addTo(layer);
            });
            gcpMap.fitBounds(layer.getBounds());
            currentGCPBinding = { layer, bindedGCPs };
            this.showMap = true;
        },
        bindGCP(GCPMarker) {
            if (!currentGCPBinding || !currentImageBinding || !currentImageBinding.activeMarker) return;

            const gcpLabel = GCPMarker.getTooltip()?.getContent()?.toString();
            const imageName = new URL(currentImageBinding.imageLayer.getElement()?.src as string).pathname.split("/").pop();
            const marker = currentImageBinding.activeMarker as L.Marker;
            const bindedGCP = {
                id: gcpLabel as string,
                image: {
                    name: imageName as string,
                    marker,
                },
                gcp: { marker: GCPMarker }
            } as BindedGCP;
            currentGCPBinding.bindedGCPs.push(bindedGCP);
            currentImageBinding.activeMarker = null;
            marker.closeTooltip();
            marker.options = {
                draggable: false,
            }
        },
        changeImage(imageUrl) {
            if (!imageUrl) {
                currentImageBinding?.imageLayer.remove();
                currentImageBinding?.markersLayer.remove();
                currentImageBinding = null;
                return;
            }  
            const image = new Image();
            const imageMap = this.imageMap as L.Map;
            image.onload = () => {         
                const imageBounds = new L.LatLngBounds([[0, 0], [image.height, image.width]]);             
                const imageLayer = L.imageOverlay(imageUrl, imageBounds).addTo(imageMap);
                imageMap.fitBounds(imageBounds).setMaxBounds(imageBounds);

                const markersLayer = new L.FeatureGroup();
                currentGCPBinding?.bindedGCPs.forEach(bindedGCP => {
                    if (!bindedGCP.image) return;
                    bindedGCP.image?.marker.addTo(markersLayer);
                });
                markersLayer.addTo(imageMap);
                currentImageBinding = {
                    imageBounds,
                    imageLayer,
                    markersLayer,
                    activeMarker: null,
                };
            };
            image.src = imageUrl;
        },
        createMarker() {
            if (!this.imageMap || !currentImageBinding) return;
            if (!currentGCPBinding) {
                alert("Import GCPs! ");
                return;
            }
            if (currentImageBinding.activeMarker) {
                alert("Already created!");
                return;
            };

            const gcpLabel = `gcp${currentGCPBinding.bindedGCPs.filter(el => el.image).length}`;
            const iconSize = [30, 30];
            const marker = L.marker(this.imageMap.getCenter(), {
                icon: L.icon({
                    iconUrl: "http://localhost:5173/static/src/assets/pin.png",
                    iconSize: iconSize as L.PointExpression,
                }),
                draggable: true,
            }).bindTooltip(gcpLabel, {
                permanent: true,
                direction: "top",
                offset: [0, -iconSize[0]/2 + 1],
            }).addTo(currentImageBinding.markersLayer);

            marker.on('drag', this.onImageMarkerDrag);
            marker.on('click', this.onImageMarkerClick);
            currentImageBinding.activeMarker = marker;
        },
        onImageMarkerDrag(event) {
            const marker = currentImageBinding?.activeMarker;
            const imageBinding = currentImageBinding;
            if (!marker || !imageBinding) return;

            const { lat, lng } = marker.getLatLng();
            const bounds = imageBinding.imageBounds;            
            const clampedLat = Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), lat));
            const clampedLng = Math.max(bounds.getWest(), Math.min(bounds.getEast(), lng));
            marker.setLatLng([clampedLat, clampedLng]);
        },
        onImageMarkerClick(event) {
            if (event.originalEvent.shiftKey) {
                isMarkerInBinding = !isMarkerInBinding;
            }
        },
        onGCPMarkerClick(event) {
            if (isMarkerInBinding && event.originalEvent.shiftKey) {
                isMarkerInBinding = false;
                component.bindGCP(event.target);
            }
        },
        onImageMapMouseMove(e) {
            coordDisplay.textContent = `X: ${e.latlng.lng.toFixed(2)} | Y: ${e.latlng.lat.toFixed(2)}`;
        },
        bindedGCPsToTXT(workspaceUUID) {
            if (!workspaceUUID) return null;
            
            const bindedGCPs = this.storage.get(workspaceUUID);
            if (!bindedGCPs) return;
            
            return bindedGCPs.map(bindedGCP => {
                const gcpLatLng = bindedGCP.gcp?.marker.getLatLng();
                const imgLatLng = bindedGCP.image?.marker.getLatLng();
                
                if (!gcpLatLng || !imgLatLng) return null;
                
                const gcpX = gcpLatLng.lng.toFixed(6);
                const gcpY = gcpLatLng.lat.toFixed(6);
                const gcpH = (bindedGCP.gcp?.height ?? 0).toFixed(2);
                const imX = imgLatLng.lng.toFixed(6);
                const imY = imgLatLng.lat.toFixed(6);
                const imName = bindedGCP.image?.name ?? "";
        
                return `${gcpX} ${gcpY} ${gcpH} ${imX} ${imY} ${imName} ${bindedGCP.id}`;
            }).filter(line => line !== null).join("\n");
        },
    } as GCPEditorComponent;
    return component;
};