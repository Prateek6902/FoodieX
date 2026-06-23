from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import AuditLog, LoginAudit, DataChangeLog, APIAccessLog
from .serializers import (
    AuditLogSerializer, LoginAuditSerializer, 
    DataChangeLogSerializer, APIAccessLogSerializer
)
from core.permissions.role_permissions import IsAdmin, IsSuperAdmin

class AuditLogListView(APIView):
    """List all audit logs (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        logs = AuditLog.objects.all().select_related('user')
        
        # Filter by user
        user_id = request.query_params.get('user_id')
        if user_id:
            logs = logs.filter(user_id=user_id)
        
        # Filter by action
        action = request.query_params.get('action')
        if action:
            logs = logs.filter(action=action)
        
        # Filter by model
        model_name = request.query_params.get('model_name')
        if model_name:
            logs = logs.filter(model_name=model_name)
        
        # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            logs = logs.filter(created_at__date__gte=start_date)
        if end_date:
            logs = logs.filter(created_at__date__lte=end_date)
        
        # Pagination
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        total = logs.count()
        logs = logs[offset:offset + limit]
        
        serializer = AuditLogSerializer(logs, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'data': serializer.data
        })

class LoginAuditListView(APIView):
    """List all login attempts (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        logs = LoginAudit.objects.all().select_related('user')
        
        # Filter by email
        email = request.query_params.get('email')
        if email:
            logs = logs.filter(email__icontains=email)
        
        # Filter by status
        status = request.query_params.get('status')
        if status:
            logs = logs.filter(status=status)
        
        # Filter by IP
        ip_address = request.query_params.get('ip_address')
        if ip_address:
            logs = logs.filter(ip_address=ip_address)
        
        # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            logs = logs.filter(login_time__date__gte=start_date)
        if end_date:
            logs = logs.filter(login_time__date__lte=end_date)
        
        # Pagination
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        total = logs.count()
        logs = logs[offset:offset + limit]
        
        serializer = LoginAuditSerializer(logs, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'data': serializer.data
        })

class DataChangeLogListView(APIView):
    """List all data changes (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        logs = DataChangeLog.objects.all().select_related('changed_by')
        
        # Filter by model
        model_name = request.query_params.get('model_name')
        if model_name:
            logs = logs.filter(model_name=model_name)
        
        # Filter by change type
        change_type = request.query_params.get('change_type')
        if change_type:
            logs = logs.filter(change_type=change_type)
        
        # Filter by user
        user_id = request.query_params.get('user_id')
        if user_id:
            logs = logs.filter(changed_by_id=user_id)
        
        # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            logs = logs.filter(changed_at__date__gte=start_date)
        if end_date:
            logs = logs.filter(changed_at__date__lte=end_date)
        
        # Pagination
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        total = logs.count()
        logs = logs[offset:offset + limit]
        
        serializer = DataChangeLogSerializer(logs, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'data': serializer.data
        })

class APIAccessLogListView(APIView):
    """List all API access logs (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        logs = APIAccessLog.objects.all().select_related('user')
        
        # Filter by method
        method = request.query_params.get('method')
        if method:
            logs = logs.filter(method=method)
        
        # Filter by status code
        status_code = request.query_params.get('status_code')
        if status_code:
            logs = logs.filter(status_code=status_code)
        
        # Filter by user
        user_id = request.query_params.get('user_id')
        if user_id:
            logs = logs.filter(user_id=user_id)
        
        # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            logs = logs.filter(created_at__date__gte=start_date)
        if end_date:
            logs = logs.filter(created_at__date__lte=end_date)
        
        # Pagination
        limit = int(request.query_params.get('limit', 100))
        offset = int(request.query_params.get('offset', 0))
        total = logs.count()
        logs = logs[offset:offset + limit]
        
        serializer = APIAccessLogSerializer(logs, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'data': serializer.data
        })

