import * as L from "leaflet";

interface GCPMapElement extends HTMLElement {
    map: ReturnType<typeof L.map>;
}

interface GCPMapComponent {
    $el: GCPMapElement;
    init(): void;
}

const gcpMap = (() => {
    window.L = L;

    return {
        init() {
            const map = L.map(this.$el);
            this.$el.map = map;
        }
    } as GCPMapComponent;
})();

export default gcpMap;