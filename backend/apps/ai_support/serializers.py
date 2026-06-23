from rest_framework import serializers
from .models import SupportTicket, ChatMessage, Voucher, Subscription


class SupportTicketSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'user', 'user_name', 'order', 'order_number',
            'ticket_type', 'subject', 'description', 'images',
            'status', 'ai_suggestions', 'resolution',
            'voucher_code', 'voucher_applied', 'refund_amount',
            'refund_processed', 'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_type', 'content', 'images', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']


class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = ['id', 'code', 'discount_percentage', 'valid_until', 'is_used']
        read_only_fields = ['id', 'code', 'created_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'plan', 'start_date', 'end_date', 'is_active', 'auto_renew']
        read_only_fields = ['id', 'start_date']