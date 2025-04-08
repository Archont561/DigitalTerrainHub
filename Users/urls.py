from django.urls import path
from .views import ( 
    UserRegisterView,
    UserLoginView,
    UserLogoutView,
    UserUpdateView,
    UserDeleteView,
    UserProfileUpdateView
)

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    path('update/', UserUpdateView.as_view(), name='user-update'),
    path('delete/', UserDeleteView.as_view(), name='user-delete'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='user-profile-update'),
]
