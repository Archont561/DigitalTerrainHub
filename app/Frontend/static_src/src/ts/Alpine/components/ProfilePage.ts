export default () => ({
    open: null,
    tabs: [] as string[],
    currentTab: null,
    isCurrent(tab: string) {
        return this.currentTab === tab
    },
    register(name: string) {
        this.tabs.push(name)
    }
})