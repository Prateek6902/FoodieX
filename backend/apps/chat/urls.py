from django.urls import path
from . import views

urlpatterns = [
    # Chat Rooms
    path('rooms/', views.ChatRoomListView.as_view(), name='chat-rooms'),
    path('rooms/create/', views.CreateChatRoomView.as_view(), name='create-chat-room'),
    path('rooms/<uuid:room_id>/', views.ChatRoomDetailView.as_view(), name='chat-room-detail'),
    
    # Messages
    path('rooms/<uuid:room_id>/messages/', views.ChatMessageListView.as_view(), name='chat-messages'),
    path('rooms/<uuid:room_id>/send/', views.SendMessageView.as_view(), name='send-message'),
    path('rooms/<uuid:room_id>/mark-read/', views.MarkMessagesReadView.as_view(), name='mark-read'),
    
    # Typing Indicator
    path('rooms/<uuid:room_id>/typing/', views.TypingIndicatorView.as_view(), name='typing-indicator'),
    
    # Unread Count
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
]