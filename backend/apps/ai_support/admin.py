from django.contrib import admin
from .models import SupportTicket, ChatMessage, Voucher, Subscription

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'ticket_type', 'status', 'created_at']
    list_filter = ['ticket_type', 'status']
    search_fields = ['user__email', 'description']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'message_type', 'created_at']
    list_filter = ['message_type']
    search_fields = ['user__email', 'content']

@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ['code', 'user', 'discount_percentage', 'valid_until', 'is_used']
    list_filter = ['is_used']
    search_fields = ['code', 'user__email']

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'is_active', 'start_date', 'end_date']
    list_filter = ['plan', 'is_active']
    search_fields = ['user__email']