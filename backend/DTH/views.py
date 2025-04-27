from django.conf import settings
from django.shortcuts import render
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
        })
        return context


class ContactView(TemplateView):
    template_name = "pages/classic/contact.html"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "contact": True,
        })
        return context


def custom_404(request, exception):
    return render(request, 'pages/classic/404.html', status=404)