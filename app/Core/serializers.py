from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'message', 'status', 'read',
            'created_at', 'related_object_id', 'related_object_uuid'
        ]
        read_only_fields = [
            'id', 'user', 'message', 'status',
            'created_at', 'related_object_id', 'related_object_uuid'
        ]
