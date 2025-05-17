type AlpineComponentLoader = () => Promise<(...args: any[]) => any>;

const AlpineComponentLoaders: Record<string, AlpineComponentLoader> = {
    optionsForm: async () => (await import('../components/optionsForm')).default,
    profilePage: async () => (await import('../components/profilePage')).default,
    uppyWidget: async () => (await import('../components/uppyWidget')).default,
};

export default AlpineComponentLoaders;  