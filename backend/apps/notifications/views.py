from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification, NotificationTemplate, EmailLog
from .serializers import (
    NotificationSerializer, NotificationTemplateSerializer,
    MarkNotificationReadSerializer, SendNotificationSerializer
)
from core.permissions.role_permissions import IsAdmin, IsSuperAdmin

class NotificationListView(APIView):
    """Get all notifications for the current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user,
            is_deleted=False
        ).order_by('-created_at')
        
        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        total = notifications.count()
        notifications = notifications[offset:offset + limit]
        
        serializer = NotificationSerializer(notifications, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'data': serializer.data
        })

class UnreadNotificationCountView(APIView):
    """Get unread notification count"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False,
            is_deleted=False
        ).count()
        
        return Response({
            'success': True,
            'unread_count': count
        })

class MarkNotificationReadView(APIView):
    """Mark notifications as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = MarkNotificationReadSerializer(data=request.data)
        if serializer.is_valid():
            if serializer.validated_data.get('mark_all'):
                # Mark all as read
                Notification.objects.filter(
                    user=request.user,
                    is_read=False,
                    is_deleted=False
                ).update(is_read=True, read_at=timezone.now())
            else:
                # Mark specific notifications as read
                notification_ids = serializer.validated_data.get('notification_ids', [])
                Notification.objects.filter(
                    id__in=notification_ids,
                    user=request.user
                ).update(is_read=True, read_at=timezone.now())
            
            return Response({
                'success': True,
                'message': 'Notifications marked as read'
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class DeleteNotificationView(APIView):
    """Delete a notification"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, notification_id):
        notification = get_object_or_404(Notification, id=notification_id, user=request.user)
        notification.is_deleted = True
        notification.save()
        
        return Response({
            'success': True,
            'message': 'Notification deleted successfully'
        })

class SendNotificationView(APIView):
    """Send notification to users (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def post(self, request):
        serializer = SendNotificationSerializer(data=request.data)
        if serializer.is_valid():
            from apps.users.models import User
            
            # Get target users
            user_ids = serializer.validated_data.get('user_ids')
            role = serializer.validated_data.get('role')
            
            if user_ids:
                users = User.objects.filter(id__in=user_ids, is_active=True)
            elif role:
                users = User.objects.filter(role=role, is_active=True)
            else:
                users = User.objects.filter(is_active=True)
            
            # Create notifications
            notifications = []
            for user in users:
                notification = Notification.objects.create(
                    user=user,
                    title=serializer.validated_data['title'],
                    message=serializer.validated_data['message'],
                    notification_type=serializer.validated_data['notification_type'],
                    priority=serializer.validated_data.get('priority', 'MEDIUM'),
                    metadata=serializer.validated_data.get('metadata', {})
                )
                notifications.append(notification)
            
            return Response({
                'success': True,
                'message': f'Notification sent to {len(notifications)} users',
                'count': len(notifications)
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class NotificationPreferencesView(APIView):
    """Get/Update notification preferences for the current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # You can store preferences in User model or separate model
        preferences = getattr(request.user, 'notification_preferences', {
            'ORDER_UPDATE': True,
            'PROMOTION': True,
            'SYSTEM': True,
            'DELIVERY': True,
            'PAYMENT': True,
            'SUPPORT': True,
            'CHAT': True,
            'REVIEW': True,
            'email_notifications': True,
            'push_notifications': True,
        })
        
        return Response({
            'success': True,
            'data': preferences
        })
    
    def put(self, request):
        # Update preferences
        preferences = request.data
        # In production, store in User model or separate Preferences model
        request.user.notification_preferences = preferences
        request.user.save()
        
        return Response({
            'success': True,
            'message': 'Preferences updated successfully'
        })

class NotificationTemplateListView(APIView):
    """List notification templates (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        templates = NotificationTemplate.objects.filter(is_active=True)
        serializer = NotificationTemplateSerializer(templates, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def post(self, request):
        serializer = NotificationTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Template created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class NotificationTemplateDetailView(APIView):
    """Get, update, delete notification template (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request, template_id):
        template = get_object_or_404(NotificationTemplate, id=template_id)
        serializer = NotificationTemplateSerializer(template)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def put(self, request, template_id):
        template = get_object_or_404(NotificationTemplate, id=template_id)
        serializer = NotificationTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Template updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, template_id):
        template = get_object_or_404(NotificationTemplate, id=template_id)
        template.is_active = False
        template.save()
        
        return Response({
            'success': True,
            'message': 'Template deleted successfully'
        })