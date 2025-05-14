import json, re
from django.shortcuts import get_object_or_404
from django.views.generic import View, DetailView, CreateView, DeleteView, ListView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.template.loader import render_to_string
from django.shortcuts import render, redirect
from django.conf import settings
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.urls import reverse_lazy
from django.db import IntegrityError
from django_tus.views import TusUpload
from django_tus.signals import tus_upload_finished_signal
from pyodm import Node
from pyodm.types import TaskStatus
from .models import Workspace, NodeODMTask
from .enums import NodeODMOptions
from .forms import WorkspaceForm


def get_task_statuses(request):
   return JsonResponse({status.name: status.value for status in TaskStatus})


def get_task_options(request):
    response = NodeODMOptions.to_dict()
    if response:
        return JsonResponse(response, safe=False)
    
    error_response = {
        "error": "Internal Server Error",
        "message": "Failed to fetch task options"
    }
    return JsonResponse(error_response, status=500)


class NewTaskCreationView(LoginRequiredMixin, TemplateView):
    template_name = ""


class CreateTaskView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        task_name = data.get("task-name")
        options = data.get("options", {})
        
        if not task_name:
            return JsonResponse({"error": "task-name required"}, status=400)

        user = request.user
        node = Node.from_url(settings.NODEODM_URL)

        # Attempt to create the task
        while True:
            task = node.create_task(
                files=user.workspace.get_images_paths(),
                name=task_name,
                options=options,
            )
            task_info = task.info()
            task.cancel()
            try:
                odm_task = NodeODMTask.objects.create(
                    uuid=task_info.uuid,
                    status=task_info.status.value,
                    name=task_name,
                    workspace=user.workspace,
                )
            except IntegrityError:
                task.remove()  # Task already exists, clean up
            else:
                # Task creation succeeded, restart task and save to DB
                task.restart()
                odm_task.save()
                break

        return JsonResponse({
            "uuid": str(task_info.uuid),
            "status": task_info.status.value,
        }, status=200)


class TaskActionMixin(LoginRequiredMixin, View):
    def dispatch(self, request, *args, **kwargs):
        self.task: NodeODMTask = get_object_or_404(NodeODMTask, uuid=kwargs["uuid"])
        if self.task.workspace.user != request.user:
            raise PermissionDenied
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


class WorkspaceCreateView(LoginRequiredMixin, View):
    template_name = settings.TEMPLATES_NAMESPACES.cotton.components.workspace
    context_object_name = "workspace"
    http_method_names = ["post"]
    
    def post(self, request, *args, **kwargs):
        workspace = Workspace.objects.create(user=request.user)
        return render(request, self.template_name, { self.context_object_name: workspace })


class WorkspaceActionMixin(LoginRequiredMixin, View):
    def dispatch(self, request, *args, **kwargs):
        self.workspace_uuid = kwargs.get("ws_uuid", getattr(self, "workspace_uuid", None))
        try: 
            self.workspace = Workspace.objects.get(uuid=self.workspace_uuid)
        except Workspace.DoesNotExist: 
            if request.htmx: return HttpResponseNotFound("Workspace not found")
            else: raise Http404()
        
        if self.workspace.user != self.request.user: return HttpResponseForbidden()
        return super().dispatch(request, *args, **kwargs)

    def get_object(self):
        return self.workspace


class WorkspaceUploadImagesView(WorkspaceActionMixin, TusUpload):
    workspace_uuid_header = "X-Workspace-UUID"
    
    def dispatch(self, request, *args, **kwargs):
        self.workspace_uuid = request.headers.get(self.workspace_uuid_header, None)
        if not self.workspace_uuid: return HttpResponseBadRequest(f"Missing {self.workspace_uuid_header}")
        return super().dispatch(request, *args, **kwargs)

    def send_signal(self, tus_file):
        tus_upload_finished_signal.send(
            sender=self.__class__,
            upload_file_path=settings.TUS_DESTINATION_DIR / tus_file.filename,
            destination_folder=self.get_object().get_dir())


class WorkspaceDetailView(WorkspaceActionMixin, DetailView):
    model = Workspace
    template_name = 'pages/workspace/index.html'
    context_object_name = 'workspace'
    extra_context = {}
    
    def get(self, request, *args, **kwargs):
        options = NodeODMOptions.to_dict(group=True)
        if options: 
            self.extra_context["optionsFetched"] = True
        self.extra_context["options"] = options
        return super().get(request, *args, **kwargs)


class WorkspaceUpdateView(WorkspaceActionMixin):
    def post(self, request, *args, **kwargs):
        form = WorkspaceForm(request.POST, instance=self.get_object())
        if not form.is_valid():
            return HttpResponseBadRequest()
        form.save()
        return HttpResponse(status=200)


class WorkspaceDeleteView(WorkspaceActionMixin):
    def post(self, request, *args, **kwargs):
        self.get_object().delete()
        return HttpResponse(status=200)