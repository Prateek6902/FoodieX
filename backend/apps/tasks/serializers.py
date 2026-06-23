from rest_framework import serializers
from .models import Task, TaskComment, TaskAttachment, TaskAssignmentHistory, TaskNotification

class TaskCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'user', 'user_name', 'user_email', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = TaskAttachment
        fields = ['id', 'task', 'file', 'filename', 'file_size', 'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    is_overdue = serializers.SerializerMethodField()
    can_start = serializers.SerializerMethodField()
    depends_on_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'task_id', 'created_at', 'updated_at', 'started_at', 'completed_at']
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()
    
    def get_can_start(self, obj):
        return obj.can_start()
    
    def get_depends_on_details(self, obj):
        return [{'id': str(t.id), 'task_id': t.task_id, 'title': t.title, 'status': t.status} 
                for t in obj.depends_on.all()]

class CreateTaskSerializer(serializers.Serializer):
    task_type = serializers.ChoiceField(choices=Task.TASK_TYPES)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()  # Changed from TextField to CharField
    assigned_to = serializers.UUIDField()
    priority = serializers.ChoiceField(choices=['HIGH', 'MEDIUM', 'LOW'], default='MEDIUM')
    due_date = serializers.DateTimeField()
    depends_on = serializers.ListField(child=serializers.UUIDField(), required=False, default=list)
    metadata = serializers.DictField(required=False, default=dict)
    is_recurring = serializers.BooleanField(default=False)
    recurring_interval = serializers.IntegerField(required=False, allow_null=True)

class UpdateTaskStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'])
    result = serializers.DictField(required=False, default=dict)
    error_message = serializers.CharField(required=False, allow_null=True)

class AssignTaskSerializer(serializers.Serializer):
    assigned_to = serializers.UUIDField()
    notes = serializers.CharField(required=False, allow_null=True)

class TaskAssignmentHistorySerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True)
    
    class Meta:
        model = TaskAssignmentHistory
        fields = '__all__'
        read_only_fields = ['id', 'assigned_at']

class TaskNotificationSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = TaskNotification
        fields = '__all__'
        read_only_fields = ['id', 'created_at']