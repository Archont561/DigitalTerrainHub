from django.shortcuts import redirect, reverse
from django.conf import settings
from django.contrib.auth import login as auth_login, views as auth_views
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.views.generic import CreateView, TemplateView, View
from django.urls import reverse_lazy
from django.http import HttpResponse
from django_htmx.http import HttpResponseClientRedirect
from User.forms import UserRegisterForm


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
    next_page = reverse_lazy("home")   


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
