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
    type UUID = `${string}-${string}-${string}-${string}-${string}`;
    type ISODateString = `${number}-${number}-${number}`;
    type EmailString = `${string}@${string}.${string}`;
    type TokenString = string;
    type URLString = string;

    interface Window {
        Alpine: import('alpinejs').Alpine;
    }

    namespace AlpineJSComponent {        
        type GCPEditor = import("./alpineComponents/GCPEditor").GCPEditorComponent;
        type OptionsForm = import("./alpineComponents/OptionsForm").FormComponent;
        type UppyWidget = import("./alpineComponents/UppyWidgets").UppyWidgetComponent;
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

    namespace DjangoAPI {
        interface Workspace {
            uuid: UUID;
            name: string;
            created_at_epoch: number;
            image_count: number;
        }

        interface Preset {
            id: number;
            name: string;
            preset_type: "global" | "custom";
        }
        
        interface TaskOption {
            groupName: string;
            fields: {
                name: string;
                type: string;
                help: string;
                domain: string;
            }[];
        }

        interface Task {
            uuid: UUID;
            name: string;
            workspace_uuid: UUID;
            status: string;
            created_at_epoch: number;
        }
        type NotificatonStatus = 
            "debug" |
            "info" |
            "succes" |
            "warning" |
            "error";

        interface SSENotification {
            id: number;
            message: string;
            status: {
                code: number;
                name: NotificationStatus;
            };
        }

        interface Notification extends SSENotification {
            read: boolean;
            created_at_epoch: number;
            related_object_id: number;
            related_object_uuid: string;
        }

        interface UserProfile {
            bio: string;
            avatar: URLString;
            birth_date: ISODateString;
        }

        interface User {
            id: number;
            username: string;
            email: EmailString;
            first_name: string;
            last_name: string;
            profile: UserProfile;
            tokens: {
                acces: TokenString,
                refresh: TokenString;
            };
            role: "admin" | null;
        }

        interface GCPointBinding {
            id: number,
            label: string;
            location: {
                lat: number;
                long: number;
                alt: number;
            },
            image: {
                name: string;
                x: number;
                y: number;
            }
        }
    }
}