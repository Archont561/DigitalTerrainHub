export {};

declare global {
    type UUID = `${string}-${string}-${string}-${string}-${string}`;
    type ISODateString = `${number}-${number}-${number}`;
    type EmailString = `${string}@${string}.${string}`;
    
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

        type NotificationStatus = "INFO" | "WARNING" | "ERROR" | string;
        
        interface Notification {
            id: number;
            message: string;
            status: NotificationStatus;
            read: boolean;
            created_at_epoch: number;
            related_object_id: number;
            related_object_uuid: string;
        }

        interface UserProfile {
            bio: string;
            avatar: string;
            birth_date: ISODateString;
        }

        interface User {
            id: number;
            username: string;
            email: EmailString;
            first_name: string;
            last_name: string;
            profile: UserProfile;
        }
    }
}