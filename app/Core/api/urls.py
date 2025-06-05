from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    *router.urls,
    path('user/', include('User.urls', namespace="user")),
    path('payment/', include('Payment.urls', namespace="payment")),
    path('pyodm/', include('PyODM.urls', namespace="pyodm")),
    path('map/', include('MapViewer.urls', namespace="map")),
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
]
