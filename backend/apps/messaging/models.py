import uuid
from django.db import models
from django.utils import timezone

class Message(models.Model):
    MESSAGE_TYPES = [
        ('SYSTEM', 'System Message'),
        ('ORDER', 'Order Message'),
        ('PROMOTION', 'Promotion'),
        ('ALERT', 'Alert'),
        ('REMINDER', 'Reminder'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='sent_messages')  # Keep this for messaging
    recipient = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='received_messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='SYSTEM')
    subject = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    is_deleted_by_sender = models.BooleanField(default=False)
    is_deleted_by_recipient = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        app_label = 'messaging'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', '-created_at']),
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['message_type']),
        ]
    
    def __str__(self):
        return f"{self.sender.email} -> {self.recipient.email}: {self.subject}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

class MessageAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='message_attachments/')
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'message_attachments'
        app_label = 'messaging'

class BroadcastMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='broadcast_messages')
    subject = models.CharField(max_length=255)
    body = models.TextField()
    recipient_roles = models.JSONField(default=list, help_text="List of roles to send to")
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    total_recipients = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'broadcast_messages'
        app_label = 'messaging'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Broadcast: {self.subject}"