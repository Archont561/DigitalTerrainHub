from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views.credentials import CredentialsViewSet
from .views.account import UserViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'auth', CredentialsViewSet, basename='credentials')

urlpatterns = [
    path('', include(router.urls)),
    path("", UserViewSet.as_view({"get": "retrieve", "patch": "partial_update"}), name="user-detail"),
    path("profile/", UserProfileViewSet.as_view({"get": "retrieve", "patch": "partial_update"}), name="user-profile"),
]

app_name = "user"