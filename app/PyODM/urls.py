from django.urls import path, include
from . import views

task_patterns = [
    path("statuses/", views.get_task_statuses, name="statuses"),
    path("options/", views.get_task_options, name="options"),
    path("<uuid:uuid>/info/", views.TaskInfoView.as_view(), name="info"),
    path("<uuid:uuid>/cancel/", views.TaskCancelView.as_view(), name="cancel"),
    path("<uuid:uuid>/restart/", views.TaskRestartView.as_view(), name="restart"),
    path("<uuid:uuid>/delete/", views.TaskDeleteView.as_view(), name="delete"),
    path("<uuid:uuid>/output/", views.TaskOutputView.as_view(), name="output"),
    path("<uuid:uuid>/status/", views.TaskStatusView.as_view(), name="status"),
]

workspace_patterns = [
    path("create/", views.WorkspaceCreateView.as_view(), name="create"),
    path('upload/', views.WorkspaceUploadImagesView.as_view(), name='upload'),
    path('upload/<uuid:resource_id>', views.WorkspaceUploadImagesView.as_view(), name='upload_chunks'),
    path("<uuid:ws_uuid>", views.WorkspaceDetailView.as_view(), name="detail"),
    path("<uuid:ws_uuid>/update/", views.WorkspaceUpdateView.as_view(), name="update"),
    path("<uuid:ws_uuid>/delete/", views.WorkspaceDeleteView.as_view(), name="delete"),
    path("<uuid:ws_uuid>/create-task/", views.WorkspaceCreateTaskView.as_view(), name="create-task"),
    path("<uuid:ws_uuid>/images/<str:filename>/", views.WorkspaceServeImages.as_view(), name="serve-image"),
    path("<uuid:ws_uuid>/thumbnails/<str:filename>/", views.WorkspaceServeImages.as_view(), name="serve-thumbnail"),
]

urlpatterns = [
    path("task/", include((task_patterns, "task"))),
    path("workspace/", include((workspace_patterns, "workspace"))),
]
