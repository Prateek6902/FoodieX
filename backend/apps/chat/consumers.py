import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMessage
from django.utils import timezone

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Check if user has access to this room
        user = self.scope['user']
        if not user.is_authenticated:
            await self.close()
            return
        
        has_access = await self.check_room_access(user, self.room_id)
        if not has_access:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Mark user as online
        await self.mark_user_online(user, self.room_id)
        
        # Send online status
        await self.send_online_status()
    
    async def disconnect(self, close_code):
        # Mark user as offline
        user = self.scope['user']
        await self.mark_user_offline(user, self.room_id)
        
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'message')
        
        if message_type == 'message':
            await self.handle_message(text_data_json)
        elif message_type == 'typing':
            await self.handle_typing(text_data_json)
        elif message_type == 'read_receipt':
            await self.handle_read_receipt(text_data_json)
    
    async def handle_message(self, data):
        message = data['message']
        user = self.scope['user']
        
        # Save message to database
        saved_message = await self.save_message(
            room_id=self.room_id,
            sender=user,
            message=message
        )
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': str(user.id),
                'sender_name': user.full_name,
                'timestamp': str(timezone.now()),
                'message_id': str(saved_message['id'])
            }
        )
    
    async def handle_typing(self, data):
        user = self.scope['user']
        is_typing = data.get('is_typing', False)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': str(user.id),
                'user_name': user.full_name,
                'is_typing': is_typing
            }
        )
    
    async def handle_read_receipt(self, data):
        message_id = data.get('message_id')
        user = self.scope['user']
        
        await self.mark_message_read(message_id, user)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'read_receipt',
                'message_id': message_id,
                'user_id': str(user.id),
                'read_at': str(timezone.now())
            }
        )
    
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'timestamp': event['timestamp'],
            'message_id': event['message_id']
        }))
    
    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'user_name': event['user_name'],
            'is_typing': event['is_typing']
        }))
    
    async def read_receipt(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'read_at': event['read_at']
        }))
    
    async def online_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'online_status',
            'online_users': event['online_users']
        }))
    
    async def send_online_status(self):
        online_users = await self.get_online_users(self.room_id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'online_status',
                'online_users': online_users
            }
        )
    
    @database_sync_to_async
    def check_room_access(self, user, room_id):
        try:
            room = ChatRoom.objects.get(id=room_id)
            return user in room.participants.all()
        except ChatRoom.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, room_id, sender, message):
        room = ChatRoom.objects.get(id=room_id)
        chat_message = ChatMessage.objects.create(
            room=room,
            sender=sender,
            message=message
        )
        return {'id': chat_message.id}
    
    @database_sync_to_async
    def mark_message_read(self, message_id, user):
        message = ChatMessage.objects.get(id=message_id)
        message.read_by.add(user)
        message.save()
    
    @database_sync_to_async
    def mark_user_online(self, user, room_id):
        # Implement using Redis or cache
        pass
    
    @database_sync_to_async
    def mark_user_offline(self, user, room_id):
        # Implement using Redis or cache
        pass
    
    @database_sync_to_async
    def get_online_users(self, room_id):
        # Implement using Redis or cache
        return []