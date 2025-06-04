import { View } from 'ol';
import { getCenter } from 'ol/extent';
import { Image as ImageLayer } from 'ol/layer';
import { ImageStatic as ImageStaticSource } from 'ol/source';
import { Projection } from 'ol/proj';
import HTMLOlLayer from './HTMLOlLayer';


export default class HTMLOlImageLayer extends HTMLOlLayer {
    static get observedAttributes() {
        return ['src'];
    }

    constructor() {
        super(new ImageLayer());
    }
    
    loadImage(src: string | null) {
        const map = this.layer.getMapInternal();
        if (!map) return;
        if (!src) {
            this.layer.setSource(null);
            return;
        }
		const img = new Image();
		img.src = src;
		img.onload = () => {
			const extent = [0, 0, img.width, img.height];
			const projection = new Projection({
				code: 'xkcd-image',
				units: 'pixels',
				extent,
			});
			const imageStaticSource = new ImageStaticSource({
				url: src,
				imageExtent: extent,
				projection
			});
			this.layer.setSource(imageStaticSource);
            const padding = {
                horizontal: img.width/3,
                vertical: img.height/3,
            };
            const view = new View({
				projection: projection,
				center: getCenter(extent),
				zoom: 0,
				maxZoom: 6,
                extent: [
                    -padding.horizontal,
                    -padding.vertical,
                    img.width + padding.horizontal,
                    img.height + padding.vertical
                ],
			})
			map.setView(view);
		}
    }
    
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'src':
                newValue !== oldValue && this.loadImage(newValue);
                break;
            default:
                console.log(`Callback function for attribute ${name} change not implemented!`);
        }
    }

}