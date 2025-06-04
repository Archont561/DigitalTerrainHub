from django.conf import settings
from django.contrib import admin
from django.conf.urls import handler404
from django.urls import path, include
from .views import (
    NotificationViewSet,
    HomeView,
    Custom404View,
)
from rest_framework.routers import DefaultRouter
from django_eventstream.views import events

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

core_patterns = [
    path("", HomeView.as_view(), name="home"),
]

urlpatterns = [
    path("", include((core_patterns, "core"))),
    path("", include(router.urls)),
    path('user/', include('User.urls')),
    path('payment/', include(('Payment.urls', "payment"))),
    path('pyodm/', include('PyODM.urls')),
    path('map/', include('MapViewer.urls')),
    path('admin/', admin.site.urls),
    path('events/<channel>/', events, name='events'),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

handler404 = Custom404View.as_view()

if settings.DEBUG:
    from django.http import HttpResponseRedirect
    from django.urls import re_path
    
    redirect_to_astro = lambda request: HttpResponseRedirect(f'{settings.ASTRO_URL}{request.path}')
    urlpatterns += [
        re_path(r'^astro', redirect_to_astro),
        re_path(r'\.astro$', redirect_to_astro),
        re_path(r'^src', redirect_to_astro),
        re_path(r'^@id', redirect_to_astro),
        re_path(r'^@vite', redirect_to_astro),
    ]