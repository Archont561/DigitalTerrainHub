from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django.views.generic import CreateView, UpdateView, DeleteView, TemplateView
from django.urls import reverse_lazy
from .models import Profile
from .forms import UserRegisterForm, UserUpdateForm, UserProfileUpdateForm

class UserRegisterView(CreateView):
    template_name = 'users/register.html'
    form_class = UserRegisterForm
    success_url = reverse_lazy('user-login')

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        return redirect('user-profile-update')


class UserUpdateView(LoginRequiredMixin, UpdateView):
    model = User
    form_class = UserUpdateForm
    template_name = 'users/update.html'
    success_url = reverse_lazy('user-update')

    def get_object(self):
        return self.request.user

class UserLoginView(LoginView):
    template_name = 'users/login.html'

class UserLogoutView(LoginRequiredMixin, LogoutView):
    next_page = '/'

class UserDeleteView(LoginRequiredMixin, DeleteView):
    model = User
    template_name = 'users/delete.html'
    success_url = reverse_lazy('home')

    def get_object(self):
        return self.request.user

class UserProfileUpdateView(LoginRequiredMixin, UpdateView):
    model = Profile
    form_class = UserProfileUpdateForm
    template_name = 'users/profile_update.html'
    success_url = reverse_lazy('user-profile-update')

    def get_object(self):
        return self.request.user.profile