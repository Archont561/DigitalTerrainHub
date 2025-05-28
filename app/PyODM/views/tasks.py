import json

from django.contrib.auth.mixins import LoginRequiredMixin
from django.apps import apps
from django.http import HttpResponseForbidden, HttpResponse
from django.shortcuts import get_object_or_404, render, redirect, reverse
from django.views.generic import View, DetailView, DeleteView

from PyODM.models import NodeODMTask
from pyodm import exceptions

app_config = apps.get_app_config("PyODM")

class TaskActionMixin(View):
    http_method_names = ["post"]

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(reverse("credentials:login"))

        task_uuid = kwargs.get("uuid", None)
        if not task_uuid: 
            return HttpResponseForbidden("The task ID (UUID) is missing in the request URL.")
        
        self.task = get_object_or_404(NodeODMTask, uuid=task_uuid)
        if self.task.workspace.user != request.user:
            return HttpResponseForbidden("You do not have permission to access this task.")
        
        return super().dispatch(request, *args, **kwargs)


class TaskDetailView(TaskActionMixin, DetailView):
    http_method_names = ["get"]
    template_name = app_config.templates.cotton.task.partial
    context_object_name = "task"

    def get_object(self):
        return self.task


class TaskCancelView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        try:
            self.task.cancel()
            return HttpResponse()
        except exceptions.OdmError as e:
            return HttpResponse(str(e), status=500)


class TaskDeleteView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        try:
            self.task.delete()
            return HttpResponse()
        except exceptions.OdmError as e:
            return HttpResponse(str(e), status=500)


class TaskRestartView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        try:
            self.task.restart()
            return HttpResponse()
        except exceptions.OdmError as e:
            return HttpResponse(str(e), status=500)


class TaskOutputView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        try:
            output = self.task.output()
            return HttpResponse(json.dumps(output))
        except exceptions.OdmError as e:
            return HttpResponse(str(e), status=500)

