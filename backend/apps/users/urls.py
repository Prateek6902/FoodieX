from django.urls import path
from . import views

urlpatterns = [
    # Existing URLs
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('update-profile/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('change-role/', views.ChangeRoleView.as_view(), name='change-role'),
    path('login-history/', views.LoginHistoryView.as_view(), name='login-history'),
    
    # New admin URLs
    path('', views.UserListView.as_view(), name='user-list'),
    path('customers/stats/', views.CustomerStatsView.as_view(), name='customer-stats'),
    path('check-auth/', views.CheckAuthView.as_view(), name='check-auth'),
]