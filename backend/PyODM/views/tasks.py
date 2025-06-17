from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404
from django.conf import settings
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from pyodm import exceptions as odm_exceptions
from pyodm.types import TaskStatus

from PyODM.models import NodeODMTask, OptionsPreset, Workspace
from PyODM.serializers import NodeODMTaskSerializer
from PyODM.signals import odm_task_completed


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = NodeODMTaskSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "uuid"
    lookup_url_kwarg = "uuid"

    def get_task_workspace(self):
        return get_object_or_404(Workspace, uuid=self.kwargs.get("workspace_uuid"), user=self.request.user)

    def get_queryset(self):
        return NodeODMTask.objects.filter(workspace=self.get_task_workspace())

    def get_object(self):
        return get_object_or_404(self.get_queryset(), uuid=self.kwargs.get(self.lookup_field))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={
                'workspace': self.get_task_workspace(),
                'webhook': request.build_absolute_uri(reverse("task-webhook")),
            }
        )
        serializer.is_valid(raise_exception=True)

        try:
            task = serializer.save()
        except odm_exceptions.OdmError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        output_serializer = self.get_serializer(task)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        task = self.get_object()
        try:
            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except odm_exceptions.OdmError as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        task = self.get_object()
        try:
            task.cancel()
            return Response(status=status.HTTP_200_OK)
        except odm_exceptions.OdmError as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def restart(self, request, pk=None):
        task = self.get_object()
        try:
            task.restart()
            return Response(status=status.HTTP_200_OK)
        except odm_exceptions.OdmError as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        task = self.get_object()
        return Response({"status": task.get_status_display()})

    @action(detail=True, methods=['get'])
    def output(self, request, pk=None):
        task = self.get_object()
        try:
            output = task.output()
            return Response(output)
        except odm_exceptions.OdmError as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class TaskProcessingEndWebhookView(APIView):

    def post(self, request, *args, **kwargs):
        task_uuid = request.data.get("uuid")
        if not task_uuid:
            return HttpResponseBadRequest("Missing 'uuid'")

        try:
            task_status_code = data["status"]["code"]
        except (KeyError, TypeError):
            return HttpResponseBadRequest("Missing or invalid 'status.code'")

        try:
            task = NodeODMTask.objects.get(uuid=task_uuid)
        except NodeODMTask.DoesNotExist:
            return HttpResponse(status=status.HTTP_404_NOT_FOUND)

        task.status = task_status_code
        task.save()

        if task_status_code == TaskStatus.COMPLETED.value:
            odm_task_completed.send(sender=task.__class__, instance=task)

        return HttpResponse(status=status.HTTP_200_OK)
