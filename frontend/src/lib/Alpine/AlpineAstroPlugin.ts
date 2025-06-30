//@ts-ignore
import { actions } from "astro:actions";
import AlpinePluginBuilder from "./AlpinePluginBuilder";

declare module "alpinejs" {
    interface Alpine {
        astroPlugin: typeof AlpineAstroPlugin;
    }
    interface Magics<T> {
        $actions: {};
    }
}

const AlpineAstroPlugin = AlpinePluginBuilder.create("astroPlugin")
.addMagic(plugin => ({
    name: "actions",
    callback: () => actions
})).addGlobalMagic(plugin => ({
    name: "actions",
    callback: () => actions
}));

export default AlpineAstroPlugin;