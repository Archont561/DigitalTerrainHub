export type { default as HTMLOlImageLayer } from "./HTMLOlImageLayer";
export type { default as HTMLOlMap } from "./HTMLOlMap";
export type { default as HTMLOlTileLayer } from "./HTMLOlTileLayer";
export type { default as HTMLOlVectorLayer } from "./HTMLOlVectorLayer";
export type { default as HTMLOlMapControl } from "./HTMLOlMapControl";
export type { default as HTMLOlLayer } from "./HTMLOlLayer";


export default {

    async init() {
        if (!document.querySelector("ol-map")) {
            console.info("No <ol-map> element found. Skipping initialization.");
            return;
        }

        try {
            // Dynamically import proj4 and ol/proj/proj4
            const proj4 = await import("proj4");
            const { register } = await import("ol/proj/proj4");

            // Register custom projections
            this.registerProjections(proj4.default || proj4, register);

            // Register custom web components
            await this.registerWebComponents();
        } catch (error) {
            console.error("Failed to initialize map system:", error);
            throw error; // Optionally rethrow to allow caller to handle
        }
    },
    
    registerProjections(proj4: any, register: any) {
        try {
            // Define EPSG:2180 projection (PUWG 1992)
            proj4.defs(
                "EPSG:2180",
                "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
            );

            // Register the projection with OpenLayers
            register(proj4);
            console.log("Projection EPSG:2180 registered successfully");
        } catch (error) {
            console.error("Failed to register projection EPSG:2180:", error);
            throw error;
        }
    },

    async registerWebComponents() {
        try {
            // Import all web component modules in parallel
            const imports = await Promise.all([
                import("./HTMLOlMap").then((module) => ["ol-map", module.default]),
                import("./HTMLOlMapControl").then((module) => ["ol-control", module.default]),
                import("./HTMLOlImageLayer").then((module) => ["ol-image-layer", module.default]),
                import("./HTMLOlTileLayer").then((module) => ["ol-tile-layer", module.default]),
                import("./HTMLOlVectorLayer").then((module) => ["ol-vector-layer", module.default]),
            ]);

            imports.forEach(([tagName, component]) => {
                if (typeof component === "function") {
                    customElements.define(tagName as string, component);
                    console.log(`Registered web component: ${tagName}`);
                } else {
                    console.warn(`Invalid component for ${tagName}. Expected a class, got:`, typeof component);
                }
            });
        } catch (error) {
            console.error("Failed to register web components:", error);
            throw error;
        }
    },
};