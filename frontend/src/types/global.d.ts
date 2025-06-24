import type { HTMLAttributes, HTMLTag } from 'astro/types';
import type {
    HTMLOlMapControlProps,
    HTMLOlMapProps,
    HTMLOlImageLayerProps,
    HTMLOlTileLayerProps,
    HTMLOlVectorLayerProps,
} from '@lib/WebComponents';

export { };

declare global {
    interface Window {
        Alpine: import('alpinejs').Alpine;
        htmx: typeof import("htmx.org");
        utils: import("./utils").Utils;
    }

    namespace Astro {
        type HTMLComponentProps<T extends HTMLTag> = HTMLAttributes<Tag> & Record<string, any>;
        type ComponentProps = HTMLComponentProps<"div">;

        namespace WebComponentsProps {
            type OLMapControl =  HTMLOlMapControlProps & ComponentProps;
            type OlMap = HTMLOlMapProps & ComponentProps;
            type OlImageLayer = HTMLOlImageLayerProps & ComponentProps;
            type OlTileLayer = HTMLOlTileLayerProps & ComponentProps;
            type OlVectorLayer = HTMLOlVectorLayerProps & ComponentProps;
        }
    }
}