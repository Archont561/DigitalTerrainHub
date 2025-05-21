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
    markerFeatureLayer: L.FeatureGroup;
    init(): void;
    loadGCPs(workspaceUUID: string): void;
    bindGCP(image: string, GCPMarker: HTMLElement): void;
    readFile(file: File): void; 
    parseGCPFile(content: string): BindedGCPs;
}

export {
    BindedGCP,
    BindedGCPs,
    GCPMapComponent,
}