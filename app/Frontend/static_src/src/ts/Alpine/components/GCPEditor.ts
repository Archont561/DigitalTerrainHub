import {
    GCPEditorComponent,
    Store,
    OlPoint,
    UUID,
    Binding,
    BindedGCP,
} from "../../@types/alpineComponents/GCPEditor";
import type { default as HTMLOlVectorLayer } from "../../WebComponets/HTMLOlVectorLayer";
import { type Interaction, Select, Translate } from "ol/interaction";
import { singleClick, shiftKeyOnly } from "ol/events/condition";
import { SelectEvent } from "ol/interaction/Select";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { Point } from "ol/geom";
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import { Coordinate } from "ol/coordinate";


export default () => {
    window.Alpine.store("GCPMapData", new Map());
    const store = window.Alpine.store("GCPMapData") as Store;

    return {
        workspaceBinding: null,
        currentGCPFeature: null,
        currentImageMarkerFeature: null,

        init() {
            const imageMarkersLayerContainer = this.$refs.imageMarkersLayerContainer as HTMLOlVectorLayer;
            const GCPsLayerContainer = this.$refs.GCPsLayerContainer as HTMLOlVectorLayer;
            const GCPLayer = GCPsLayerContainer.getLayer() as VectorLayer;
            const imgMarkersLayer = imageMarkersLayerContainer.getLayer() as VectorLayer;
            const defaultStyle = new Style({
                image: new Circle({
                    radius: 3,
                    fill: new Fill({ color: 'black' }),
                    stroke: new Stroke({ color: 'yellow', width: 2 }),
                }),
            });

            GCPLayer.setStyle(defaultStyle);
            imgMarkersLayer.setStyle(defaultStyle);

            const selectedStyle = new Style({
                image: new Circle({
                    radius: 8,
                    fill: new Fill({ color: 'red' }),
                    stroke: new Stroke({ color: 'black', width: 2 }),
                }),
            });

            const selecteShiftdStyle = new Style({
                image: new Circle({
                    radius: 8,
                    fill: new Fill({ color: 'brown' }),
                    stroke: new Stroke({ color: 'white', width: 4 }),
                }),
            });

            const gcpShiftSelect = new Select({
                condition: event => singleClick(event) && shiftKeyOnly(event),
                multi: false,
                layers: [GCPLayer],
                style: selecteShiftdStyle,
            });

            const imgSelect = new Select({
                condition: singleClick,
                multi: false,
                layers: [imgMarkersLayer],
                style: selectedStyle,
            });

            const imgTranslate = new Translate({
                features: imgSelect.getFeatures(),
            });

            imgSelect.on("select", event => {
                const { selected, deselected } = event as SelectEvent;
                const feature = selected?.at(0);
                if (feature) this.currentImageMarkerFeature = feature as OlPoint;
                else this.currentImageMarkerFeature = null;
            });
            gcpShiftSelect.on("select", event => {
                const { selected, deselected } = event as SelectEvent;
                const feature = selected?.at(0);
                if (!feature) return;
                this.currentGCPFeature = feature as OlPoint;

                if (this.currentImageMarkerFeature) {
                    const markerFeature = this.currentImageMarkerFeature as OlPoint;
                    feature.setStyle(defaultStyle);
                    markerFeature.setStyle(defaultStyle);
                    gcpShiftSelect.getFeatures().remove(feature);
                    imgSelect.getFeatures().remove(markerFeature);
                    this.bindCurrentSelection();
                }
            });
            GCPsLayerContainer.setInteraction("shiftSelect", gcpShiftSelect);
            imageMarkersLayerContainer.setInteraction("select", imgSelect);
            imageMarkersLayerContainer.setInteraction("translate", imgTranslate);
        },

        onReveal() {
            const workspaceUUID = window.Alpine.store("currentWorkspaceUUID");
            if (!workspaceUUID) return;

            window.htmx.ajax('GET',
                `/pyodm/workspace/${workspaceUUID}/?thumbnails`,
                this.$refs.thumbnailContainer,
            );

            this.workspaceBinding = this.getOrCreateBinding(workspaceUUID as string);

            const GCPsLayerContainer = this.$refs.GCPsLayerContainer as HTMLOlVectorLayer;
            const GCPsMarkersSource = GCPsLayerContainer.getSource();
            GCPsMarkersSource.clear();

            this.workspaceBinding.forEach((bindedGCP, uuid) => {
                bindedGCP.gcp && GCPsMarkersSource.addFeature(bindedGCP.gcp);
            });
        },

        changeImage(imageUrl) {
            if (!this.workspaceBinding) return;
            const imageMarkersLayerContainer = this.$refs.imageMarkersLayerContainer as HTMLOlVectorLayer;
            this.$refs.imageLayerContainer.setAttribute('src', imageUrl);
            if (!imageUrl) return;
            const currentImgName = new URL(imageUrl).pathname.split('/').filter(part => part)?.at(-1)
            const imgMarkersSource = imageMarkersLayerContainer.getSource();
            [...this.workspaceBinding.values()].filter(
                bindedGCP => bindedGCP.image?.get("imgName") === currentImgName
            ).forEach(
                bindedGCP => imgMarkersSource.addFeature(bindedGCP.image as OlPoint)
            );
        },

        registerImageMarker(marker) {
            const workspaceUUID = window.Alpine.store("currentWorkspaceUUID") as string | undefined;
            //@ts-ignore
            const imageUrl = this.$data.currentImage as (string | null);
            if (!workspaceUUID || !imageUrl) return;

            const imgName = new URL(imageUrl).pathname.split('/').filter(part => part)?.at(-1);
            const uuid = this.getOrSetUUID(marker);
            const binding = this.getOrCreateBinding(workspaceUUID);
            imgName && marker.set("imgName", imgName);
            binding.set(uuid, { image: marker });
        },

        registerGCPMarker(marker) {
            const workspaceUUID = window.Alpine.store("currentWorkspaceUUID") as string | undefined;
            if (!workspaceUUID) return;
            const uuid = this.getOrSetUUID(marker);
            const binding = this.getOrCreateBinding(workspaceUUID);
            binding.set(uuid, { gcp: marker });
        },

        getOrSetUUID(feature) {
            let uuid = feature.getId();
            if (!uuid) {
                uuid = crypto.randomUUID();
                feature.setId(uuid);
            }
            return uuid;
        },

        getOrCreateBinding(workspaceUUID) {
            let binding = store.get(workspaceUUID);
            if (!binding) {
                binding = new Map();
                store.set(workspaceUUID, binding);
            }
            return binding
        },

        bindCurrentSelection() {
            if (!this.workspaceBinding || !this.currentGCPFeature || !this.currentImageMarkerFeature) return;
            const uuid = this.getOrSetUUID(this.currentImageMarkerFeature as OlPoint);
            this.workspaceBinding.set(uuid as UUID, {
                gcp: this.currentGCPFeature as OlPoint,
                image: this.currentImageMarkerFeature as OlPoint,
            })
            this.workspaceBinding?.delete(String(this.currentGCPFeature.getId()));
            this.currentGCPFeature.setId(uuid);
            this.currentGCPFeature = null;
            this.currentImageMarkerFeature = null;
        },

        async loadGCPsFromFile(file) {
            if (!this.workspaceBinding) return;
            const GCPLayerContainer = this.$refs.GCPsLayerContainer as HTMLOlVectorLayer;
            await GCPLayerContainer.loadGroundControlPointsFile(file);
            GCPLayerContainer.getSource().forEachFeature(feature => {
                this.registerGCPMarker(feature as OlPoint);
            });
        },

        getBindedFeatures() {
            const bindedFeatures: any[] = [];

            store.forEach((binding: Binding, workspaceUUID: UUID) => {
                binding.forEach((bindedGCP: BindedGCP, bindingUUID: UUID) => {
                    if (bindedGCP.gcp && bindedGCP.image) {
                        const gcpCoords = bindedGCP.gcp.getGeometry()?.getCoordinates();
                        const imgCoords = bindedGCP.image.getGeometry()?.getCoordinates();
                        const imgName = bindedGCP.image.get('imgName');

                        if (gcpCoords && imgCoords) {
                            bindedFeatures.push({
                                workspaceUUID,
                                bindingUUID,
                                gcp: {
                                    x: gcpCoords[0],
                                    y: gcpCoords[1],
                                    z: gcpCoords?.[2],
                                },
                                image: {
                                    x: imgCoords[0],
                                    y: imgCoords[1],
                                    imgName,
                                }
                            });
                        }
                    }
                });
            });
            return bindedFeatures;
        },

        saveChanges() {
            
        },
    } as GCPEditorComponent;
};