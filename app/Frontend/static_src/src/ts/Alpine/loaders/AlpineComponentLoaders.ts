type AlpineComponentLoader = () => Promise<(...args: any[]) => any>;

const AlpineComponentLoaders: Record<string, AlpineComponentLoader> = {
    OptionsForm: async () => (await import('../components/OptionsForm')).default,
    ProfilePage: async () => (await import('../components/ProfilePage')).default,
    UppyWidget: async () => (await import('../components/UppyWidget')).default,
    GCPMap: async () => (await import('../components/GCPMap')).default,
};

export default AlpineComponentLoaders;  