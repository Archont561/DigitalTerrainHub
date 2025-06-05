from django.db.models import Q

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from PyODM.models import OptionsPreset
from PyODM.serializers import OptionsPresetSerializer, AvailablePresetSerializer


class OptionsPresetViewSet(viewsets.ModelViewSet):
    serializer_class = OptionsPresetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OptionsPreset.objects.filter(Q(user__isnull=True) | Q(user=self.request.user))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='available')
    def available_presets(self, request):
        serializer = AvailablePresetSerializer(self.get_queryset(), many=True)
        return Response(serializer.data)
    