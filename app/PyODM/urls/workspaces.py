from django.urls import path
from PyODM.views.workspaces import (
    WorkspaceCreateView,
    WorkspaceCreateTaskView,
    WorkspaceDeleteView,
    WorkspaceDetailView,
    WorkspaceUpdateView,
    WorkspaceUploadImagesView,
    WorkspaceServeImagesView,
    WorkspaceCreateTaskView,
)

url_patterns = [
    path("create/", WorkspaceCreateView.as_view(), name="create"),
    path('upload/', WorkspaceUploadImagesView.as_view(), name='upload'),
    path('upload/<uuid:resource_id>', WorkspaceUploadImagesView.as_view(), name='upload_chunks'),
    path("<uuid:ws_uuid>/", WorkspaceDetailView.as_view(), name="detail"),
    path("<uuid:ws_uuid>/update/", WorkspaceUpdateView.as_view(), name="update"),
    path("<uuid:ws_uuid>/delete/", WorkspaceDeleteView.as_view(), name="delete"),
    path("<uuid:ws_uuid>/create-task/", WorkspaceCreateTaskView.as_view(), name="create-task"),
    path("<uuid:ws_uuid>/images/<str:filename>/", WorkspaceServeImagesView.as_view(), name="serve-image"),
    path("<uuid:ws_uuid>/thumbnails/<str:filename>/", WorkspaceServeImagesView.as_view(), name="serve-thumbnail"), 
]