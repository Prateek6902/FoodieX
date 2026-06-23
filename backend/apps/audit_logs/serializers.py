from rest_framework import serializers
from .models import AuditLog, LoginAudit, DataChangeLog, APIAccessLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class LoginAuditSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = LoginAudit
        fields = '__all__'
        read_only_fields = ['id', 'login_time']

class DataChangeLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)
    
    class Meta:
        model = DataChangeLog
        fields = '__all__'
        read_only_fields = ['id', 'changed_at']

class APIAccessLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = APIAccessLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class AuditStatsSerializer(serializers.Serializer):
    total_actions = serializers.IntegerField()
    actions_by_type = serializers.DictField()
    actions_by_user = serializers.DictField()
    actions_by_model = serializers.DictField()
    recent_actions = serializers.ListField()