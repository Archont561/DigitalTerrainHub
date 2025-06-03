from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views.credentials import CredentialsViewSet
from .views.account import UserViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'auth', CredentialsViewSet, basename='credentials')
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
]