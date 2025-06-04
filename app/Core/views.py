from django.views.generic import View
from django.conf import settings
from django.http import HttpResponseBadRequest, HttpResponseNotFound, HttpResponse

from .utils.http import AstroTemplateResponse
from .models import Notification


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


class NotificationReadView(View):
    http_method_names = ["patch"]
    
    def patch(self, request, *args, **kwargs):
        pk = kwargs.get("pk", None)
        if not pk:
            return HttpResponseBadRequest("Notification ID is required")

        try:
            notification = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            return HttpResponseNotFound("Notification not found")

        if notification.user != request.user:
            return HttpResponseForbidden("You are not authorized to mark this notification as read")

        notification.read = True
        notification.save()

        return HttpResponse()

    