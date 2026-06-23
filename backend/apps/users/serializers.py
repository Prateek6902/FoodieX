from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import LoginHistory

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'middle_name', 'last_name',
            'full_name', 'mobile_number', 'profile_picture', 'role', 
            'is_active', 'is_verified', 'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login']
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def update(self, instance, validated_data):
        # Don't allow updating sensitive fields
        validated_data.pop('email', None)
        validated_data.pop('username', None)
        validated_data.pop('role', None)
        
        return super().update(instance, validated_data)

class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = [
            'id', 'ip_address', 'user_agent', 'device_type',
            'browser', 'os', 'login_time', 'logout_time', 
            'is_successful', 'failure_reason'
        ]
        read_only_fields = '__all__'