import json, mimetypes

from django.apps import apps
from django.conf import settings
from django.db import IntegrityError
from django.shortcuts import render, redirect, reverse
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import (
    View, 
    DetailView, 
    CreateView,
    DeleteView,
    UpdateView,
)
from django.http import (
    HttpResponse, 
    JsonResponse, 
    HttpResponseBadRequest, 
    HttpResponseNotFound, 
    FileResponse, 
    Http404, 
    HttpResponseForbidden
)
from django_tus.views import TusUpload
from django_tus.signals import tus_upload_finished_signal

from pyodm import Node, exceptions as odm_exceptions

from PyODM.models import Workspace, NodeODMTask, OptionsPreset
from PyODM.forms import WorkspaceForm

from Core.mixins import MessagesMixin
from Core.models import Notification

app_config = apps.get_app_config("PyODM")

class WorkspaceCreateView(LoginRequiredMixin, View, MessagesMixin):
    template_name = app_config.templates.cotton.workspace.card
    context_object_name = "workspace"
    http_method_names = ["post"]
    
    def post(self, request, *args, **kwargs):
        workspace = Workspace.objects.create(user=request.user)
        Notification.add(request, "Workspace Created", related_object=workspace)
        return self.render_with_oob_messages(
            request, self.template_name, { self.context_object_name: workspace })


class WorkspaceActionMixin(View):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(reverse("credentials:login"))
            
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
    template_name = app_config.templates.cotton.workspace.card
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
            partial = f"{app_config.templates.cotton.workspace.miscellaneous.edit}#workspace-thumbnails"
            return render(request, partial, context)

        if are_images: return HttpResponseForbidden("Not implemented")

        return render(request, self.template_name, context)


class WorkspaceUpdateView(WorkspaceActionMixin):
    http_method_names = ["post", "patch"]
    template_name = app_config.templates.cotton.workspace.card

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
    template_name = app_config.templates.cotton.task.partial

    def _parse_request_data(self, request):
        try:
            return json.loads(request.body), None
        except json.JSONDecodeError:
            return None, ["Invalid JSON"]

    def _validate_options(self, data):
        task_name = data.get("name", None)
        options_preset = data.get("options-preset", None)

        if options_preset == "custom":
            options = data.get("options", None)
            if not options:
                return None, ["No options given!"]
        elif not options_preset:
            return None, ["No preset specified and no options sent!"]
        else:
            try:
                preset = OptionsPreset.objects.get(name=options_preset)
            except OptionsPreset.DoesNotExist:
                return None, ["No such preset!"]
        
        return {"name": task_name, "options": preset.options}, []

    def _create_task(self, task_data, workspace):
        node = Node.from_url(settings.NODEODM_URL)
        while True:
            try:
                odm_task = node.create_task(
                    files=[str(file_path) for file_path in workspace.get_images_paths()],
                    name=task_data["name"],
                    options=task_data["options"],
                )
                task_info = odm_task.info()
            except odm_exceptions.OdmError as e:
                return None, [str(e)]
            else:
                odm_task.cancel()
                try:
                    task = NodeODMTask.objects.create(
                        uuid=task_info.uuid,
                        name=task_data["name"],
                        workspace=workspace,
                    )
                except IntegrityError:
                    odm_task.remove()
                    return None, ["Task creation failed due to integrity error"]
                else:
                    odm_task.restart()
                    task.save()
                    return task, None

    def post(self, request, *args, **kwargs):
        steps = [
            (self._parse_request_data, [request]),
            (self._validate_options, [None]),
            (self._create_task, [None, self.get_object()]),
        ]

        result = None
        for i, (func, args) in enumerate(steps):
            if i != 0: args[0] = result

            result, errors = func(*args)
            if errors:
                return HttpResponseBadRequest(errors[0])

        return render(request, self.template_name, { "task": result })


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