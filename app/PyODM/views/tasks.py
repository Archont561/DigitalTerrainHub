import json

from django.contrib.auth.mixins import LoginRequiredMixin
from django.apps import apps
from django.http import HttpResponseForbidden, HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404, render, redirect, reverse
from django.views.generic import View, DetailView, DeleteView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from PyODM.signals import odm_task_download
from PyODM.models import NodeODMTask
from pyodm import exceptions
from pyodm.types import TaskStatus

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

class TaskStatusView(TaskActionMixin):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        return HttpResponse(self.task.get_status_display())

@method_decorator(csrf_exempt, name='dispatch')
class TaskProcessingEndWebhookView(View):

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
        except Exception:
            return HttpResponseBadRequest()
            
        task_uuid = data["uuid"]
        task_status_code = data["status"]["code"]
        task = NodeODMTask.objects.get(uuid=task_uuid)
        task.status = task_status_code
        task.save()

        if task_status_code == TaskStatus.COMPLETED.value:
            odm_task_download.send(sender=task.__class__, instance=task)

        return HttpResponse(status=200)