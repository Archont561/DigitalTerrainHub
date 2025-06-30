import NotificationTable, { actions as NotificationTableActions } from "./NotificationTable";
import LoginForm, { actions as LoginFormActions } from "./LoginForm";
import RegisterForm, { actions as RegisterFormActions } from "./RegisterForm";
import PresetTable, { actions as PresetTableActions } from "./PresetTable";
import WorkspaceTable, { actions as WorkspaceTableActions } from "./WorkspaceTable";
import TaskTable, { actions as TaskTableActions } from "./TaskTable";

export {
    LoginForm,
    RegisterForm,
    NotificationTable,
    PresetTable,
    TaskTable,
    WorkspaceTable,
}

export const IslandComponentsActions = {
    ...LoginFormActions,
    ...RegisterFormActions,
    ...NotificationTableActions,
    ...PresetTableActions,
    ...WorkspaceTableActions,
    ...TaskTableActions,
}