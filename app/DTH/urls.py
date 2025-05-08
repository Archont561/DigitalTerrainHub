
from django.conf import settings
from django.contrib import admin
from django.conf.urls import handler404
from django.urls import path, include
from . import views


urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('contact/', views.ContactView.as_view(), name='contact'),
    path('users/', include('Users.urls')),
    path('payment/', include('Payment.urls')),
    path('pyodm/', include('PyODM.urls')),
    path('map/', include('MapViewer.urls')),
    path('admin/', admin.site.urls),
    path("__reload__/", include("django_browser_reload.urls")),
]

handler404 = views.Custom404View.as_view()