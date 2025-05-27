from django.urls import path
from User.views.credentials import (
    CredentialsRegisterView,
    CredentialsLoginView,
    CredentialsLogoutView,
    CredentialsEmailVerificationView,
    CredentialsPasswordResetView,
    CredentialsPasswordResetDoneView,
    CredentialsPasswordResetConfirmView,
    CredentialsPasswordResetCompleteView,
    CredentialsPasswordChangeView,
    CredentialsPasswordChangeDoneView,
)

namespace = "credentials"

url_patterns = [
    path('register/', CredentialsRegisterView.as_view(), name='register'),
    path('login/', CredentialsLoginView.as_view(), name='login'),
    path('logout/', CredentialsLogoutView.as_view(), name='logout'),
    path('email-verification/', CredentialsEmailVerificationView.as_view(), name='email_verification'),
    path('password-reset/', CredentialsPasswordResetView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', CredentialsPasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('password-reset-done/', CredentialsPasswordResetDoneView.as_view(), name='password-reset-done'),
    path('password-reset-complete/', CredentialsPasswordResetCompleteView.as_view(), name='password-reset-complete'),
    path('password-change/', CredentialsPasswordChangeView.as_view(), name='password-change'),
    path('password-change-done/', CredentialsPasswordChangeDoneView.as_view(), name='password-change-done'),
]
