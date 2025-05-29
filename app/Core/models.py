from django.db import models
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import uuid

User = get_user_model()

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

    @classmethod
    def add(cls, request, message, status=messages.INFO, extra_tags='', related_object=None):
        content_type = None
        related_object_id = None
        related_object_uuid = None

        if related_object:
            content_type = ContentType.objects.get_for_model(related_object)
            if isinstance(related_object.pk, uuid.UUID):
                related_object_uuid = related_object.pk
            else:
                related_object_id = related_object.pk

        notification = cls.objects.create(
            user=request.user,
            message=message,
            status=status,
            content_type=content_type,
            related_object_id=related_object_id,
            related_object_uuid=related_object_uuid,
        )
        extra_tags = f"{extra_tags} notification_pk:{notification.pk}".strip()
        messages.add_message(request, status, message, extra_tags=extra_tags)
        return notification

    @classmethod
    def filter_by_object(cls, related_object=None, related_object_uuid=None, user=None):
        queryset = cls.objects.all()

        if user:
            queryset = queryset.filter(user=user)

        if related_object:
            content_type = ContentType.objects.get_for_model(related_object)
            if isinstance(related_object.pk, uuid.UUID):
                queryset = queryset.filter(instance_uuid=related_object.pk)
            else:
                queryset = queryset.filter(
                    content_type=content_type,
                    object_id=related_object.pk
                )
        elif related_object_uuid:
            queryset = queryset.filter(related_object_uuid=related_object_uuid)

        return queryset