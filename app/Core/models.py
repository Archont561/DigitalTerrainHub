from django.db import models
from django.contrib.auth import get_user_model
from django.contrib import messages

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
    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES,
        default=messages.INFO,
    )

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.status}: {self.message[:50]}"

    @classmethod
    def add(cls, request, message, status=messages.INFO, extra_tags=''):
        messages.add_message(request, status, message, extra_tags=extra_tags)
        cls.objects.create(
            user=request.user,
            message=message,
            status=status,
        )