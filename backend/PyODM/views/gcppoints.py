from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from PyODM.models import GCPPoint
from PyODM.serializers import GCPPointSerializer

class GCPPointViewSet(viewsets.ModelViewSet):
    serializer_class = GCPPointSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GCPPoint.objects.filter(workspace__pk=self.kwargs.get('workspace_pk'))