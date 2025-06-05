from django.views.generic import View
from django.conf import settings
from .utils.http import AstroTemplateResponse

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
