from django.urls import path, include
from Core.helpers.shortcuts import generate_path_patterns, generate_path_namespace
from .views import (
    AccountProfileView,
    AccountUpdateView,
    AccountDeleteView,
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


account_patterns = generate_path_patterns([
    ('profile/', AccountProfileView, 'home'),
    ('update/', AccountUpdateView, 'update'),
    ('delete/', AccountDeleteView, 'delete'),
])

credentials_patterns = generate_path_patterns([
    ('register/', CredentialsRegisterView, 'register'),
    ('login/', CredentialsLoginView, 'login'),
    ('logout/', CredentialsLogoutView, 'logout'),
    ('email-verification/', CredentialsEmailVerificationView, 'email_verification'),
    ('password-reset/', CredentialsPasswordResetView, 'password-reset'),
    ('password-reset-confirm/<uidb64>/<token>/', CredentialsPasswordResetConfirmView, 'password-reset-confirm'),
    ('password-reset-done/', CredentialsPasswordResetDoneView, 'password-reset-done'),
    ('password-reset-complete/', CredentialsPasswordResetCompleteView, 'password-reset-complete'),
    ('password-change/', CredentialsPasswordChangeView, 'password-change'),
    ('password-change-done/', CredentialsPasswordChangeDoneView, 'password-change-done'),
])

urlpatterns = [
    generate_path_namespace("", "account", account_patterns),
    generate_path_namespace("credentials/", "credentials", credentials_patterns),
]
