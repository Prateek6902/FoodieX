from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import ChatRoom, ChatMessage, ChatParticipant
from .serializers import (
    ChatRoomSerializer, ChatMessageSerializer, 
    CreateChatRoomSerializer, SendMessageSerializer
)

class ChatRoomListView(APIView):
    """Get all chat rooms for the current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        rooms = ChatRoom.objects.filter(
            participants=request.user,
            is_active=True
        ).order_by('-updated_at')
        
        serializer = ChatRoomSerializer(rooms, many=True, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data
        })

class CreateChatRoomView(APIView):
    """Create a new chat room"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreateChatRoomSerializer(data=request.data)
        if serializer.is_valid():
            participant_ids = serializer.validated_data['participant_ids']
            room_type = serializer.validated_data['room_type']
            room_name = serializer.validated_data.get('room_name')
            
            # Add current user to participants
            if request.user.id not in participant_ids:
                participant_ids.append(request.user.id)
            
            # Check if room already exists for private chat
            if room_type in ['CUSTOMER_VENDOR', 'CUSTOMER_DELIVERY', 'ADMIN_USER'] and len(participant_ids) == 2:
                existing_room = ChatRoom.objects.filter(
                    room_type=room_type,
                    participants__in=participant_ids,
                    is_active=True
                ).distinct()
                
                if existing_room.count() == len(participant_ids):
                    room = existing_room.first()
                    serializer = ChatRoomSerializer(room, context={'request': request})
                    return Response({
                        'success': True,
                        'message': 'Existing chat room found',
                        'data': serializer.data
                    })
            
            # Create new room
            if not room_name:
                room_name = f"chat_{timezone.now().timestamp()}"
            
            room = ChatRoom.objects.create(
                room_name=room_name,
                room_type=room_type,
                created_by=request.user
            )
            room.participants.add(*participant_ids)
            
            # Create participant entries
            for participant_id in participant_ids:
                from apps.users.models import User
                user = User.objects.get(id=participant_id)
                ChatParticipant.objects.get_or_create(room=room, user=user)
            
            room_serializer = ChatRoomSerializer(room, context={'request': request})
            return Response({
                'success': True,
                'message': 'Chat room created successfully',
                'data': room_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ChatRoomDetailView(APIView):
    """Get details of a specific chat room"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id, is_active=True)
        
        # Check if user is participant
        if request.user not in room.participants.all():
            return Response({
                'success': False,
                'message': 'You are not a participant in this chat'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ChatRoomSerializer(room, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data
        })

class ChatMessageListView(APIView):
    """Get messages for a chat room"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id, is_active=True)
        
        # Check if user is participant
        if request.user not in room.participants.all():
            return Response({
                'success': False,
                'message': 'You are not a participant in this chat'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get messages
        messages = room.messages.filter(is_deleted=False).select_related('sender')
        
        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        messages = messages[offset:offset + limit]
        
        # Mark messages as read
        unread_messages = messages.exclude(sender=request.user, is_read=True)
        for msg in unread_messages:
            msg.is_read = True
            msg.read_by.add(request.user)
        if unread_messages:
            ChatMessage.objects.filter(id__in=[m.id for m in unread_messages]).update(is_read=True)
        
        # Update participant last_read
        ChatParticipant.objects.filter(room=room, user=request.user).update(
            last_read_at=timezone.now()
        )
        
        serializer = ChatMessageSerializer(messages, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class SendMessageView(APIView):
    """Send a message to a chat room"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id, is_active=True)
        
        # Check if user is participant
        if request.user not in room.participants.all():
            return Response({
                'success': False,
                'message': 'You are not a participant in this chat'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = SendMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = ChatMessage.objects.create(
                room=room,
                sender=request.user,
                message_type=serializer.validated_data['message_type'],
                message=serializer.validated_data.get('message', ''),
                file_url=serializer.validated_data.get('file_url')
            )
            
            # Update room updated_at
            room.updated_at = timezone.now()
            room.save()
            
            message_serializer = ChatMessageSerializer(message)
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

class MarkMessagesReadView(APIView):
    """Mark messages as read in a chat room"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Mark all unread messages as read
        room.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        
        # Update participant last_read
        ChatParticipant.objects.filter(room=room, user=request.user).update(
            last_read_at=timezone.now()
        )
        
        return Response({
            'success': True,
            'message': 'Messages marked as read'
        })

class TypingIndicatorView(APIView):
    """Update typing status in a chat room"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, room_id):
        room = get_object_or_404(ChatRoom, id=room_id)
        is_typing = request.data.get('is_typing', False)
        
        ChatParticipant.objects.filter(room=room, user=request.user).update(
            is_typing=is_typing,
            typing_updated_at=timezone.now()
        )
        
        return Response({
            'success': True,
            'message': 'Typing status updated'
        })

class UnreadCountView(APIView):
    """Get unread message count for user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        unread_count = ChatMessage.objects.filter(
            room__participants=request.user,
            is_read=False,
            is_deleted=False
        ).exclude(sender=request.user).count()
        
        return Response({
            'success': True,
            'unread_count': unread_count
        })