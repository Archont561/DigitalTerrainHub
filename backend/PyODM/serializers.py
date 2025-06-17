from rest_framework import serializers
from .models import Workspace, NodeODMTask, OptionsPreset, GCPPoint, NodeODMTaskOption, NodeODMTaskOutput
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
            'created_at_epoch',
            'image_count',
        ]
        read_only_fields = ['uuid', 'created_at_epoch', 'image_count']


class NodeODMTaskSerializer(serializers.ModelSerializer):
    workspace_uuid = serializers.UUIDField(source='workspace.uuid', read_only=True)
    options_preset = serializers.CharField(write_only=True, required=False)
    options = serializers.JSONField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = NodeODMTask
        fields = [
            'uuid',
            'workspace_uuid',
            'created_at',
            'status',
            'name',
            'options',
            'options_preset',
        ]
        read_only_fields = [
            'uuid',
            'workspace_uuid',
            'created_at',
            'status',
        ]

    def create(self, validated_data):
        preset_name = validated_data.pop("options_preset", None)
        options = validated_data.get("options", None)

        if preset_name == "custom":
            if not options:
                raise serializers.ValidationError({"options": "Options are required for custom preset."})
            
            option_qs = NodeODMTaskOption.objects.filter(name__in=options.keys())
            option_definitions = {opt.name: opt for opt in option_qs}
            for key, value in options.items():
                option_def = option_definitions.get(key, None)
                if not option_def:
                    raise serializers.ValidationError({f"options.{key}": "Unknown option."})
                if not option_def.is_valid_value(value):
                    raise serializers.ValidationError({f"options.{key}": f"Invalid value for '{key}'."})
            
            validated_data["options"] = options
        elif not preset_name:
            raise serializers.ValidationError({"options_preset": "Preset is required."})
        else:
            try:
                preset = OptionsPreset.objects.get(name=preset_name)
            except OptionsPreset.DoesNotExist:
                raise serializers.ValidationError({"options_preset": "Preset not found."})
            validated_data["options"] = preset.options

        workspace = self.context.get("workspace")
        webhook = self.context.get("webhook")

        if not workspace:
            raise serializers.ValidationError("Missing 'workspace' in serializer context.")
        
        return NodeODMTask.objects.create_task(
            workspace=workspace,
            name=validated_data.get("name"),
            options=validated_data.get("options"),
            webhook=webhook,
        )


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


class AvailablePresetSerializer(OptionsPresetSerializer):
    class Meta(OptionsPresetSerializer.Meta):
        fields = ['id', 'name', 'preset_type']
        read_only_fields = fields


class GCPPointSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    def get_location(self, obj):
        return {
            'lat': obj.location.y,
            'long': obj.location.x,
            'alt': obj.altitude
        }

    def get_image(self, obj):
        return {
            'name': obj.image_name,
            'x': obj.image_coords.x,
            'y': obj.image_coords.y
        }

    class Meta:
        model = GCPPoint
        fields = [
            "id",
            'label', 
            'location',
            'image',
        ]


class NodeODMTaskOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NodeODMTaskOption
        fields = '__all__'


class NodeODMTaskOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = NodeODMTaskOutput
        fields = '__all__'