import { alpine } from "../../@types";

const AlpineComponentLoaders: Record<string, alpine.ComponentLoader> = {
    OptionsForm: async () => (await import('../components/OptionsForm')).default,
    ProfilePage: async () => (await import('../components/ProfilePage')).default,
    UppyWidget: async () => (await import('../components/UppyWidget')).default,
    GCPEditor: async () => (await import('../components/GCPEditor')).default,
};

export default AlpineComponentLoaders;  