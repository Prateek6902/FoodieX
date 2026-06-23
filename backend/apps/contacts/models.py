import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class ContactQuery(models.Model):
    QUERY_TYPES = [
        ('GENERAL', 'General Inquiry'),
        ('ORDER', 'Order Related'),
        ('PAYMENT', 'Payment Issue'),
        ('DELIVERY', 'Delivery Issue'),
        ('VENDOR', 'Vendor Support'),
        ('TECHNICAL', 'Technical Issue'),
        ('COMPLAINT', 'Complaint'),
        ('FEEDBACK', 'Feedback'),
        ('OTHER', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=50, unique=True, db_index=True)
    query_type = models.CharField(max_length=20, choices=QUERY_TYPES)
    
    # Customer Info
    customer = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='contact_queries', null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Query Details
    subject = models.CharField(max_length=255)
    message = models.TextField()
    attachments = models.JSONField(default=list, blank=True)
    
    # Support Info
    assigned_to = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_queries')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    priority = models.CharField(max_length=10, choices=[
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent')
    ], default='MEDIUM')
    
    # Resolution
    resolution_notes = models.TextField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contact_queries'
        app_label = 'contacts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['ticket_number']),
            models.Index(fields=['customer', '-created_at']),
            models.Index(fields=['email', '-created_at']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.ticket_number} - {self.subject}"

class ContactReply(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.ForeignKey(ContactQuery, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    message = models.TextField()
    attachments = models.JSONField(default=list, blank=True)
    is_staff_reply = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'contact_replies'
        app_label = 'contacts'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Reply to {self.query.ticket_number}"

class FAQ(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=100, db_index=True)
    question = models.CharField(max_length=255)
    answer = models.TextField()
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    views_count = models.IntegerField(default=0)
    helpful_count = models.IntegerField(default=0)
    not_helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'faqs'
        app_label = 'contacts'
        ordering = ['display_order', 'category']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.question

