from django.shortcuts import render, reverse
from django.apps import apps
from django.conf import settings
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import get_user_model
from django.views.generic import UpdateView, DeleteView, DetailView, View
from django.urls import reverse_lazy
from django.http import HttpResponse, Http404, HttpResponseBadRequest
from User.models import UserProfile
from User.forms import UserUpdateForm, UserProfileUpdateForm
from PyODM.models import OptionsPreset, NodeODMTask
from PyODM.enums import NodeODMOptions

User = get_user_model()
app_config = apps.get_app_config("User")

class AccountProfileView(LoginRequiredMixin, DetailView):
    model = User
    template_name = app_config.templates.user_profile
    context_object_name = 'user'
    
    def get_object(self):
        return self.request.user

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.get_object()
        user_workspaces = user.workspaces.all()
        user_presets = OptionsPreset \
            .objects.filter(user=user) \
            .exclude(name="Default") \
            .values_list('name', flat=True)
        user_tasks = NodeODMTask.objects.filter(workspace__in=user_workspaces)
        context.update({
            "options": NodeODMOptions.to_dict(group=True),
            "workspaces": user_workspaces,
            "presets_names": {
                "global": settings.GLOBAL_OPTION_PRESETS.keys(),
                "user": user_presets,
            },
            "tasks": user_tasks
        })
        return context



class AccountUpdateView(LoginRequiredMixin, View):
    forms_mapping = {
        "profile": {
            "class": UserProfileUpdateForm,
            "getter": lambda request: request.user.profile,
            "template": app_config.templates.cotton.forms.settings.profile,
        },
        "user": {
            "class": UserUpdateForm,
            "getter": lambda request: request.user,
            "template": app_config.templates.cotton.forms.settings.user,
        },
    }
    http_method_names = ["get", "post"]

    def dispatch(self, request, *args, **kwargs):
        source = request.GET if request.method == 'GET' else request.POST
        form_type = source.get("form", "").lower()
        if not form_type: return HttpResponseBadRequest("Missing form type!")

        self.form_mapping = form_mapping = self.forms_mapping.get(form_type, None)
        if not form_mapping: raise Http404("No such form!")

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        form_class = self.form_mapping["class"]
        getter = self.form_mapping["getter"]
        template = self.form_mapping["template"]
        form = form_class(instance=getter(request))
        return render(request, self.form_mapping["template"], { "form": form })

    def post(self, request, *args, **kwargs):
        form_class = self.form_mapping["class"]
        getter = self.form_mapping["getter"]
        template = self.form_mapping["template"]
        form = form_class(request.POST, request.FILES, instance=getter(request))
        if form.is_valid(): form.save()
        return render(request, template, {"form": form })
    

class AccountDeleteView(LoginRequiredMixin, DeleteView):
    model = User
    success_url = reverse_lazy('core:home')

    def get_object(self):
        return self.request.user

