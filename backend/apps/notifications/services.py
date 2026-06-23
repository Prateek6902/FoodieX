from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification, EmailLog

class NotificationService:
    
    @staticmethod
    def send_notification(user, title, message, notification_type, metadata=None):
        """Send real-time notification to user"""
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            type=notification_type,
            metadata=metadata or {}
        )
        
        # Send via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}_notifications",
            {
                'type': 'notification_message',
                'notification': {
                    'id': str(notification.id),
                    'title': title,
                    'message': message,
                    'type': notification_type,
                    'created_at': str(notification.created_at)
                }
            }
        )
        
        return notification
    
    @staticmethod
    def send_email_notification(to_email, subject, template, context):
        """Send email notification"""
        try:
            html_message = render_to_string(f'emails/{template}.html', context)
            plain_message = render_to_string(f'emails/{template}.txt', context)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=None,
                recipient_list=[to_email],
                html_message=html_message,
                fail_silently=False
            )
            
            EmailLog.objects.create(
                to_email=to_email,
                subject=subject,
                template_name=template,
                status='SENT'
            )
            return True
        except Exception as e:
            EmailLog.objects.create(
                to_email=to_email,
                subject=subject,
                template_name=template,
                status='FAILED',
                error_message=str(e)
            )
            return False
    
    @staticmethod
    def send_order_notification(order, event_type):
        """Send order-related notifications"""
        notifications = {
            'NEW_ORDER': {
                'title': 'New Order Received',
                'message': f'New order #{order.order_number} has been placed',
                'type': 'ORDER_UPDATE'
            },
            'ORDER_ACCEPTED': {
                'title': 'Order Accepted',
                'message': f'Your order #{order.order_number} has been accepted',
                'type': 'ORDER_UPDATE'
            },
            'ORDER_PREPARING': {
                'title': 'Order Being Prepared',
                'message': f'Your order #{order.order_number} is being prepared',
                'type': 'ORDER_UPDATE'
            },
            'ORDER_READY': {
                'title': 'Order Ready for Pickup',
                'message': f'Your order #{order.order_number} is ready',
                'type': 'ORDER_UPDATE'
            },
            'ORDER_OUT_FOR_DELIVERY': {
                'title': 'Order Out for Delivery',
                'message': f'Your order #{order.order_number} is out for delivery',
                'type': 'ORDER_UPDATE'
            },
            'ORDER_DELIVERED': {
                'title': 'Order Delivered',
                'message': f'Your order #{order.order_number} has been delivered',
                'type': 'ORDER_UPDATE'
            },
            'ORDER_CANCELLED': {
                'title': 'Order Cancelled',
                'message': f'Your order #{order.order_number} has been cancelled',
                'type': 'ORDER_UPDATE'
            }
        }
        
        notification_info = notifications.get(event_type)
        if notification_info:
            # Send to customer
            NotificationService.send_notification(
                user=order.customer,
                title=notification_info['title'],
                message=notification_info['message'],
                notification_type=notification_info['type'],
                metadata={'order_id': str(order.id)}
            )
            
            # Send to vendor
            NotificationService.send_notification(
                user=order.vendor.user,
                title=notification_info['title'],
                message=f"Order #{order.order_number} - {notification_info['message']}",
                notification_type=notification_info['type'],
                metadata={'order_id': str(order.id)}
            )
            
            # Send email for important events
            if event_type in ['NEW_ORDER', 'ORDER_DELIVERED', 'ORDER_CANCELLED']:
                NotificationService.send_email_notification(
                    to_email=order.customer.email,
                    subject=notification_info['title'],
                    template='order_update',
                    context={
                        'order': order,
                        'event_type': event_type,
                        'message': notification_info['message']
                    }
                )