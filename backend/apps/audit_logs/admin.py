from django.contrib import admin
from .models import AuditLog, LoginAudit, DataChangeLog, APIAccessLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'user_email', 'action', 'model_name', 'object_repr']
    list_filter = ['action', 'model_name', 'created_at']
    search_fields = ['user_email', 'object_repr', 'object_id']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'

@admin.register(LoginAudit)
class LoginAuditAdmin(admin.ModelAdmin):
    list_display = ['login_time', 'email', 'status', 'ip_address', 'device_type']
    list_filter = ['status', 'login_time', 'device_type']
    search_fields = ['email', 'ip_address']
    readonly_fields = ['id', 'login_time']
    date_hierarchy = 'login_time'

@admin.register(DataChangeLog)
class DataChangeLogAdmin(admin.ModelAdmin):
    list_display = ['changed_at', 'change_type', 'model_name', 'record_id', 'changed_by']
    list_filter = ['change_type', 'model_name', 'changed_at']
    search_fields = ['model_name', 'record_id']
    readonly_fields = ['id', 'changed_at']
    date_hierarchy = 'changed_at'

@admin.register(APIAccessLog)
class APIAccessLogAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'method', 'path', 'status_code', 'user', 'response_time_ms']
    list_filter = ['method', 'status_code', 'created_at']
    search_fields = ['path', 'user__email']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'