export default {
    optionsForm: async () => (await import('../components/optionsForm.js')).default,
    profilePage: async () => (await import('../components/profilePage.js')).default,
    uppyWidget: async () => (await import('../components/uppyWidget.js')).default,
};