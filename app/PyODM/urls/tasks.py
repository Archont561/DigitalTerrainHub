from django.urls import path
from PyODM.views.tasks import (
    TaskInfoView,
    TaskCancelView,
    TaskRestartView,
    TaskOutputView,
    TaskDeleteView,
    TaskStatusView,
)

url_patterns = [
    path("<uuid:uuid>/info/", TaskInfoView.as_view(), name="info"),
    path("<uuid:uuid>/cancel/", TaskCancelView.as_view(), name="cancel"),
    path("<uuid:uuid>/restart/", TaskRestartView.as_view(), name="restart"),
    path("<uuid:uuid>/delete/", TaskDeleteView.as_view(), name="delete"),
    path("<uuid:uuid>/output/", TaskOutputView.as_view(), name="output"),
    path("<uuid:uuid>/status/", TaskStatusView.as_view(), name="status"),
]