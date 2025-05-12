export default () => ({
    workspaces: [],
    currentWorkspace: null,
    init() {
        this.workspaces = JSON.parse(this.$refs.createdWorkspacesJSON.textContent);
    },
    addWorkspace(event) {
        const workspace = JSON.parse(event.detail.workspace)[0];
        this.workspaces.unshift(workspace);
    },
    removeWorkspace(event) {
        const workspace_uuid = event.detail.workspace_uuid;
        if (workspace_uuid === this.currentWorkspace?.pk) this.currentWorkspace = null;
        this.workspaces = this.workspaces.filter(ws => ws.pk !== workspace_uuid);
    },
    openImagesEditDialog(workspace) {
        this.currentWorkspace = workspace;
        this.$refs.imagesEditDialog.showModal();
    },
    openUploadImagesDialog(workspace) {
        this.currentWorkspace = workspace;
        this.$refs.uploadImagesDialog.showModal();
    },
    openTaskDialog(workspace) {
        this.currentWorkspace = workspace;
        this.$refs.taskDialog.showModal();
    },
})