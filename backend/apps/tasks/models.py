import uuid
from django.db import models
from django.utils import timezone
from core.constants.constants import TASK_PRIORITY, TASK_STATUS

class Task(models.Model):
    TASK_TYPES = [
        ('ORDER_PROCESSING', 'Order Processing'),
        ('DELIVERY_ASSIGNMENT', 'Delivery Assignment'),
        ('VENDOR_VERIFICATION', 'Vendor Verification'),
        ('RESTAURANT_APPROVAL', 'Restaurant Approval'),
        ('PAYMENT_PROCESSING', 'Payment Processing'),
        ('REFUND_PROCESSING', 'Refund Processing'),
        ('SUPPORT_TICKET', 'Support Ticket'),
        ('REPORT_GENERATION', 'Report Generation'),
        ('DATA_SYNC', 'Data Sync'),
        ('SYSTEM_MAINTENANCE', 'System Maintenance'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task_id = models.CharField(max_length=100, unique=True, db_index=True)
    task_type = models.CharField(max_length=30, choices=TASK_TYPES, db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Assignment
    assigned_to = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='assigned_tasks')
    assigned_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_tasks', null=True)
    
    # Status and Priority
    status = models.CharField(max_length=20, choices=TASK_STATUS, default='PENDING', db_index=True)
    priority = models.CharField(max_length=10, choices=TASK_PRIORITY, default='MEDIUM', db_index=True)
    
    # Dates
    due_date = models.DateTimeField()
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional Info
    metadata = models.JSONField(default=dict, blank=True)
    result = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(null=True, blank=True)
    
    # Dependencies
    depends_on = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='dependent_tasks')
    
    # Recurring
    is_recurring = models.BooleanField(default=False)
    recurring_interval = models.IntegerField(null=True, blank=True, help_text="Interval in days")
    next_run_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'tasks'
        ordering = ['-priority', 'due_date']
        indexes = [
            models.Index(fields=['task_id']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['due_date']),
            models.Index(fields=['task_type', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.task_id} - {self.title}"
    
    def is_overdue(self):
        return self.due_date < timezone.now() and self.status not in ['COMPLETED', 'CANCELLED']
    
    def can_start(self):
        # Check if all dependencies are completed
        for dependency in self.depends_on.all():
            if dependency.status != 'COMPLETED':
                return False
        return True

class TaskComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'task_comments'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment on {self.task.task_id} by {self.user.email}"

class TaskAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='task_attachments/')
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField()
    uploaded_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'task_attachments'
    
    def __str__(self):
        return self.filename

class TaskAssignmentHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='assignment_history')
    assigned_to = models.ForeignKey('users.User', on_delete=models.CASCADE)
    assigned_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='task_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'task_assignment_history'
        ordering = ['-assigned_at']

class TaskNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notifications')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=50, choices=[
        ('ASSIGNED', 'Assigned'),
        ('UPDATED', 'Updated'),
        ('COMPLETED', 'Completed'),
        ('OVERDUE', 'Overdue'),
        ('COMMENT', 'Comment Added'),
    ])
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'task_notifications'
        ordering = ['-created_at']