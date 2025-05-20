import L from "leaflet";
import proj4 from "proj4";
import 'leaflet/dist/leaflet.css';


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

type GCPMapData = Map<string, BindedGCPs>;

interface GCPMapComponent {
    $el: HTMLElement;
    map: L.Map | null;
    storage: GCPMapData;
    bindedGCPs: BindedGCPs | null;
    markerGroupLayer: L.LayerGroup;
    init(): void;
    loadGCPs(workspaceUUID: string): void;
    bindGCP(image: string, GCPMarker: HTMLElement): void;
    readFile(file: File): void; 
    parseGCPFile(content: string): BindedGCPs;
}


const GCPMap = () => {  
    window.L = L;
    window.Alpine.store("GCPMapData", new Map<string, BindedGCPs>());
    const WGS84Proj = "EPSG:4326";
    const leafIcon = L.icon({
        iconUrl: "https://docs.maptiler.com/sdk-js/examples/custom-points-icon-png/underground.png", //your custom pin
        iconSize: [24, 26],
    });

    return {
        map: null,
        storage: window.Alpine.store("GCPMapData"),
        markerGroupLayer: new L.LayerGroup(),
        bindedGCPs: null,
        init() {
            const mapView = window.htmx.find(this.$el, ".gcp-leaflet-map");
            const map = L.map(mapView).setView([0, 0], 2);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);
            this.markerGroupLayer.addTo(map);

            this.map = map;
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
            console.log(binding);
            return { proj: gcpProj, binding };
        },
        loadGCPs(workspaceUUID) {
            this.bindedGCPs = this.storage.get(workspaceUUID) as BindedGCPs;
            if (!this.bindedGCPs) return;
            
            const map = this.map as L.Map;
            const bounds = L.latLngBounds([]);
            this.bindedGCPs.binding.forEach(binding => {
                const [lat, long] = binding.gcp.latLong
                const marker = L.marker([lat, long], {
                    icon: leafIcon
                }).addTo(this.markerGroupLayer);
                marker.bindTooltip(`H: ${binding.gcp.height}`);
                bounds.extend([lat, long]);
            });
            map.fitBounds(bounds);
        },
    } as GCPMapComponent;
};

export default GCPMap;