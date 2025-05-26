import json, re, mimetypes
from django.shortcuts import get_object_or_404
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.conf import settings
from django.http import (
    HttpResponse, 
    JsonResponse, 
    HttpResponseForbidden
)
from pyodm import Node, exceptions
from pyodm.types import TaskStatus
from PyODM.models import NodeODMTask
from PyODM.enums import NodeODMOptions

class TaskActionMixin(LoginRequiredMixin, View):
    def dispatch(self, request, *args, **kwargs):
        self.task: NodeODMTask = get_object_or_404(NodeODMTask, uuid=kwargs["uuid"])
        if self.task.workspace.user != request.user:
            return HttpResponseForbidden()
        self.node = Node.from_url(settings.NODEODM_URL)
        return super().dispatch(request, *args, **kwargs)
    
    def get_odm_task(self):
        return self.node.get_task(str(self.task.uuid))


class TaskInfoView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        odm_task = self.get_odm_task()
        task_info = odm_task.info()
        return JsonResponse({
            "uuid": str(task_info.uuid),
            "status": task_info.status.name,
            "name": self.task.name,
            "created_at": self.task.created_at.isoformat(),
        })


class TaskCancelView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        odm_task = self.get_odm_task()
        odm_task.cancel()
        return JsonResponse({"message": "Task canceled"}, status=201)


class TaskDeleteView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        odm_task = self.get_odm_task()
        odm_task.cancel()
        odm_task.remove()
        self.task.delete()
        return JsonResponse({"message": "Task deleted"}, status=201)


class TaskRestartView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        odm_task = self.get_odm_task()
        odm_task.restart()
        return JsonResponse({"message": "Task restarted"}, status=201)


class TaskOutputView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        odm_task = self.get_odm_task()
        return JsonResponse(odm_task.output)


class TaskStatusView(TaskActionMixin):
    def post(self, request, *args, **kwargs):
        return JsonResponse({"status": self.task.status.name})

