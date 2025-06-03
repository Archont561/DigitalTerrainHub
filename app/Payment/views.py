from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripePaymentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"], url_path="create-session")
    def create_session(self, request, pk=None):
        try:
            product = CUSTOMPRODUCTMODEL.objects.get(uuid=pk)
        except CUSTOMPRODUCTMODEL.DoesNotExist:
            return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            success_url = request.build_absolute_uri(
                reverse('checkout-success', kwargs={'pk': str(product.uuid)})
            )
            cancel_url = request.build_absolute_uri(
                reverse('checkout-cancel', kwargs={'pk': str(product.uuid)})
            )

            session = stripe.checkout.Session.create(
                payment_method_types=['card', 'blik'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'pln',
                            'unit_amount': int(product.price * 100),
                            'product_data': {
                                'name': product.name,
                                'images': [request.build_absolute_uri(product.image.url)],
                            },
                        },
                        'quantity': 1,
                    },
                ],
                metadata={
                    'product_uuid': str(product.uuid),
                    'user_email': request.user.email,
                },
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
            )

            return Response({"checkout_url": session.url})

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["get"], url_path="success", permission_classes=[AllowAny])
    def payment_success(self, request, pk=None):
        return Response({"message": f"Payment for product {pk} was successful!"})

    @action(detail=True, methods=["get"], url_path="cancel", permission_classes=[AllowAny])
    def payment_cancel(self, request, pk=None):
        return Response({"message": f"Payment for product {pk} was canceled."})

    @method_decorator(csrf_exempt)
    @action(detail=False, methods=["post"], url_path="webhook", permission_classes=[AllowAny])
    def webhook(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return HttpResponse(status=400)

        event_type = event.get("type")
        session = event["data"]["object"]

        if event_type == "checkout.session.completed":
            print(f"✅ Payment succeeded for session: {session['id']}")
        elif event_type == "checkout.session.async_payment_failed":
            print(f"❌ Payment failed for session: {session['id']}")
        else:
            print(f"Unhandled event type: {event_type}")

        return HttpResponse(status=200)

