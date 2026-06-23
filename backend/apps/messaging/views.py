from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import Message, MessageAttachment, BroadcastMessage
from .serializers import (
    MessageSerializer, SendMessageSerializer, 
    BroadcastMessageSerializer, SendBroadcastSerializer
)
from core.permissions.role_permissions import IsAdmin, IsSuperAdmin

class InboxView(APIView):
    """Get received messages for current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        messages = Message.objects.filter(
            recipient=request.user,
            is_deleted_by_recipient=False
        ).order_by('-created_at')
        
        # Filter by read status
        is_read = request.query_params.get('is_read')
        if is_read is not None:
            messages = messages.filter(is_read=is_read.lower() == 'true')
        
        # Filter by message type
        message_type = request.query_params.get('message_type')
        if message_type:
            messages = messages.filter(message_type=message_type)
        
        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        total = messages.count()
        messages = messages[offset:offset + limit]
        
        serializer = MessageSerializer(messages, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'unread_count': Message.objects.filter(recipient=request.user, is_read=False).count(),
            'data': serializer.data
        })

class SentMessagesView(APIView):
    """Get sent messages by current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        messages = Message.objects.filter(
            sender=request.user,
            is_deleted_by_sender=False
        ).order_by('-created_at')
        
        serializer = MessageSerializer(messages, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class SendMessageView(APIView):
    """Send a message to another user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        if serializer.is_valid():
            from apps.users.models import User
            recipient = get_object_or_404(User, id=serializer.validated_data['recipient_id'])
            
            message = Message.objects.create(
                sender=request.user,
                recipient=recipient,
                subject=serializer.validated_data['subject'],
                body=serializer.validated_data['body'],
                message_type=serializer.validated_data.get('message_type', 'SYSTEM'),
                metadata=serializer.validated_data.get('metadata', {})
            )
            
            # Create notification for recipient
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=recipient,
                title=f"New message from {request.user.full_name}",
                message=serializer.validated_data['subject'],
                notification_type='CHAT',
                metadata={'message_id': str(message.id)}
            )
            
            message_serializer = MessageSerializer(message)
            return Response({
                'success': True,
                'message': 'Message sent successfully',
                'data': message_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class MessageDetailView(APIView):
    """Get message details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, message_id):
        message = get_object_or_404(Message, id=message_id)
        
        # Check permission
        if message.sender != request.user and message.recipient != request.user:
            return Response({
                'success': False,
                'message': 'You don\'t have permission to view this message'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Mark as read if recipient is viewing
        if message.recipient == request.user and not message.is_read:
            message.mark_as_read()
        
        serializer = MessageSerializer(message)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def delete(self, request, message_id):
        message = get_object_or_404(Message, id=message_id)
        
        if message.sender == request.user:
            message.is_deleted_by_sender = True
        elif message.recipient == request.user:
            message.is_deleted_by_recipient = True
        else:
            return Response({
                'success': False,
                'message': 'You don\'t have permission to delete this message'
            }, status=status.HTTP_403_FORBIDDEN)
        
        message.save()
        
        return Response({
            'success': True,
            'message': 'Message deleted successfully'
        })

class MarkMessageReadView(APIView):
    """Mark a message as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, message_id):
        message = get_object_or_404(Message, id=message_id, recipient=request.user)
        message.mark_as_read()
        
        return Response({
            'success': True,
            'message': 'Message marked as read'
        })

class MarkAllMessagesReadView(APIView):
    """Mark all messages as read"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        Message.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'success': True,
            'message': 'All messages marked as read'
        })

class UnreadCountView(APIView):
    """Get unread message count"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        count = Message.objects.filter(recipient=request.user, is_read=False).count()
        return Response({
            'success': True,
            'unread_count': count
        })

class BroadcastMessageView(APIView):
    """Send broadcast message to multiple users (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def post(self, request):
        serializer = SendBroadcastSerializer(data=request.data)
        if serializer.is_valid():
            from apps.users.models import User
            
            # Get recipients based on roles
            roles = serializer.validated_data['recipient_roles']
            recipients = User.objects.filter(role__in=roles, is_active=True)
            
            # Create broadcast record
            broadcast = BroadcastMessage.objects.create(
                sender=request.user,
                subject=serializer.validated_data['subject'],
                body=serializer.validated_data['body'],
                recipient_roles=roles,
                total_recipients=recipients.count()
            )
            
            # Create individual messages
            messages_created = 0
            for recipient in recipients:
                Message.objects.create(
                    sender=request.user,
                    recipient=recipient,
                    subject=serializer.validated_data['subject'],
                    body=serializer.validated_data['body'],
                    message_type='SYSTEM'
                )
                messages_created += 1
            
            broadcast.is_sent = True
            broadcast.sent_at = timezone.now()
            broadcast.save()
            
            return Response({
                'success': True,
                'message': f'Broadcast sent to {messages_created} users',
                'data': BroadcastMessageSerializer(broadcast).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        """Get broadcast history"""
        broadcasts = BroadcastMessage.objects.all().order_by('-created_at')
        serializer = BroadcastMessageSerializer(broadcasts, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })