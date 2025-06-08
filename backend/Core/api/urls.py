from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from django.urls import path, include, reverse_lazy
from django.shortcuts import redirect
from .views import NotificationViewSet

notificationsRouter = DefaultRouter()
notificationsRouter.register("", NotificationViewSet, basename='notification')

urlpatterns = [
    path("", lambda request: redirect(reverse_lazy("swagger-ui"))),
    path("notifications/", include(notificationsRouter.urls)),
    path('user/', include('User.urls', namespace="user")),
    path('payment/', include('Payment.urls', namespace="payment")),
    path('pyodm/', include('PyODM.urls', namespace="pyodm")),
    path('map/', include('MapViewer.urls', namespace="map")),
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
    path("schema/", include([
        path('', SpectacularAPIView.as_view(), name='schema'),
        path('swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ])),
] 
