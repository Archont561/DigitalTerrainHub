import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { html } from "../../utils";
import { ImageMap } from "../../@types/alpineComponents/ImageMap";


const ImageMap = () => {  
    return {
        overlay: null,
        init() {
            this.map = L.map(this.$el, {
                crs: L.CRS.Simple,
                minZoom: -3,
                maxZoom: 1,
                maxBoundsViscosity: 1,
            });
            this.map.getContainer().style.backgroundColor = 'transparent';

            const coordDisplay = html`
                <div class="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-1 px-2 text-xs rounded z-10">
                    Coordinates Display
                </div>`;
            this.$el.appendChild(coordDisplay);

            this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
                coordDisplay.textContent = `X: ${e.latlng.lng.toFixed(2)} | Y: ${e.latlng.lat.toFixed(2)}`;
            });
        },
        changeImage(imageUrl: string | null) {
            console.log('asdf')
            if (!this.map) return;

            if (!imageUrl) {
                if (!this.overlay) return;
                
                this.map.removeLayer(this.overlay);
                this.overlay = null;
                return;
            }

            const image = new Image();
            const map = this.map
            image.onload = () => {         
                const imageBounds = [[0, 0], [image.height, image.width]] as L.LatLngBoundsExpression;             
                const overlay = L.imageOverlay(imageUrl, imageBounds).addTo(map);
                map.fitBounds(imageBounds).setMaxBounds(imageBounds);
                this.overlay = overlay;
            };
            image.src = imageUrl;
        },
        custom() {
            if (!this.map) return;
        
            const customElement = html`
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    p-4 bg-white bg-opacity-80 border border-black rounded-md z-50">
                    Custom Element
                </div>`;
            
            this.$el.appendChild(customElement);
        }
    } as ImageMap;
};

export default ImageMap;