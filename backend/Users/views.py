from django.shortcuts import render, redirect, reverse
from django.conf import settings
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.contrib.auth import views as auth_views
from django.contrib.auth import login
from django.views.generic import CreateView, UpdateView, DeleteView, DetailView, TemplateView, FormView
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.http import HttpResponse
from django_htmx.http import HttpResponseClientRedirect
from .models import Profile
from .forms import UserRegisterForm, UserUpdateForm, UserProfileUpdateForm


class UserRegisterView(CreateView):
    model = User
    form_class = UserRegisterForm
    template_name = 'pages/credentials/register.html'
    
    def form_valid(self, form):
        user = form.get_user()
        login(self.request, user)
        if self.request.htmx:
            return HttpResponseClientRedirect(redirect_to=reverse_lazy('user:login'))
        return redirect('user:login')

    def form_invalid(self, form):
        if not self.request.htmx:
            return super().form_invalid(form)

        return render(self.request, 
            "partials/forms/register.html", { "form": self.get_form() })


class UserLoginView(LoginView):
    template_name = 'pages/credentials/login.html'
    success_url = reverse_lazy('profile:home')
    
    def form_valid(self, form):
        user = form.get_user()
        login(self.request, user)
        if self.request.htmx:
            return HttpResponseClientRedirect(redirect_to=self.get_success_url())
        return redirect(self.get_success_url())

    def form_invalid(self, form):
        if not self.request.htmx:
            return super().form_invalid(form)
        return render(self.request, 
            "partials/forms/login.html", { "form": self.get_form() })


class UserPasswordResetView(auth_views.PasswordResetView):
    template_name = 'pages/credentials/password/reset.html'
    email_template_name = 'emails/password_reset_body.html'
    subject_template_name = 'emails/password_reset_subject.txt'
    success_url = reverse_lazy('user-password:reset-done')


class UserPasswordResetDoneView(auth_views.PasswordResetDoneView):
    template_name = 'pages/credentials/password/reset_done.html'


class UserPasswordResetConfirmView(auth_views.PasswordResetConfirmView):
    template_name = 'pages/password_reset_confirm.html'  # Custom confirmation template
    success_url = reverse_lazy('user-password:reset-complete')


class UserPasswordResetCompleteView(auth_views.PasswordResetCompleteView):
    template_name = 'pages/password/reset_complete.html'


class UserPasswordChangeView(auth_views.PasswordChangeView):
    template_name = 'pages/credentials/password/change.html'
    success_url = reverse_lazy('user-password:change-done')


class UserPasswordChangeDoneView(auth_views.PasswordChangeDoneView):
    template_name = 'pages/credentials/password/change_done.html'


class UserEmailVerificationView(TemplateView):
    template_name = 'pages/credentials/email_verification.html'


class UserHelpView(TemplateView):
    template_name = 'pages/classic/help.html'


class UserUpdateView(LoginRequiredMixin, UpdateView):
    model = User
    form_class = UserUpdateForm
    template_name = 'users/update.html'
    success_url = reverse_lazy('user:update')

    def get_object(self):
        return self.request.user


class UserLogoutView(LoginRequiredMixin, LogoutView):
    next_page = '/'


class UserDeleteView(LoginRequiredMixin, DeleteView):
    model = User
    template_name = 'users/delete.html'
    success_url = reverse_lazy('home')

    def get_object(self):
        return self.request.user


class UserProfileView(LoginRequiredMixin, DetailView):
    model = User
    template_name = 'pages/profile/user_profile.html'
    context_object_name = 'user'
    extra_context = {
        "profile": True,
        "app_name": settings.APP_NAME,
        "tabs": [
            {
                "name": "settings",
                "template": (template_root := "partials/components/tabs/") + "settings.html" 
            },
            {
                "name": "workspaces",
                "template": template_root + "workspaces.html" 
            },
            {
                "name": "notifications",
                "template": template_root + "notifications.html" 
            },
        ]
    }
    
    def get_object(self):
        return self.request.user
    

class UserProfileUpdateView(LoginRequiredMixin, UpdateView):

    model = Profile
    form_class = UserProfileUpdateForm
    template_name = 'users/profile/update.html'
    success_url = reverse_lazy('profile:home')

    def get_object(self):
        return self.request.user.profile

