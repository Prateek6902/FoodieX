from rest_framework import serializers
from .models import SystemSettings, NotificationSettings

class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class UpdateNotificationSettingsSerializer(serializers.Serializer):
    email_order_updates = serializers.BooleanField(required=False)
    email_promotions = serializers.BooleanField(required=False)
    email_system_alerts = serializers.BooleanField(required=False)
    email_delivery_updates = serializers.BooleanField(required=False)
    email_payment_updates = serializers.BooleanField(required=False)
    push_order_updates = serializers.BooleanField(required=False)
    push_promotions = serializers.BooleanField(required=False)
    push_system_alerts = serializers.BooleanField(required=False)
    push_delivery_updates = serializers.BooleanField(required=False)
    push_chat_messages = serializers.BooleanField(required=False)
    sms_order_updates = serializers.BooleanField(required=False)
    sms_delivery_updates = serializers.BooleanField(required=False)
    sms_otp = serializers.BooleanField(required=False)