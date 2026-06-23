from django.urls import path
from . import views

urlpatterns = [
    # Support Tickets
    path('tickets/', views.SupportTicketListView.as_view(), name='ticket-list'),
    path('tickets/create/', views.SupportTicketCreateView.as_view(), name='ticket-create'),
    path('tickets/<uuid:ticket_id>/', views.SupportTicketDetailView.as_view(), name='ticket-detail'),
    
    # Chat Messages
    path('tickets/<uuid:ticket_id>/messages/', views.ChatMessageListView.as_view(), name='chat-messages'),
    path('tickets/<uuid:ticket_id>/messages/create/', views.ChatMessageCreateView.as_view(), name='chat-message-create'),
    
    # Vouchers
    path('vouchers/', views.VoucherListView.as_view(), name='voucher-list'),
    path('vouchers/apply/', views.VoucherApplyView.as_view(), name='voucher-apply'),
    
    # Subscription
    path('subscription/', views.SubscriptionView.as_view(), name='subscription'),
    
    # AI Content Generation
    path('ai/generate-description/', views.GenerateFoodDescriptionView.as_view(), name='generate-description'),
    path('ai/generate-quote/', views.GenerateFoodQuoteView.as_view(), name='generate-quote'),
]