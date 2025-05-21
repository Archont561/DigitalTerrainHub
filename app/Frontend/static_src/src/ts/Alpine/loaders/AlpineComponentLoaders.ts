import { alpine } from "../../@types";

const AlpineComponentLoaders: Record<string, alpine.ComponentLoader> = {
    OptionsForm: async () => (await import('../components/OptionsForm')).default,
    ProfilePage: async () => (await import('../components/ProfilePage')).default,
    UppyWidget: async () => (await import('../components/UppyWidget')).default,
    GCPMap: async () => (await import('../components/GCPMap')).default,
    ImageMap: async () => (await import('../components/ImageMap')).default,
};

export default AlpineComponentLoaders;  