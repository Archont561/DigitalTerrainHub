from django.urls import path, include
from . import views

profile_patterns = [
    path('', views.UserProfileView.as_view(), name='home'),
    path('update/', views.UserProfileUpdateView.as_view(), name='update'),
]

user_password_patterns = [
    path('reset/', views.UserPasswordResetView.as_view(), name='reset'),
    path('reset-done/', views.UserPasswordResetDoneView.as_view(), name='reset-done'),
    path('reset/<uidb64>/<token>/', views.UserPasswordResetConfirmView.as_view(), name='reset-confirm'),
    path('reset-complete/', views.UserPasswordResetCompleteView.as_view(), name='reset-complete'),
    path('change/', views.UserPasswordChangeView.as_view(), name='change'),
    path('hange-done/', views.UserPasswordChangeDoneView.as_view(), name='change-done'),
]

user_patterns = [
    path('register/', views.UserRegisterView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    path('update/', views.UserUpdateView.as_view(), name='update'),
    path('delete/', views.UserDeleteView.as_view(), name='delete'),
    path('email-verification/', views.UserEmailVerificationView.as_view(), name='email-verification'),
    path('help/', views.UserHelpView.as_view(), name='help'),
]

urlpatterns = [
    path("", include((user_patterns, "user"))),
    path("password/", include((user_password_patterns, "user-password"))),
    path("profile/", include((profile_patterns, "profile"))),
]
