from django.conf import settings
from django.apps import apps
from django.views.generic import TemplateView

app_config = apps.get_app_config("Core")

class HomeView(TemplateView):
    template_name = app_config.templates.home
    extra_context = {
        "home": True, 
        "app_name": settings.APP_NAME,
    }


class ProductsView(TemplateView):
    template_name = app_config.templates.products_viewer
    extra_context = {
        "app_name": settings.APP_NAME,
    }


class Custom404View(TemplateView):
    template_name = app_config.templates.HTTP_404
    extra_context = {
        "app_name": settings.APP_NAME,
    }

    def render_to_response(self, context, **kwargs):
        response = super().render_to_response(context, **kwargs)
        response.status_code = 404
        return response

