import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications"""
    
    async def connect(self):
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.group_name = f"user_{self.user.id}_notifications"
        
        # Join user's notification group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send unread notification count
        await self.send_unread_count()
    
    async def disconnect(self, close_code):
        # Leave notification group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        
        if action == 'mark_as_read':
            notification_id = text_data_json.get('notification_id')
            await self.mark_notification_read(notification_id)
            await self.send_unread_count()
        
        elif action == 'mark_all_read':
            await self.mark_all_notifications_read()
            await self.send_unread_count()
        
        elif action == 'get_unread_count':
            await self.send_unread_count()
    
    async def notification_message(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))
        
        # Send updated unread count
        await self.send_unread_count()
    
    async def send_unread_count(self):
        """Send unread notification count"""
        count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': count
        }))
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark a specific notification as read"""
        from .models import Notification
        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False
    
    @database_sync_to_async
    def mark_all_notifications_read(self):
        """Mark all notifications as read"""
        from .models import Notification
        from django.utils import timezone
        Notification.objects.filter(user=self.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
    
    @database_sync_to_async
    def get_unread_count(self):
        """Get unread notification count"""
        from .models import Notification
        return Notification.objects.filter(user=self.user, is_read=False).count()