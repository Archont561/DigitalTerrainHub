from django.conf import settings
from django.views.generic import TemplateView
    

class HomeView(TemplateView):
    template_name = "pages/classic/home.html"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "home": True, 
            'app_name': settings.APP_NAME,
        })
        return context


class AboutView(TemplateView):
    template_name = "pages/classic/about.html"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "about": True,
            'app_name': settings.APP_NAME,
        })
        return context


class ContactView(TemplateView):
    template_name = "pages/classic/contact.html"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "contact": True,
            'app_name': settings.APP_NAME,
        })
        return context


class Custom404View(TemplateView):
    template_name = "pages/classic/404.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            'app_name': settings.APP_NAME,
        })
        return context

    def render_to_response(self, context, **kwargs):
        response = super().render_to_response(context, **kwargs)
        response.status_code = 404
        return response