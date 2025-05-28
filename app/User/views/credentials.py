from django.shortcuts import redirect, reverse
from django.conf import settings
from django.apps import apps
from django.contrib.auth import login as auth_login, views as auth_views, get_user_model
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import get_user_model
from django.views.generic import CreateView, TemplateView, View
from django.urls import reverse_lazy
from django.http import HttpResponse
from django_htmx.http import HttpResponseClientRedirect
from User.forms import UserRegisterForm

User = get_user_model()
app_config = apps.get_app_config("User")


class CredentialsRegisterView(CreateView):
    model = User
    form_class = UserRegisterForm
    template_name = app_config.templates.register
    success_url = reverse_lazy('credentials:login')


class CredentialsLoginView(LoginView):
    template_name = app_config.templates.login
    next_page = reverse_lazy("account:home")

    def form_valid(self, form):
        auth_login(self.request, form.get_user())
        if self.request.htmx:
            return HttpResponseClientRedirect(self.get_success_url())
        return HttpResponseRedirect(self.get_success_url())


class CredentialsLogoutView(LoginRequiredMixin, LogoutView):
    next_page = reverse_lazy("core:home")   


class CredentialsPasswordResetView(auth_views.PasswordResetView):
    template_name = app_config.templates.password.reset
    email_template_name = app_config.templates.emails.password_reset_body
    subject_template_name = app_config.templates.emails.password_reset_subject
    success_url = reverse_lazy('credentials:password-reset-done')


class CredentialsPasswordResetDoneView(auth_views.PasswordResetDoneView):
    template_name = app_config.templates.password.reset_done



class CredentialsPasswordResetConfirmView(auth_views.PasswordResetConfirmView):
    template_name = app_config.templates.password.reset_confirm
    success_url = reverse_lazy('credentials:password-reset-complete')


class CredentialsPasswordResetCompleteView(auth_views.PasswordResetCompleteView):
    template_name = app_config.templates.password.reset_complete


class CredentialsPasswordChangeView(auth_views.PasswordChangeView):
    template_name = app_config.templates.password.change
    success_url = reverse_lazy('user-password:change-done')


class CredentialsPasswordChangeDoneView(auth_views.PasswordChangeDoneView):
    template_name = app_config.templates.password.change_done


class CredentialsEmailVerificationView(TemplateView):
    template_name = app_config.templates.email_verification
