
from django.conf import settings
from django.contrib import admin
from django.conf.urls import handler404
from django.urls import path, include
from . import views


urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('products-viewer/', views.ProductsView.as_view(), name='products-viewer'),
]

handler404 = views.Custom404View.as_view()