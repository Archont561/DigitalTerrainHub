from django.urls import path
from .views import (
    CreateCheckoutSessionView,
    CheckoutSessionCancelView,
    PaymentSuccesfulView,
    StripeWebhookView,
)

urlpatterns = [
    path("checkout/<uuid:product_uuid>", CreateCheckoutSessionView.as_view(), name="checkout"),
    path('checkout-cancel/<uuid:product_uuid>', CheckoutSessionCancelView.as_view(), name='checkout-cancel'),
    path('payment-success/<uuid:product_uuid>', PaymentSuccesfulView.as_view(), name='payment-success'),
    path('webhook/', StripeWebhookView.as_view(), name='webhook'),
]
