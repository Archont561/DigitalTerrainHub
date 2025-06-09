from django.conf import settings
from django.contrib import admin
from django.conf.urls import handler404
from django.urls import path, include
from .views import HomeView, Custom404View
from django_eventstream.views import events
from .api import apipatterns


urlpatterns = [
    path("", include([
        path("", HomeView.as_view(), name="home"),
    ], namespace="core")),
    path('admin/', admin.site.urls),
    path('events/<channel>/', events, name='events'),
    path('api/', include(apipatterns, namespace="api"))
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