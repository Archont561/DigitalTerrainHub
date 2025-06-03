from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.apps import apps
from django.template.loader import render_to_string
from django.core.mail import send_mail

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.serializers import Serializer, CharField, EmailField, ValidationError

User = get_user_model()
app_config = apps.get_app_config("User")

class CredentialsViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'User registered successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            serialized_user = UserSerializer(user)
            return Response({'detail': 'Logged in successfully.', 'user': serialized_user.data})
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        logout(request)
        return Response({'detail': 'Logged out successfully.'})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'detail': 'Old and new passwords are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({'detail': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password changed successfully.'})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def request_password_reset(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        form = PasswordResetForm(data={'email': email})
        if form.is_valid():
            form.save(
                request=request,
                use_https=request.is_secure(),
                email_template_name=app_config.templates.emails.password_reset_body,
                subject_template_name=app_config.templates.emails.password_reset_subject,
                from_email=settings.DEFAULT_FROM_EMAIL,
            )
            return Response({'detail': 'Password reset email sent.'})
        else:
            return Response({'detail': 'Invalid email address.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def confirm_password_reset(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uidb64 = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'Invalid user.'}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Password reset successful.'})
        else:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def request_email_verification(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.email:
            return Response({'detail': 'User has no email address.'}, status=status.HTTP_400_BAD_REQUEST)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        verify_url_path = reverse('credentials-confirm-email-verification')
        verify_url = f"{request.scheme}://{request.get_host()}{verify_url_path}?uidb64={uid}&token={token}"

        subject = 'Verify your email address'
        message = render_to_string('emails/email_verification_body.html', {
            'user': user,
            'verify_url': verify_url,
        })
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

        return Response({'detail': 'Verification email sent.'})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def confirm_email_verification(self, request):
        serializer = EmailVerificationConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uidb64 = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'Invalid user.'}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.email_verified = True
            user.save()
            return Response({'detail': 'Email verified successfully.'})
        else:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
