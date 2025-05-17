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



class AccountUpdateView(LoginRequiredMixin, UpdateView):
    forms_mapping = {
        "profile": {
            "class": UserProfileUpdateForm,
            "getter": lambda request: request.user.profile,
            "template": settings.TEMPLATES_NAMESPACES.cotton.forms.user_profile,
        },
        "user": {
            "class": UserUpdateForm,
            "getter": lambda request: request.user,
            "template": settings.TEMPLATES_NAMESPACES.cotton.forms.user_update,
        },
    }    

    def get(self, request, *args, **kwargs):
        rendered_forms = []
        for _, form_mapping in self.forms_mapping.items():
            form = form_mapping["class"](instance=form_mapping["getter"](request))
            rendered_forms.append(
                loader.render_to_string(form_mapping["template"], { "form": form })
            )
        return HttpResponse("".join(rendered_forms))

    def get_form_class(self, request):
        form_type = self.request.GET.get("form", None)
        if not form_type: 
            return HttpResponseBadRequest("Missing form type!")

        form_object = self.forms_mapping.get(form_type, None)
        if not form_class: 
            raise Http404("No such form!")

        return form_object["class"], form_object["getter"](request)

    def post(self, request, *args, **kwargs):
        form_class, instance = self.get_form_class(request)
        is_file_upload = form_class == UserProfileUpdateForm

        form = form_class(
            request.POST,
            request.FILES if is_file_upload else None,
            instance=instance
        )
        if form.is_valid(): form.save()

        return render(request, self.template_name, {"form": form})
    

class AccountDeleteView(LoginRequiredMixin, DeleteView):
    model = User
    success_url = reverse_lazy('core:home')

    def get_object(self):
        return self.request.user

