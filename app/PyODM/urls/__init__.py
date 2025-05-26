from django.urls import path, include
from .tasks import url_patterns as task_patterns
from .workspaces import url_patterns as workspace_patterns

urlpatterns = [
    path("task/", include((task_patterns, "task"))),
    path("workspace/", include((workspace_patterns, "workspace"))),
]