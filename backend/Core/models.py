from django.contrib.gis.db import models
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.http import HttpRequest
from django_eventstream import send_event
from .utils.http import AstroTemplateResponse
import uuid

User = get_user_model()


class NotificationManager(models.Manager):
    def add(self, user, message, status=messages.INFO, related_object=None):
        content_type = None
        related_object_id = None
        related_object_uuid = None

        if related_object:
            content_type = ContentType.objects.get_for_model(related_object)
            if isinstance(related_object.pk, uuid.UUID):
                related_object_uuid = related_object.pk
            else:
                related_object_id = related_object.pk

        notification = self.create(
            user=user,
            message=message,
            status=status,
            content_type=content_type,
            related_object_id=related_object_id,
            related_object_uuid=related_object_uuid,
        )
        
        
        from .api.serializers import NotificationSerializer
        send_event(
            channel="notifications",
            data=AstroTemplateResponse(
                request=HttpRequest(), 
                template="/components/notifications/ssepartial",
                context={
                    "notification": NotificationSerializer(notification).data
                },
            ).render().content,
            json_encode=False
        )
        return notification

    def filter_by_object(self, related_object=None, related_object_uuid=None, user=None):
        queryset = self.get_queryset()

        if user:
            queryset = queryset.filter(user=user)

        if related_object:
            content_type = ContentType.objects.get_for_model(related_object)
            if isinstance(related_object.pk, uuid.UUID):
                queryset = queryset.filter(related_object_uuid=related_object.pk)
            else:
                queryset = queryset.filter(
                    content_type=content_type,
                    related_object_id=related_object.pk
                )
        elif related_object_uuid:
            queryset = queryset.filter(related_object_uuid=related_object_uuid)

        return queryset


class Notification(models.Model):
    STATUS_CHOICES = [
        (messages.DEBUG, 'Debug'),
        (messages.INFO, 'Info'),
        (messages.SUCCESS, 'Success'),
        (messages.WARNING, 'Warning'),
        (messages.ERROR, 'Error'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    created_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField(max_length=1000)
    read = models.BooleanField(default=False)
    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES,
        default=messages.INFO,
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('content_type', 'related_object_id')
    related_object_uuid = models.UUIDField(null=True, blank=True)

    objects = NotificationManager()

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['related_object_uuid']),
            models.Index(fields=['content_type', 'related_object_id']),
        ]

    def __str__(self):
        return f"{self.status}: {self.message[:50]}"
