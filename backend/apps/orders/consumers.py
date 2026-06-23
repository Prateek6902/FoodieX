import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.shortcuts import get_object_or_404
from .models import Order, OrderTracking

class OrderTrackingConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time order tracking"""
    
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs'].get('order_id')
        self.order_group_name = f'order_{self.order_id}'
        
        # Check if user is authenticated
        if not self.scope['user'].is_authenticated:
            await self.close()
            return
        
        # Check if user has permission to track this order
        user = self.scope['user']
        has_permission = await self.check_order_permission(user, self.order_id)
        
        if not has_permission:
            await self.close()
            return
        
        # Join order group
        await self.channel_layer.group_add(
            self.order_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send current order status
        await self.send_current_status()
    
    async def disconnect(self, close_code):
        # Leave order group
        await self.channel_layer.group_discard(
            self.order_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        
        if message_type == 'get_status':
            await self.send_current_status()
        elif message_type == 'track_location':
            await self.update_delivery_location(text_data_json)
    
    async def order_status_update(self, event):
        """Send order status update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'status': event['status'],
            'order_id': event['order_id'],
            'timestamp': event['timestamp'],
            'message': event.get('message', '')
        }))
    
    async def delivery_location_update(self, event):
        """Send delivery location update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'latitude': event['latitude'],
            'longitude': event['longitude'],
            'timestamp': event['timestamp']
        }))
    
    async def send_current_status(self):
        """Send current order status to the client"""
        order_data = await self.get_order_data()
        if order_data:
            await self.send(text_data=json.dumps({
                'type': 'current_status',
                'data': order_data
            }))
    
    async def update_delivery_location(self, data):
        """Update delivery partner's current location"""
        user = self.scope['user']
        if user.role == 'DELIVERY_PARTNER':
            latitude = data.get('latitude')
            longitude = data.get('longitude')
            
            # Store in cache or database
            from django.core.cache import cache
            cache.set(f'delivery_location_{self.order_id}', {
                'latitude': latitude,
                'longitude': longitude,
                'updated_at': str(timezone.now())
            }, timeout=300)
            
            # Broadcast to all clients in the group
            await self.channel_layer.group_send(
                self.order_group_name,
                {
                    'type': 'delivery_location_update',
                    'latitude': latitude,
                    'longitude': longitude,
                    'timestamp': str(timezone.now())
                }
            )
    
    @database_sync_to_async
    def check_order_permission(self, user, order_id):
        """Check if user has permission to track this order"""
        try:
            order = Order.objects.get(id=order_id)
            if user.role in ['SUPER_ADMIN', 'ADMIN']:
                return True
            if user.role == 'CUSTOMER' and order.customer == user:
                return True
            if user.role == 'VENDOR' and order.vendor.user == user:
                return True
            if user.role == 'DELIVERY_PARTNER' and order.delivery_partner == user:
                return True
            return False
        except Order.DoesNotExist:
            return False
    
    @database_sync_to_async
    def get_order_data(self):
        """Get order data from database"""
        try:
            order = Order.objects.select_related('customer', 'vendor', 'restaurant', 'delivery_partner').get(id=self.order_id)
            
            # Get tracking history
            tracking = OrderTracking.objects.filter(order=order).order_by('-created_at')[:10]
            
            # Get delivery location from cache
            from django.core.cache import cache
            delivery_location = cache.get(f'delivery_location_{self.order_id}')
            
            return {
                'order_id': str(order.id),
                'order_number': order.order_number,
                'status': order.status,
                'customer_name': order.customer.full_name,
                'vendor_name': order.vendor.business_name,
                'restaurant_name': order.restaurant.name,
                'delivery_address': order.delivery_address,
                'total_amount': float(order.total_amount),
                'created_at': str(order.created_at),
                'estimated_delivery_time': str(order.estimated_delivery_time) if order.estimated_delivery_time else None,
                'delivered_at': str(order.delivered_at) if order.delivered_at else None,
                'delivery_location': delivery_location,
                'tracking_history': [
                    {
                        'status': t.status,
                        'notes': t.notes,
                        'created_at': str(t.created_at)
                    }
                    for t in tracking
                ]
            }
        except Order.DoesNotExist:
            return None