class MyActivityLogView(APIView):
    """Get current user's activity logs"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        logs = AuditLog.objects.filter(user=request.user).order_by('-created_at')
        
        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        total = logs.count()
        logs = logs[offset:offset + limit]
        
        serializer = AuditLogSerializer(logs, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'data': serializer.data
        })

class MyLoginHistoryView(APIView):
    """Get current user's login history"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        logs = LoginAudit.objects.filter(user=request.user).order_by('-login_time')
        
        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        total = logs.count()
        logs = logs[offset:offset + limit]
        
        serializer = LoginAuditSerializer(logs, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'data': serializer.data
        })

class AuditStatsView(APIView):
    """Get audit statistics (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        period = request.query_params.get('period', 'today')
        
        if period == 'today':
            start_date = timezone.now().date()
        elif period == 'week':
            start_date = timezone.now().date() - timedelta(days=7)
        elif period == 'month':
            start_date = timezone.now().date() - timedelta(days=30)
        else:
            start_date = timezone.now().date() - timedelta(days=365)
        
        logs = AuditLog.objects.filter(created_at__date__gte=start_date)
        
        # Total actions
        total_actions = logs.count()
        
        # Actions by type
        actions_by_type = dict(logs.values('action').annotate(count=Count('id')))
        
        # Actions by user
        actions_by_user = dict(logs.values('user__email').annotate(count=Count('id')))
        
        # Actions by model
        actions_by_model = dict(logs.values('model_name').annotate(count=Count('id')))
        
        # Login statistics
        login_stats = LoginAudit.objects.filter(login_time__date__gte=start_date).values('status').annotate(count=Count('id'))
        
        # API statistics
        api_stats = APIAccessLog.objects.filter(created_at__date__gte=start_date).values('status_code').annotate(count=Count('id'))
        
        return Response({
            'success': True,
            'data': {
                'period': period,
                'total_actions': total_actions,
                'actions_by_type': actions_by_type,
                'actions_by_user': dict(list(actions_by_user.items())[:10]),
                'actions_by_model': actions_by_model,
                'login_statistics': list(login_stats),
                'api_statistics': list(api_stats),
                'recent_actions': AuditLogSerializer(logs[:20], many=True).data
            }
        })

class UserAuditDetailView(APIView):
    """Get detailed audit for a specific user (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request, user_id):
        from apps.users.models import User
        
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all logs for this user
        audit_logs = AuditLog.objects.filter(user=user).order_by('-created_at')[:100]
        login_logs = LoginAudit.objects.filter(user=user).order_by('-login_time')[:50]
        api_logs = APIAccessLog.objects.filter(user=user).order_by('-created_at')[:100]
        
        # Get statistics
        total_logins = login_logs.count()
        failed_logins = login_logs.filter(status='FAILED').count()
        total_actions = audit_logs.count()
        
        return Response({
            'success': True,
            'data': {
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.full_name,
                    'role': user.role,
                    'last_login': user.last_login
                },
                'statistics': {
                    'total_logins': total_logins,
                    'failed_logins': failed_logins,
                    'total_actions': total_actions
                },
                'recent_audit_logs': AuditLogSerializer(audit_logs, many=True).data,
                'recent_login_logs': LoginAuditSerializer(login_logs, many=True).data,
                'recent_api_logs': APIAccessLogSerializer(api_logs, many=True).data
            }
        })

class ExportAuditLogsView(APIView):
    """Export audit logs (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        import csv
        from django.http import HttpResponse
        
        # Get filter parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        model_name = request.query_params.get('model_name')
        
        logs = AuditLog.objects.all().select_related('user')
        
        if start_date:
            logs = logs.filter(created_at__date__gte=start_date)
        if end_date:
            logs = logs.filter(created_at__date__lte=end_date)
        if model_name:
            logs = logs.filter(model_name=model_name)
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="audit_logs_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Timestamp', 'User Email', 'Action', 'Model', 'Object ID', 'Object Name', 'IP Address', 'Details'])
        
        for log in logs:
            writer.writerow([
                log.created_at,
                log.user_email or 'Anonymous',
                log.action,
                log.model_name,
                log.object_id,
                log.object_repr,
                log.user_ip,
                log.message or ''
            ])
        
        return response