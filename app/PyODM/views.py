import json, re, mimetypes
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from django.views.generic import View, DetailView, CreateView, DeleteView, ListView, TemplateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.template.loader import render_to_string
from django.shortcuts import render, redirect
from django.conf import settings
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, FileResponse, Http404, HttpResponseForbidden
from django.urls import reverse_lazy
from django.db import IntegrityError
from django_tus.views import TusUpload
from django_tus.signals import tus_upload_finished_signal
from pyodm import Node, exceptions
from pyodm.types import TaskStatus
from .models import Workspace, NodeODMTask, OptionsPreset
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
    template_name = settings.TEMPLATES_NAMESPACES.cotton.components.workspace.card
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
            workspace=self.get_object())


class WorkspaceDetailView(WorkspaceActionMixin, DetailView):
    template_name = settings.TEMPLATES_NAMESPACES.cotton.components.workspace.card
    context_object_name = "workspace"
    http_method_names = ["get"]
    
    def get(self, request, *args, **kwargs):        
        workspace = self.get_object()
        context = { "workspace": workspace }

        is_count = "count" in request.GET
        if is_count:
            match request.GET.get("count", None):
                case "images":
                    return HttpResponse(workspace.image_count)
                case _:
                    return HttpResponseBadRequest("Wrong query!")

        are_thumbnails = "thumbnails" in request.GET
        are_images = "images" in request.GET

        if are_thumbnails and are_images:
            return HttpResponseBadRequest("Please specify either 'thumbnails' or 'images', not both.")
        
        if are_thumbnails:
            file_names = [file_path.name for file_path in workspace.get_images_paths(thumbnails=are_thumbnails)]
            context.update({ "thumbnails": file_names })
            partial = f"{settings.TEMPLATES_NAMESPACES.cotton.components.workspace.miscellaneous.edit}#workspace-thumbnails"
            return render(request, partial, context)

        if are_images: return HttpResponseForbidden("Not implemented")

        return render(request, self.template_name, context)



class WorkspaceUpdateView(WorkspaceActionMixin):
    http_method_names = ["post", "patch"]
    template_name = settings.TEMPLATES_NAMESPACES.cotton.components.workspace.card

    def patch(self, request, *args, **kwargs):
        workspace = self.get_object()
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON.")

        form = WorkspaceForm(data, instance=workspace)
        if not form.is_valid():
            return HttpResponseBadRequest("Invalid form data.")
        form.save()
        return render(request, f"{self.template_name}#workspace-image-count", {
            "workspace": self.get_object(),
        })


class WorkspaceDeleteView(WorkspaceActionMixin):
    http_method_names = ["post"]

    def post(self, request, *args, **kwargs):
        self.get_object().delete()
        return HttpResponse(status=200)


class WorkspaceCreateTaskView(WorkspaceActionMixin, View):
    http_method_names = ["post"]
    
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
            
        task_name = data.get("name", None)
        options_preset = data.get("options-preset", None)
        if options_preset == "custom":
            options = data.get("options", None)
            if not options:
                JsonResponse({"error": "No options given!"}, status=400)
        elif not options_preset:
            return JsonResponse({"error": "No preset specfied and no options send!"}, status=400)
        else:
            try: 
                options = OptionsPreset.objects.get(name=options_preset)
            except OptionsPreset.DoesNotExist: 
                return JsonResponse({"error": "No such preset!"}, status=400)

        node = Node.from_url(settings.NODEODM_URL)

        # Attempt to create the task
        while True:
            try:
                task = node.create_task(
                    files=self.get_object().get_images_paths(),
                    name=task_name,
                    options=options,
                )
            except exceptions.NodeResponseError as e:
                return HttpResponseBadRequest(e)
            task_info = task.info()
            task.cancel()
            try:
                odm_task = NodeODMTask.objects.create(
                    uuid=task_info.uuid,
                    status=task_info.status.value,
                    name=task_name,
                    workspace=self.get_object(),
                )
            except IntegrityError:
                task.remove()  # Task already exists, clean up
            else:
                # Task creation succeeded, restart task and save to DB
                task.restart()
                odm_task.save()
                break

        return JsonResponse({ "uuid": task_info.uuid }, status=200)


@method_decorator(cache_control(public=True, max_age=3600), name="get")
class WorkspaceServeImagesView(WorkspaceActionMixin):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        is_thumbnail = "thumbnails" in request.path
        filename = kwargs.get("filename", "")
        base_dir = self.get_object().get_dir()
        if is_thumbnail: target_dir = base_dir / settings.THUMBNAIL_DIR_NAME
        else: target_dir = base_dir / settings.IMAGES_DIR_NAME
        file_path = target_dir / filename

        if not file_path.exists() or not file_path.is_file():
            raise Http404("Image not found")
        
        mime_type, _ = mimetypes.guess_type(str(file_path))
        
        return FileResponse(file_path.open("rb"), content_type=mime_type)