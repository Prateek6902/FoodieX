import uuid
from django.db import models
from django.utils import timezone

class ChatRoom(models.Model):
    ROOM_TYPES = [
        ('CUSTOMER_VENDOR', 'Customer-Vendor'),
        ('CUSTOMER_DELIVERY', 'Customer-Delivery'),
        ('ADMIN_USER', 'Admin-User'),
        ('GROUP', 'Group'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_name = models.CharField(max_length=255, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    participants = models.ManyToManyField('users.User', related_name='chat_rooms')
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_chat_rooms')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chat_rooms'
        app_label = 'chat'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['room_name']),
            models.Index(fields=['room_type']),
            models.Index(fields=['-updated_at']),
        ]
    
    def __str__(self):
        return f"Room: {self.room_name} - {self.room_type}"

class ChatMessage(models.Model):
    MESSAGE_TYPES = [
        ('TEXT', 'Text'),
        ('IMAGE', 'Image'),
        ('FILE', 'File'),
        ('SYSTEM', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='chat_messages')  # Changed from 'sent_messages'
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='TEXT')
    message = models.TextField()
    file_url = models.URLField(max_length=500, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_by = models.ManyToManyField('users.User', related_name='read_chat_messages', blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='deleted_chat_messages')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_messages'
        app_label = 'chat'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['is_read']),
        ]
    
    def __str__(self):
        return f"{self.sender.email}: {self.message[:50]}"

class ChatParticipant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='participant_details')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='chat_participants')
    last_read_at = models.DateTimeField(default=timezone.now)
    is_typing = models.BooleanField(default=False)
    typing_updated_at = models.DateTimeField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'chat_participants'
        app_label = 'chat'
        unique_together = ['room', 'user']
        indexes = [
            models.Index(fields=['room', 'user']),
            models.Index(fields=['last_read_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} in {self.room.room_name}"