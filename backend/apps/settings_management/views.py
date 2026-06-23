from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import SystemSettings, NotificationSettings
from .serializers import SystemSettingsSerializer, NotificationSettingsSerializer, UpdateNotificationSettingsSerializer
from core.permissions.role_permissions import IsAdmin, IsSuperAdmin

class SystemSettingsView(APIView):
    """Get/Update system settings (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        settings = SystemSettings.objects.first()
        if not settings:
            settings = SystemSettings.objects.create()
        
        serializer = SystemSettingsSerializer(settings)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def put(self, request):
        settings = SystemSettings.objects.first()
        if not settings:
            settings = SystemSettings.objects.create()
        
        serializer = SystemSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Settings updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class NotificationSettingsView(APIView):
    """Get/Update notification settings for current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        settings, created = NotificationSettings.objects.get_or_create(user=request.user)
        serializer = NotificationSettingsSerializer(settings)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def put(self, request):
        settings, created = NotificationSettings.objects.get_or_create(user=request.user)
        serializer = UpdateNotificationSettingsSerializer(data=request.data)
        
        if serializer.is_valid():
            for key, value in serializer.validated_data.items():
                setattr(settings, key, value)
            settings.save()
            
            return Response({
                'success': True,
                'message': 'Notification settings updated successfully',
                'data': NotificationSettingsSerializer(settings).data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)