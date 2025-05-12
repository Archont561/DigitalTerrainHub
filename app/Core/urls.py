
from django.conf import settings
from django.contrib import admin
from django.conf.urls import handler404
from django.urls import path, include
from . import views


urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('contact/', views.ContactView.as_view(), name='contact'),
]

handler404 = views.Custom404View.as_view()