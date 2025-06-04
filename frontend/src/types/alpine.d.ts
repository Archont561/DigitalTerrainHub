import type { AlpineComponent } from "alpinejs";

export namespace alpine {
    type PluginLoader = () => Promise<any>;
    type ComponentLoader = () => Promise<(...args: any[]) => any>;
    type LoaderMap = Record<string, PluginLoader | ComponentLoader>;
    type RegisterFunction = (name: string, loaded: any) => void;

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

    interface AlpineManager {
        init(): void;
        findComponent(name: string): AlpineComponent<any>;
        loadAlpineGlobalState(): void;
    }
}