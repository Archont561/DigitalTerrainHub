from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django_eventstream.views import events


urlpatterns = [
    path('', include(('Core.urls', "core"))),
    path('user/', include('User.urls')),
    path('payment/', include('Payment.urls')),
    path('pyodm/', include('PyODM.urls')),
    path('map/', include('MapViewer.urls')),
    path('admin/', admin.site.urls),
    path("__reload__/", include("django_browser_reload.urls")),
    path('events/<channel>/', events, name='events'),
]