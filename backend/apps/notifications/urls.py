from django.urls import path
from . import views

urlpatterns = [
    # Notifications
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', views.UnreadNotificationCountView.as_view(), name='unread-count'),
    path('mark-read/', views.MarkNotificationReadView.as_view(), name='mark-read'),
    path('<uuid:notification_id>/delete/', views.DeleteNotificationView.as_view(), name='delete-notification'),
    
    # Send Notification (Admin)
    path('send/', views.SendNotificationView.as_view(), name='send-notification'),
    
    # Preferences
    path('preferences/', views.NotificationPreferencesView.as_view(), name='notification-preferences'),
    
    # Templates (Admin)
    path('templates/', views.NotificationTemplateListView.as_view(), name='notification-templates'),
    path('templates/<uuid:template_id>/', views.NotificationTemplateDetailView.as_view(), name='notification-template-detail'),
]