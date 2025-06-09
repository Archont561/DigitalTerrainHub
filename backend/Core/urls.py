from django.conf import settings
from django.contrib import admin
from django.conf.urls import handler404, handler500
from django.urls import path, include
from .views import home, login, register, profile, custom_404, custom_500
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
        path("", home, name="home"),
        path("login/", login, name="login"),
        path("register/", register, name="register"),
        path("profile/", profile, name="profile"),
    ], "core"))),
    path("", include(debugpatterns)),
    path('admin/', admin.site.urls),
    path('events/<channel>/', events, name='events'),
    path('api/', include((apipatterns, "api")))
]

handler404 = custom_404
handler500 = custom_500