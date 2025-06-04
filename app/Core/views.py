from django.views.generic import View
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.http import HttpResponseBadRequest, HttpResponseNotFound, HttpResponse

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .utils.http import AstroTemplateResponse
from .models import Notification
from .serializers import NotificationSerializer

class HomeView(View):
    def get(self, request, *args, **kwargs):
        return AstroTemplateResponse(request, "page/home", {
            "app_name": settings.APP_NAME
        })

class Custom404View(View):
    def get(self, request, *args, **kwargs):
        return AstroTemplateResponse(request, "page/404", {
            "app_name": settings.APP_NAME
        })


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["patch"], url_path="read")
    def mark_as_read(self, request, pk=None):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        if notification.read:
            return Response({'detail': 'Already read'}, status=status.HTTP_200_OK)

        notification.read = True
        notification.save()
        return Response({'detail': 'Marked as read'}, status=status.HTTP_200_OK)
