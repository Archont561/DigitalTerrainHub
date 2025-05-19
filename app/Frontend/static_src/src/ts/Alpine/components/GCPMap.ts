import * as L from "leaflet";
import 'leaflet/dist/leaflet.css';

interface GCPMapElement extends HTMLElement {
    map: ReturnType<typeof L.map>;
}

interface BindedGCP {
    id: string;
    image: {
        name: string;
        x: Number;
        y: Number;
    };
    gcp: {
        x: Number;
        y: Number;
        z: Number;
    }
}

interface GCPMapComponent {
    $el: GCPMapElement;
    init(): void;
    bindedGCPs: {
        proj: string;
        binding: BindedGCP[];
    };
    loadGCPs(): void;
    bindGCP(image: string, GCPMarker: HTMLElement): void;
    handleGCPFileLoading(file: string): void;
}

const GCPMap = () => {
    window.L = L;

    return {
        init() {
            const mapView = window.htmx.find(this.$el, ".gcp-leaflet-map");
            const map = L.map(mapView).setView([0, 0], 2);
            this.$el.map = map;
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);
        },
    } as GCPMapComponent;
};

export default GCPMap;