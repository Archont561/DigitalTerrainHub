
from django.conf import settings
from django.contrib import admin
from django.conf.urls import handler404
from django.urls import path, include
from .views import (
    HomeView,
    ProductsView,
    Custom404View,
)
from django_eventstream.views import events


urlpatterns = [
    path('user/', include('User.urls')),
    path('payment/', include(('Payment.urls', "payment"))),
    path('pyodm/', include('PyODM.urls')),
    path('map/', include('MapViewer.urls')),
    path('admin/', admin.site.urls),
    path("__reload__/", include("django_browser_reload.urls")),
    path('events/<channel>/', events, name='events'),
    
    path('', HomeView.as_view(), name='home'),
    path('products-viewer/', ProductsView.as_view(), name='products-viewer'),
]

handler404 = Custom404View.as_view()