# users/signals.py

from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.urls import reverse
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings

from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(pre_save, sender=User)
def send_verification_email_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old_user = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    if old_user.email == instance.email or not instance.email: return
    
    domain = getattr(settings, 'SITE_DOMAIN', None)
    scheme = getattr(settings, 'SITE_SCHEME', None)
    if domain is None or scheme is None: return

    token = default_token_generator.make_token(instance)
    uid = urlsafe_base64_encode(force_bytes(instance.pk))

    verify_url_path = reverse('credentials-confirm-email-verification')
    verify_url = f"{scheme}://{domain}{verify_url_path}?uidb64={uid}&token={token}"

    subject = 'Verify your email address'
    message = render_to_string('emails/email_verification_body.html', {
        'user': instance,
        'verify_url': verify_url,
    })

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [instance.email])
