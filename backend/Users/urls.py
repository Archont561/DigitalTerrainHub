from django.urls import path, include
from . import views

profile_patterns = [
    path('', views.UserProfileView.as_view(), name='home'),
    path('update/', views.UserProfileUpdateView.as_view(), name='update'),
]

user_patterns = [
    path('register/', views.UserRegisterView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('update/', views.UserUpdateView.as_view(), name='update'),
    path('delete/', views.UserDeleteView.as_view(), name='delete'),
]

urlpatterns = [
    path("", include((user_patterns, "user"))),
    path("profile/", include((profile_patterns, "profile"))),
]
