from rest_framework import serializers
from .models import Workspace, NodeODMTask, OptionsPreset
from django.contrib.auth import get_user_model

User = get_user_model()

class WorkspaceSerializer(serializers.ModelSerializer):
    created_at_epoch = serializers.ReadOnlyField()
    image_count = serializers.ReadOnlyField()

    class Meta:
        model = Workspace
        fields = [
            'uuid',
            'name',
            'created_at',
            'created_at_epoch',
            'image_count',
        ]
        read_only_fields = ['uuid', 'created_at', 'created_at_epoch', 'image_count']


class NodeODMTaskSerializer(serializers.ModelSerializer):
    workspace_uuid = serializers.UUIDField(source='workspace.uuid', read_only=True)

    class Meta:
        model = NodeODMTask
        fields = [
            'uuid',
            'workspace_uuid',
            'created_at',
            'status',
            'name',
        ]
        read_only_fields = ['uuid', 'workspace_uuid', 'created_at', 'status']


class OptionsPresetSerializer(serializers.ModelSerializer):
    preset_type = serializers.SerializerMethodField()

    class Meta:
        model = OptionsPreset
        fields = [
            'id',
            'preset_type',
            'name',
            'options',
        ]
        read_only_fields = ['id', 'preset_type']

    def get_preset_type(self, obj):
        return "global" if obj.user is None else "custom"
