from django.urls import path
from . import views

urlpatterns = [
    # Inbox and Sent
    path('inbox/', views.InboxView.as_view(), name='inbox'),
    path('sent/', views.SentMessagesView.as_view(), name='sent-messages'),
    path('send/', views.SendMessageView.as_view(), name='send-message'),
    
    # Message Actions
    path('<uuid:message_id>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('<uuid:message_id>/mark-read/', views.MarkMessageReadView.as_view(), name='mark-read'),
    path('mark-all-read/', views.MarkAllMessagesReadView.as_view(), name='mark-all-read'),
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
    
    # Broadcast (Admin)
    path('broadcast/', views.BroadcastMessageView.as_view(), name='broadcast'),
]