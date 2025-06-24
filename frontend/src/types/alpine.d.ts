import type Alpine, { AlpineComponent } from "alpinejs";

export {};

declare global {
    namespace alpine {        
        type Component<T> = AlpineComponent<T>;

        interface GlobalIntervalStore {
            interval: number;
            flag: boolean;
            intervalID: ReturnType<typeof setInterval> | null;

            stop(): void;
            init(): void;
            update(): void;
            setIntervalValue(interval: number): void;
            resume(): void;
        }

        namespace Components {
            type GCPEditor = import("./alpineComponents/GCPEditor").GCPEditorComponent;
            type OptionsForm = import("./alpineComponents/OptionsForm").FormComponent;
            type UppyWidget = import("./alpineComponents/UppyWidgets").UppyWidgetComponent;
        }

    }
}