import json
from django.shortcuts import get_object_or_404
from django.views.generic import View, DetailView, CreateView, DeleteView, ListView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.template.loader import render_to_string
from django.shortcuts import render, redirect
from django.conf import settings
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.urls import reverse_lazy
from django.db import IntegrityError
from pyodm import Node, Task
from pyodm.types import TaskStatus
from .models import Workspace, NodeODMTask


def get_task_statuses(request: HttpRequest):
   return JsonResponse({status.name: status.value for status in TaskStatus})


class NewTaskCreationView(LoginRequiredMixin, TemplateView):
    template_name = ""


class CreateTaskView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        try:
            # Parse JSON request body
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
            raise Http404("Not allowed.")
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


class WorkspaceCreateView(LoginRequiredMixin, CreateView):
    model = Workspace
    template_name = 'pages/workspaces/create.html'
    fields = ['name']

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

    success_url = reverse_lazy('workspace:list')


class WorkspaceListView(LoginRequiredMixin, ListView):
    model = Workspace
    template_name = 'partials/components/cards/workspace.html'

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)

    def render_to_response(self, context, **response_kwargs):
        workspaces = self.get_queryset()
        rendered = [
            render_to_string(self.template_name, {'workspace': workspace}, request=self.request)
            for workspace in workspaces
        ]
        return HttpResponse("".join(rendered))


class WorkspaceActionMixin(LoginRequiredMixin, View):
    def dispatch(self, request, *args, **kwargs):
        self.workspace = get_object_or_404(Workspace, uuid=kwargs.get("uuid"))
        if self.workspace.user != request.user:
            raise PermissionDenied
        
        return super().dispatch(request, *args, **kwargs)
    
    def get_object(self):
        return self.workspace


class WorkspaceDetailView(WorkspaceActionMixin, DetailView):
    model = Workspace
    template_name = 'pages/workspace/index.html'
    context_object_name = 'workspace'


class WorkspaceDeleteView(WorkspaceActionMixin, DeleteView):
    model = Workspace
    template_name = 'workspace/confirm_delete_workspace.html'


class WorkspaceUploadImagesView(WorkspaceActionMixin):
    def post(self, request, *args, **kwargs):        
        files = request.FILES.getlist('images')
        workspace = self.get_object()
        for file in files:
            workspace.save_image(file)

        return JsonResponse({"message": "Images uploaded successfully."}, status=200)


class WorkspaceShareView(WorkspaceActionMixin):
    def post(self, request, *args, **kwargs):
        workspace = self.get_object()

        shared_with_user = request.POST.get('shared_with')
        user_to_share_with = User.objects.filter(username=shared_with_user).first()

        if not user_to_share_with:
            return JsonResponse({"error": "User to share with not found."}, status=400)
        
        workspace.user = user_to_share_with
        workspace.save()
        return JsonResponse({"message": f"Workspace shared with {shared_with_user}."}, status=200)