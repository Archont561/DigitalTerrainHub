from django.conf import settings
from django.views.generic import TemplateView
from .mixins import ExtraContextMixin


class HomeView(ExtraContextMixin, TemplateView):
    template_name = "pages/classic/home.html"
    context_extra = {
        "home": True, 
        "app_name": settings.APP_NAME,
    }


class AboutView(ExtraContextMixin, TemplateView):
    template_name = "pages/classic/about.html"
    context_extra = {
        "about": True, 
        "app_name": settings.APP_NAME,
    }


class ContactView(ExtraContextMixin, TemplateView):
    template_name = "pages/classic/contact.html"    
    context_extra = {
        "contact": True, 
        "app_name": settings.APP_NAME,
    }


class Custom404View(ExtraContextMixin, TemplateView):
    template_name = "pages/classic/404.html"
    context_extra = {
        "app_name": settings.APP_NAME,
    }

    def render_to_response(self, context, **kwargs):
        response = super().render_to_response(context, **kwargs)
        response.status_code = 404
        return response

