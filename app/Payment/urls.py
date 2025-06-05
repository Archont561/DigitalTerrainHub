from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StripePaymentViewSet

router = DefaultRouter()
router.register(r'stripe', StripePaymentViewSet, basename='stripe')

urlpatterns = [
    path('', include(router.urls)),
]

app_name = "payment"