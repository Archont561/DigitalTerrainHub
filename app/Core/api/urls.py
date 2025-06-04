from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    *router.urls,
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
]
