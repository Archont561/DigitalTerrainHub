from django.urls import path, include
from rest_framework_nested.routers import DefaultRouter, NestedDefaultRouter
from .views.workspaces import WorkspaceViewSet
from .views.tasks import TaskViewSet, TaskProcessingEndWebhookView
from .views.presets import OptionsPresetViewSet
from .views.gcppoints import GCPPointViewSet
from .views.other import NodeODMTaskOutputViewSet, NodeODMTaskOptionViewSet


router = DefaultRouter()
router.register(r'workspaces', WorkspaceViewSet, basename='workspace')
router.register(r'presets', OptionsPresetViewSet, basename='presets')
router.register(r'task-options', NodeODMTaskOptionViewSet, basename='task-option')
router.register(r'task-all-outputs', NodeODMTaskOptionViewSet, basename='task-output')

workspaces_router = NestedDefaultRouter(router, r'workspaces', lookup='workspace')
workspaces_router.register(r'tasks', TaskViewSet, basename='workspace-tasks')
workspaces_router.register(r'gcpoints', GCPPointViewSet, basename='workspace-gcps')

urlpatterns = [
    path("", include(router.urls)),
    path("", include(workspaces_router.urls)),
    path("task-webhook/", TaskProcessingEndWebhookView.as_view(), name="task-webhook")
]

app_name = "pyodm"