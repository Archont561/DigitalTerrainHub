from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from Core.models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
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
