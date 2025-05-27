from django.urls import path, include
from .account import (
    url_patterns as account_patterns,
    namespace as account_namespace
)
from .credentials import (
    url_patterns as credentials_patterns, 
    namespace as credentials_namespace
)

urlpatterns = [
    path("", include((account_patterns, account_namespace))),
    path("credentials/", include((credentials_patterns, credentials_namespace))),
]