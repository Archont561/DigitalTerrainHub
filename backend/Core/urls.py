from django.conf import settings
from django.contrib import admin
from django.conf.urls import handler404
from django.urls import path, include
from .views import HomeView, Custom404View
from django_eventstream.views import events
from .api import apipatterns


debugpatterns = []

if settings.DEBUG:
    from django.http import HttpResponseRedirect
    
    redirect_to_astro = lambda request: HttpResponseRedirect(f'{settings.ASTRO_URL}{request.path}')
    debugpatterns += [
        re_path("", redirect_to_astro),
    ]


urlpatterns = [
    path("", include(([
        path("", HomeView.as_view(), name="home"),
    ], "core"))),
    path("", include(debugpatterns)),
    path('admin/', admin.site.urls),
    path('events/<channel>/', events, name='events'),
    path('api/', include((apipatterns, "api")))
]

handler404 = Custom404View.as_view()