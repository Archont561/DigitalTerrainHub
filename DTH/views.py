from django.conf import settings
from django.views.generic import TemplateView


class HomeView(TemplateView):
    template_name = "pages/classic/home.html"
    extra_context = {
        "home": True, 
        "app_name": settings.APP_NAME,
    }


class AboutView(TemplateView):
    template_name = "pages/classic/about.html"
    extra_context = {
        "about": True, 
        "app_name": settings.APP_NAME,
    }


class ContactView(TemplateView):
    template_name = "pages/classic/contact.html"    
    extra_context = {
        "contact": True, 
        "app_name": settings.APP_NAME,
    }


class Custom404View(TemplateView):
    template_name = "pages/classic/404.html"
    extra_context = {
        "app_name": settings.APP_NAME,
    }

    def render_to_response(self, context, **kwargs):
        response = super().render_to_response(context, **kwargs)
        response.status_code = 404
        return response

