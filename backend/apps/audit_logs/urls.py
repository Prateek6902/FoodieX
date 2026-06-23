from django.urls import path
from . import views

urlpatterns = [
    # Main Audit Logs
    path('', views.AuditLogListView.as_view(), name='audit-log-list'),
    path('stats/', views.AuditStatsView.as_view(), name='audit-stats'),
    path('export/', views.ExportAuditLogsView.as_view(), name='export-audit-logs'),
    
    # Login Audit
    path('login/', views.LoginAuditListView.as_view(), name='login-audit-list'),
    
    # Data Change Logs
    path('data-changes/', views.DataChangeLogListView.as_view(), name='data-change-logs'),
    
    # API Access Logs
    path('api-access/', views.APIAccessLogListView.as_view(), name='api-access-logs'),
    
    # User Specific
    path('my-activity/', views.MyActivityLogView.as_view(), name='my-activity'),
    path('my-logins/', views.MyLoginHistoryView.as_view(), name='my-logins'),
    path('user/<uuid:user_id>/', views.UserAuditDetailView.as_view(), name='user-audit-detail'),
]