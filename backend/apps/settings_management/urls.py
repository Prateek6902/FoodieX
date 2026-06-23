from django.urls import path
from . import views

urlpatterns = [
    path('system/', views.SystemSettingsView.as_view(), name='system-settings'),
    path('notifications/', views.NotificationSettingsView.as_view(), name='notification-settings'),
]