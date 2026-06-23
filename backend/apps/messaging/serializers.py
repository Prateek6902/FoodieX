from rest_framework import serializers
from .models import Message, MessageAttachment, BroadcastMessage

class MessageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_email = serializers.CharField(source='sender.email', read_only=True)
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'read_at']

class SendMessageSerializer(serializers.Serializer):
    recipient_id = serializers.UUIDField()
    subject = serializers.CharField(max_length=255)
    body = serializers.CharField()
    message_type = serializers.ChoiceField(choices=Message.MESSAGE_TYPES, default='SYSTEM')
    metadata = serializers.DictField(required=False, default=dict)

class BroadcastMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    
    class Meta:
        model = BroadcastMessage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'sent_at']

class SendBroadcastSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=255)
    body = serializers.CharField()
    recipient_roles = serializers.ListField(child=serializers.CharField())