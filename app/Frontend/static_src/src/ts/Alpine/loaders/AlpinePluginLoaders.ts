//@ts-nocheck
import { alpine } from "../../@types";

const AlpinePluginLoaders: Record<string, alpine.PluginLoader> = {
    // anchor: async () => (await import('@alpinejs/anchor')).default,
    // mask: async () => (await import('@alpinejs/mask')).default,
    // focus: async () => (await import('@alpinejs/focus')).default,
    // intersect: async () => (await import('@alpinejs/intersect')).default,
    // resize: async () => (await import('@alpinejs/resize')).default,
    // persist: async () => (await import('@alpinejs/persist')).default,
    // collapse: async () => (await import('@alpinejs/collapse')).default,
    // morph: async () => (await import('@alpinejs/morph')).default,
    // sort: async () => (await import('@alpinejs/sort')).default,
};

export default AlpinePluginLoaders;
