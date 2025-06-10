from django.conf import settings
from django.contrib import admin
from django.conf.urls import handler404, handler500
from django.urls import path, include, re_path
from django.http import HttpResponseRedirect
from .views import home, login, register, profile, custom_404, custom_500, proxy_to_astro
from django_eventstream.views import events
from .api import apipatterns


urlpatterns = [
    path("", include(([  
        path("", home, name="home"),
        path("login/", login, name="login"),
        path("register/", register, name="register"),
        path("profile/", profile, name="profile"),
    ], "core"))),
    path('admin/', admin.site.urls),
    path('events/<channel>/', events, name='events'),
    path('api/', include((apipatterns, "api"))),
    re_path(r"^_astro/.*", proxy_to_astro),
]

handler404 = custom_404
handler500 = custom_500