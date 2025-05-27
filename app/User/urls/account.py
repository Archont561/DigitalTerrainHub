from django.urls import path
from User.views.account import (
    AccountProfileView,
    AccountUpdateView,
    AccountDeleteView,
)

namespace = "account"

url_patterns = [
    path('profile/', AccountProfileView.as_view(), name='home'),
    path('update/', AccountUpdateView.as_view(), name='update'),
    path('delete/', AccountDeleteView.as_view(), name='delete'),
]
