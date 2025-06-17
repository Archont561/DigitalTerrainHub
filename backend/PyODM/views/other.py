from rest_framework import viewsets

from PyODM.models import NodeODMTaskOption, NodeODMTaskOutput
from PyODM.serializers import NodeODMTaskOptionSerializer, NodeODMTaskOutputSerializer


class NodeODMTaskOptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NodeODMTaskOption.objects.all()
    serializer_class = NodeODMTaskOptionSerializer
    lookup_field = 'name'


class NodeODMTaskOutputViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NodeODMTaskOutput.objects.all()
    serializer_class = NodeODMTaskOutputSerializer
    lookup_field = 'pk'
