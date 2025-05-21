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

import * as components from "./alpineComponents";
import type { Alpine } from "alpinejs";

export declare global {
    var Alpine: Alpine;
}

export {
    components,
    PluginLoader,
    ComponentLoader,
    LoaderMap,
    RegisterFunction,
    GlobalIntervalStore,
}