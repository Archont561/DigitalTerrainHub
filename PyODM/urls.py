from django.urls import path, include
from . import views

task_patterns = [
    path("statuses/", views.get_task_statuses, name="statuses"),
    path("options/", views.get_task_options, name="options"),
    path("new/", views.NewTaskCreationView.as_view(), name="new-task"),
    path("create/", views.CreateTaskView.as_view(), name="create"),
    path("<uuid:uuid>/info/", views.TaskInfoView.as_view(), name="info"),
    path("<uuid:uuid>/cancel/", views.TaskCancelView.as_view(), name="cancel"),
    path("<uuid:uuid>/restart/", views.TaskRestartView.as_view(), name="restart"),
    path("<uuid:uuid>/delete/", views.TaskDeleteView.as_view(), name="delete"),
    path("<uuid:uuid>/output/", views.TaskOutputView.as_view(), name="output"),
    path("<uuid:uuid>/status/", views.TaskStatusView.as_view(), name="status"),
]

workspace_patterns = [
    path("create/", views.WorkspaceCreateView.as_view(), name="create"),
    path("list/", views.WorkspaceListView.as_view(), name="list"),
    path("<uuid:uuid>", views.WorkspaceDetailView.as_view(), name="detail"),
    path("<uuid:uuid>/delete/", views.WorkspaceDeleteView.as_view(), name="delete"),
    path("<uuid:uuid>/upload/", views.WorkspaceUploadImagesView.as_view(), name="upload-images"),
    path("<uuid:uuid>/share/", views.WorkspaceShareView.as_view(), name="share-output"),
]

urlpatterns = [
    path("task/", include((task_patterns, "task"))),
    path("workspace/", include((workspace_patterns, "workspace"))),
]
