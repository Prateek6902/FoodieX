from rest_framework import serializers
from .models import ChatRoom, ChatMessage, ChatParticipant
from apps.users.serializers import UserSerializer

class ChatParticipantSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = ChatParticipant
        fields = ['id', 'user', 'user_details', 'last_read_at', 'is_typing', 'joined_at']
        read_only_fields = ['id', 'joined_at']

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_email = serializers.CharField(source='sender.email', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'room', 'sender', 'sender_name', 'sender_email', 'message_type', 
                  'message', 'file_url', 'is_read', 'read_at', 'created_at']
        read_only_fields = ['id', 'created_at', 'read_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    participants_details = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'room_name', 'room_type', 'created_by', 'participants_details', 
                  'last_message', 'unread_count', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_participants_details(self, obj):
        participants = obj.participants.select_related().all()
        return UserSerializer(participants, many=True).data
    
    def get_last_message(self, obj):
        last_msg = obj.messages.filter(is_deleted=False).first()
        if last_msg:
            return ChatMessageSerializer(last_msg).data
        return None
    
    def get_unread_count(self, obj):
        user = self.context.get('request').user
        return obj.messages.filter(
            is_read=False,
            is_deleted=False
        ).exclude(sender=user).count()

class CreateChatRoomSerializer(serializers.Serializer):
    participant_ids = serializers.ListField(child=serializers.UUIDField())
    room_type = serializers.ChoiceField(choices=ChatRoom.ROOM_TYPES)
    room_name = serializers.CharField(required=False, allow_null=True)

class SendMessageSerializer(serializers.Serializer):
    message = serializers.CharField(required=False, allow_blank=True)
    message_type = serializers.ChoiceField(choices=ChatMessage.MESSAGE_TYPES, default='TEXT')
    file_url = serializers.URLField(required=False, allow_null=True)