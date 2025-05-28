import stripe
from django.shortcuts import redirect, reverse
from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View
from django.http import HttpResponseBadRequest, HttpResponseNotFound, HttpResponse

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateCheckoutSessionView(LoginRequiredMixin, View):
    http_method_names = ["get"]

    def get(self, request, *args, **kwargs):
        product_uuid = kwargs.get("product_uuid", None)
        if not product_uuid: 
            return HttpResponseBadRequest("The product UUID is missing in the request URL.")

        try: product = DYMMY_PRODUCT_MODEL.objects.get(uuid=product_uuid)
        except DYMMY_PRODUCT_MODEL.DoesNotExist: 
            return HttpResponseNotFound("Product not found!")

        DOMAIN = f"{request.scheme}://{request.get_host()}"
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card', "blik"],
            line_items=[
                {
                    'price_data': {
                        'currency': 'pl',
                        'unit_amount': product.price * 100,
                        'product_data': {
                            'name': product.name,
                            'images': [product.image.url]
                        },
                    },
                    'quantity': 1,
                },
            ],
            metadata = {
                'product_uuid': product_uuid,
                'user_email': request.user.email
            },
            
            mode='payment',

            success_url=f"{DOMAIN}{reverse('payment:payment-success', kwargs={ 'product_uuid': product_uuid })}",
            cancel_url=f"{DOMAIN}{reverse('payment:checkout-cancel', kwargs={ 'product_uuid': product_uuid })}",
        )

        return redirect(checkout_session.url)


class CheckoutSessionCancelView(LoginRequiredMixin, View):
    ...


class PaymentSuccesfulView(LoginRequiredMixin, View):
    ...


@method_decorator(csrf_exempt, name="get")
class StripeWebhookView(View):
    http_method_names = ["get"]
    
    def get(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError as e:
            return HttpResponse(status=400)

        # Handle the event
        match event.get('type', None):
            case 'checkout.session.completed':
                session = event['data']['object']
            case 'checkout.session.async_payment_failed':
                session = event['data']['object']
            case event_type:
                print(f'Unhandled event type {event_type}')

        return HttpResponse()

