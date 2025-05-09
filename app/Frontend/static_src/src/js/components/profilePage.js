export default {
    open: null,
    tabs: [],
    currentTab: null,
    isCurrent(tab) {
        return this.currentTab === tab
    },
    register(name) {
        this.tabs.push(name)
    }
}