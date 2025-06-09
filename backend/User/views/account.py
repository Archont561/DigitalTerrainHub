from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from User.models import UserProfile
from User.serializers import UserSerializer, UserProfileSerializer

User = get_user_model()

class UserViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def partial_update(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request):
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def partial_update(self, request):
        profile = request.user.profile
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

