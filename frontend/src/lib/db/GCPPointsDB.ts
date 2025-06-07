import Dexie from "dexie";

export default class GCPointsDB extends Dexie {
    images!: Dexie.Table<ImagePoint, number>;
    points!: Dexie.Table<GCPoint, number>;
    binding!: Dexie.Table<GCPointBinding, number>;
    csrfToken: string;

    constructor(csrfToken: string) {
        super("GCPointsDB");
        this.csrfToken = csrfToken;
        this.version(1).stores({
            images: '++id, x, y, name',
            points: '++id, lat, long, alt, label, workspaceUUID',
            binding: 'id, imageId, pointId, updated',
        });
        this.images.mapToClass(ImagePoint);
        this.points.mapToClass(GCPoint);
        this.binding.mapToClass(GCPointBinding);
    }

    private getWorkspaceApiEndpoint(workspaceUUID: string) {
        return `${import.meta.env.PUBLIC_URL}/api/pyodide/workspaces/${workspaceUUID}`;
    }

    async createBinding(gcPointID: number, imagePointId: number) {
        const gcpoint = await this.points.get(gcPointID);
        const imagePoint = await this.images.get(imagePointId);
        if (!gcpoint || !imagePoint) {
            console.error("Cannot create binding!");
            return;
        }
        const apiEndpoint = `${this.getWorkspaceApiEndpoint(gcpoint.workspaceUUID)}/gcpoints`;

        const bindingToRegister = {
            label: gcpoint.label,
            location: {
                lat: gcpoint.lat,
                long: gcpoint.long,
                alt: gcpoint.alt,
            },
            image: imagePoint,
        };

        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "X-CSRFToken": this.csrfToken },
                body: JSON.stringify(bindingToRegister)
            });          

            if (response.ok) {
                const responseData = await response.json();
                console.log("Data successfully posted to API:", responseData);
                Object.assign(bindingToRegister, { "id": responseData.id });
                await this.deserializeBinding(bindingToRegister as any, gcpoint.workspaceUUID);
            } else {
                console.error("Failed to post data:", response.statusText);
            }
        } catch (error) {
            console.error("Error posting data to API:", error);
        }
    }

    createImagePoint(image: ImagePoint) {
        return this.images.add(image);
    }

    createGCPoint(point: GCPoint) {
        return this.points.add(point);
    }

    async serializeBinding(binding: GCPointBinding): Promise<DjangoAPI.GCPointBinding> {
        const point = await this.points.get(binding.pointId);
        const image = await this.images.get(binding.imageId);

        return {
            id: binding.id,
            label: point?.label || '',
            location: {
                lat: point?.lat || 0,
                long: point?.long || 0,
                alt: point?.alt || 0
            },
            image: {
                name: image?.name || '',
                x: image?.x || 0,
                y: image?.y || 0
            }
        };
    }

    async deserializeBinding(gcpPointBinding: DjangoAPI.GCPointBinding, workspaceUUID: string) {
        const image = gcpPointBinding.image;

        const point = {
            lat: gcpPointBinding.location.lat,
            long: gcpPointBinding.location.long,
            alt: gcpPointBinding.location.alt,
            label: gcpPointBinding.label,
            workspaceUUID: workspaceUUID
        };

        const imageId = await this.images.add(image  as any);
        const pointId = await this.points.add(point as any);

        const binding = {
            imageId,
            pointId,
            id: gcpPointBinding.id,
            updated: true
        };

        return this.binding.add(binding);
    }

    async getBindingsByWorkspace(workspaceUUID: string) {
        const pointIds = await this.points
            .where("workspaceUUID")
            .equals(workspaceUUID)
            .primaryKeys();
        return await this.binding
            .where("pointId")
            .anyOf(pointIds)
            .toArray();
    }

    async getImagePointsByName(imageName: string) {
        return await this.images.where("name").equals(imageName).toArray();
    }

    async getGCPointsByWorkspace(workspaceUUID: string) {
        return await this.points
            .where("workspaceUUID")
            .equals(workspaceUUID)
            .toArray();
    }

    async loadWorkspaceBindings(workspaceUUID: string, data: DjangoAPI.GCPointBinding[]) {
        return await Promise.all(
            data.map(entry => this.deserializeBinding(entry, workspaceUUID))
        );
    }

    async saveWorkspaceUpdatedBindings(workspaceUUID: string) {
        const updatedWorkspaceBindings = await this.binding
            .where("pointId")
            .anyOf(await this.points
                .where("workspaceUUID")
                .equals(workspaceUUID)
                .primaryKeys()
            ).and(binding => binding.updated)
            .toArray();
        const currentSerializedUpdatedBindings = await Promise.all(
            updatedWorkspaceBindings.map(binding => this.serializeBinding(binding))
        );
        const apiEndpoint = `${this.getWorkspaceApiEndpoint(workspaceUUID)}/gcpoints`;
        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "X-CSRFToken": this.csrfToken },
                body: JSON.stringify(currentSerializedUpdatedBindings)
            });          

            if (response.ok) {
                const responseData = await response.json();
                console.log("Data successfully posted to API:", responseData);
            } else {
                console.error("Failed to post data:", response.statusText);
            }
        } catch (error) {
            console.error("Error posting data to API:", error);
        }
    }
}

export class ImagePoint {
    id!: number;
    name!: string;
    x!: number;
    y!: number;
}

export class GCPoint {
    id!: number;
    lat!: number;
    long!: number;
    alt!: number;
    label!: string;
    workspaceUUID!: string;
}

export class GCPointBinding {
    imageId!: number;
    pointId!: number;
    id!: number;
    updated!: boolean;
}