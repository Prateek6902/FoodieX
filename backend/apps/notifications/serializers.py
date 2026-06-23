from rest_framework import serializers
from .models import Notification, NotificationTemplate, EmailLog, PushNotificationLog

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'notification_type', 'priority', 
                  'metadata', 'is_read', 'read_at', 'created_at']
        read_only_fields = ['id', 'created_at', 'read_at']

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class PushNotificationLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = PushNotificationLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class MarkNotificationReadSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(), 
        required=False
    )
    mark_all = serializers.BooleanField(default=False)

class SendNotificationSerializer(serializers.Serializer):
    user_ids = serializers.ListField(
        child=serializers.UUIDField(), 
        required=False
    )
    role = serializers.CharField(required=False, allow_null=True)
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()  # Changed from TextField to CharField
    notification_type = serializers.ChoiceField(choices=Notification.NOTIFICATION_TYPES)
    priority = serializers.ChoiceField(choices=Notification.PRIORITY_CHOICES, default='MEDIUM')
    metadata = serializers.DictField(required=False, default=dict)