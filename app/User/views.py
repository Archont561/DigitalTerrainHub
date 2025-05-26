from django.shortcuts import render, redirect, reverse
from django.conf import settings
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.contrib.auth import views as auth_views, login
from django.views.generic import CreateView, UpdateView, DeleteView, DetailView, TemplateView, FormView
from django.template import loader
from django.urls import reverse_lazy
from django.http import HttpResponse, Http404, HttpResponseBadRequest
from .models import UserProfile
from .forms import UserRegisterForm, UserUpdateForm, UserProfileUpdateForm
from PyODM.models import OptionsPreset
from PyODM.enums import NodeODMOptions


class CredentialsRegisterView(CreateView):
    model = User
    form_class = UserRegisterForm
    template_name = settings.TEMPLATES_NAMESPACES.pages.credentials.register
    success_url = reverse_lazy('credentials:login')


class CredentialsLoginView(LoginView):
    template_name = settings.TEMPLATES_NAMESPACES.pages.credentials.login
    next_page = reverse_lazy("account:home")

    def form_valid(self, form):
        auth_login(self.request, form.get_user())
        if self.request.htmx:
            return HttpResponseClientRedirect(self.get_success_url())
        return HttpResponseRedirect(self.get_success_url())


class CredentialsLogoutView(LoginRequiredMixin, LogoutView):
    next_page = reverse_lazy("core:home")   


class CredentialsPasswordResetView(auth_views.PasswordResetView):
    template_name = settings.TEMPLATES_NAMESPACES.pages.credentials.password.reset
    email_template_name = settings.TEMPLATES_NAMESPACES.emails.password_reset_body
    subject_template_name = settings.TEMPLATES_NAMESPACES.emails.password_reset_subject
    success_url = reverse_lazy('credentials:password-reset-done')


class CredentialsPasswordResetDoneView(auth_views.PasswordResetDoneView):
    template_name = settings.TEMPLATES_NAMESPACES.pages.credentials.password.reset_done



class CredentialsPasswordResetConfirmView(auth_views.PasswordResetConfirmView):
    template_name = settings.TEMPLATES_NAMESPACES.pages.credentials.password.reset_confirm
    success_url = reverse_lazy('credentials:password-reset-complete')


class CredentialsPasswordResetCompleteView(auth_views.PasswordResetCompleteView):
    template_name = settings.TEMPLATES_NAMESPACES.pages.credentials.password.reset_complete


class CredentialsPasswordChangeView(auth_views.PasswordChangeView):
    template_name = settings.TEMPLATES_NAMESPACES.pages.credentials.password.change
    success_url = reverse_lazy('user-password:change-done')


class CredentialsPasswordChangeDoneView(auth_views.PasswordChangeDoneView):
    template_name = settings.TEMPLATES_NAMESPACES.pages.credentials.password.change_done


class CredentialsEmailVerificationView(TemplateView):
    template_name = settings.TEMPLATES_NAMESPACES.pages.credentials.email_verification


class AccountProfileView(LoginRequiredMixin, DetailView):
    model = User
    template_name = settings.TEMPLATES_NAMESPACES.pages.user_profile
    context_object_name = 'user'
    
    def get_object(self):
        return self.request.user

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update({
            "options": NodeODMOptions.to_dict(group=True),
            "workspaces": self.get_object().workspaces.all(),
            "presets_names": {
                "global": settings.GLOBAL_OPTION_PRESETS.keys(),
                "user": OptionsPreset.objects.filter(user=self.get_object()).values_list('name', flat=True),
            }
        })
        return context



class AccountUpdateView(LoginRequiredMixin, View):
    forms_mapping = {
        "profile": {
            "class": UserProfileUpdateForm,
            "getter": lambda request: request.user.profile,
            "template": settings.TEMPLATES_NAMESPACES.cotton.forms.settings.profile,
        },
        "user": {
            "class": UserUpdateForm,
            "getter": lambda request: request.user,
            "template": settings.TEMPLATES_NAMESPACES.cotton.forms.settings.user,
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

