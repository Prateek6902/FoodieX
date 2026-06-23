import uuid
from django.db import models
from django.utils import timezone

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('VIEW', 'View'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('EXPORT', 'Export'),
        ('IMPORT', 'Import'),
        ('APPROVE', 'Approve'),
        ('REJECT', 'Reject'),
        ('ASSIGN', 'Assign'),
        ('STATUS_CHANGE', 'Status Change'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User Information
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    user_email = models.EmailField(null=True, blank=True)
    user_role = models.CharField(max_length=50, null=True, blank=True)
    user_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    # Action Information
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, db_index=True)
    model_name = models.CharField(max_length=100, db_index=True)
    object_id = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    object_repr = models.CharField(max_length=255, null=True, blank=True)
    
    # Change Information
    old_data = models.JSONField(default=dict, blank=True)
    new_data = models.JSONField(default=dict, blank=True)
    changed_fields = models.JSONField(default=list, blank=True)
    
    # Request Information
    request_method = models.CharField(max_length=10, null=True, blank=True)
    request_path = models.TextField(null=True, blank=True)
    request_query_params = models.JSONField(default=dict, blank=True)
    
    # Additional Info
    message = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'audit_logs'
        app_label = 'audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['user_email']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user_role']),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.model_name} - {self.created_at}"

class LoginAudit(models.Model):
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('LOCKED', 'Account Locked'),
        ('EXPIRED', 'Session Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User Information
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='login_audits')
    email = models.EmailField(db_index=True)
    
    # Request Information
    ip_address = models.GenericIPAddressField(db_index=True)
    user_agent = models.TextField()
    device_type = models.CharField(max_length=50, null=True, blank=True)
    browser = models.CharField(max_length=100, null=True, blank=True)
    os = models.CharField(max_length=100, null=True, blank=True)
    
    # Status Information
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='FAILED', db_index=True)
    failure_reason = models.TextField(null=True, blank=True)
    
    # Session Information
    session_key = models.CharField(max_length=255, null=True, blank=True)
    session_duration = models.IntegerField(null=True, blank=True, help_text="Duration in seconds")
    
    # Location Information (Optional - can be populated via IP geolocation)
    location_country = models.CharField(max_length=100, null=True, blank=True)
    location_city = models.CharField(max_length=100, null=True, blank=True)
    location_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    location_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    # Timestamps
    login_time = models.DateTimeField(auto_now_add=True, db_index=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'login_audit'
        app_label = 'audit_logs'
        ordering = ['-login_time']
        indexes = [
            models.Index(fields=['email', '-login_time']),
            models.Index(fields=['ip_address', '-login_time']),
            models.Index(fields=['status', '-login_time']),
            models.Index(fields=['user', '-login_time']),
            models.Index(fields=['login_time']),
        ]
    
    def __str__(self):
        return f"Login {self.status} - {self.email} - {self.login_time}"

class DataChangeLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Change Information
    change_type = models.CharField(max_length=20, choices=[('INSERT', 'Insert'), ('UPDATE', 'Update'), ('DELETE', 'Delete')])
    model_name = models.CharField(max_length=100, db_index=True)
    record_id = models.CharField(max_length=100, db_index=True)
    
    # Data Information
    old_values = models.JSONField(default=dict, blank=True)
    new_values = models.JSONField(default=dict, blank=True)
    changed_fields = models.JSONField(default=list, blank=True)
    
    # User Information
    changed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='data_changes')
    changed_by_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Additional Info
    reason = models.TextField(null=True, blank=True)
    
    # Timestamps
    changed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'data_change_logs'
        app_label = 'audit_logs'
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['model_name', 'record_id']),
            models.Index(fields=['changed_by', '-changed_at']),
            models.Index(fields=['change_type', '-changed_at']),
            models.Index(fields=['changed_at']),
        ]
    
    def __str__(self):
        return f"{self.change_type} - {self.model_name} - {self.changed_at}"

class APIAccessLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Request Information
    method = models.CharField(max_length=10, db_index=True)
    path = models.TextField(db_index=True)
    query_params = models.JSONField(default=dict, blank=True)
    request_body = models.TextField(null=True, blank=True)
    
    # Response Information
    status_code = models.IntegerField(db_index=True)
    response_body = models.TextField(null=True, blank=True)
    response_time_ms = models.IntegerField(help_text="Response time in milliseconds")
    
    # User Information
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='api_access')
    user_ip = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    # Additional Info
    error_message = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'api_access_logs'
        app_label = 'audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['method', '-created_at']),
            models.Index(fields=['status_code', '-created_at']),
            models.Index(fields=['path']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.method} {self.path} - {self.status_code} - {self.created_at}"