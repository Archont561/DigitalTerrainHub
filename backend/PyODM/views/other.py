from rest_framework import viewsets

from PyODM.models import NodeODMTaskOption
from PyODM.serializers import NodeODMTaskOptionSerializer


class NodeODMTaskOptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NodeODMTaskOption.objects.all()
    serializer_class = NodeODMTaskOptionSerializer
    lookup_field = 'name'
