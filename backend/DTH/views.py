from django.conf import settings
from django.views.generic import TemplateView
    

class ContextMixin:
    context_extra = {}

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(self.context_extra)
        return context


class HomeView(ContextMixin, TemplateView):
    template_name = "pages/classic/home.html"
    context_extra = {
        "home": True, 
        "app_name": settings.APP_NAME,
    }


class AboutView(ContextMixin, TemplateView):
    template_name = "pages/classic/about.html"
    context_extra = {
        "about": True, 
        "app_name": settings.APP_NAME,
    }


class ContactView(ContextMixin, TemplateView):
    template_name = "pages/classic/contact.html"    
    context_extra = {
        "contact": True, 
        "app_name": settings.APP_NAME,
    }


class Custom404View(ContextMixin, TemplateView):
    template_name = "pages/classic/404.html"
    context_extra = {
        "app_name": settings.APP_NAME,
    }

    def render_to_response(self, context, **kwargs):
        response = super().render_to_response(context, **kwargs)
        response.status_code = 404
        return response

