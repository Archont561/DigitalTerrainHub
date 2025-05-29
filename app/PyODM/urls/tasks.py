from django.urls import path
from PyODM.views.tasks import (
    TaskDetailView,
    TaskCancelView,
    TaskRestartView,
    TaskOutputView,
    TaskDeleteView,
    TaskStatusView,
)

url_patterns = [
    path("<uuid:uuid>/detail/", TaskDetailView.as_view(), name="detail"),
    path("<uuid:uuid>/cancel/", TaskCancelView.as_view(), name="cancel"),
    path("<uuid:uuid>/restart/", TaskRestartView.as_view(), name="restart"),
    path("<uuid:uuid>/delete/", TaskDeleteView.as_view(), name="delete"),
    path("<uuid:uuid>/output/", TaskOutputView.as_view(), name="output"),
    path("<uuid:uuid>/status/", TaskStatusView.as_view(), name="status"),
]