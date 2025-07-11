from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from django.conf import settings
from django_tus.views import TusUpload
from django_tus.signals import tus_upload_finished_signal

from pyodm import Node, exceptions as odm_exceptions
from pathlib import Path
import mimetypes

from PyODM.models import Workspace
from PyODM.serializers import WorkspaceSerializer
from Core.utils.drf import AstroHTMLRenderer


class WorkspaceTusUploadView(TusUpload):
    def send_signal(self, tus_file):
        tus_upload_finished_signal.send(
            sender=self.workspace.__class__,
            upload_file_path=settings.TUS_DESTINATION_DIR / tus_file.filename,
            workspace=self.workspace)

class WorkspaceViewSet(viewsets.ModelViewSet):
    renderer_classes = [JSONRenderer, AstroHTMLRenderer, BrowsableAPIRenderer]
    serializer_class = WorkspaceSerializer
    parser_classes = [JSONParser, MultiPartParser]
    permission_classes = [IsAuthenticated]
    lookup_field = "uuid"
    lookup_url_kwarg = "uuid"

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)

    def get_object(self):
        return get_object_or_404(self.get_queryset(), uuid=self.kwargs.get(self.lookup_field))

    def list(self, request, *args, **kwargs):
        self.template_name = "component/workspace/list"
        self.prop_name = "workspaces"
        return super().list(self, request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        self.template_name = "component/workspace/partial"
        self.prop_name = "workspace"
        return super().retrieve(self, request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        self.template_name = "component/workspace/partial"
        self.prop_name = "workspace"
        return super().create(self, request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        self.template_name = "component/workspace/partial"
        self.prop_name = "workspace"
        return super().update(self, request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def _tus_upload(self, request, resource_id=None):
        workspace_tus_upload_view = WorkspaceTusUploadView()
        workspace_tus_upload_view.request = request
        workspace_tus_upload_view.workspace = self.get_object()
        return workspace_tus_upload_view.dispatch(resource_id=resource_id)

    @action(detail=True, methods=["post", "options"], url_path="upload")
    def tus_upload(self, request, uuid=None):
        return self._tus_upload(request)

    @action(detail=True, methods=["patch", "head", "options"], url_path="upload/(?P<resource_id>[^/.]+)")
    def tus_upload_with_resource(self, request, uuid=None, resource_id=None):
        return self._tus_upload(request, resource_id)

    @action(detail=True, methods=["get"], url_path="images")
    def workspace_images(self, request, uuid=None):
        workspace = self.get_object()
        image_paths = workspace.get_images_paths(thumbnails=False)
        image_names = [p.name for p in image_paths]
        return Response({
            "workspace_uuid": workspace.uuid,
            "images": image_names,
        })

    @action(detail=False, methods=["get"], url_path="images")
    def all_workspaces_images(self, request):
        all_data = []
        for workspace in self.get_queryset():
            image_paths = workspace.get_images_paths(thumbnails=False)
            image_names = [p.name for p in image_paths]
            all_data.append({
                "workspace_uuid": workspace.uuid,
                "images": image_names,
            })
        return Response(all_data)

    @method_decorator(cache_control(public=True, max_age=3600))
    @action(detail=True, methods=["get"], url_path="images/(?P<filename>[^/.]+(?:\.[^/.]+)?)")
    def serve_image(self, request, uuid=None, filename=None):
        is_thumbnail = 'thumbnail' in request.path
        workspace = self.get_object()
        base_dir = workspace.get_dir()
        subdir = settings.THUMBNAIL_DIR_NAME if is_thumbnail else settings.IMAGES_DIR_NAME
        file_path = base_dir / subdir / filename

        if not file_path.exists() or not file_path.is_file():
            return Response({ "error": "File not found" }, status=status.HTTP_404_NOT_FOUND)

        mime_type, _ = mimetypes.guess_type(str(file_path))
        response = FileResponse(file_path.open("rb"), content_type=mime_type)
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response
