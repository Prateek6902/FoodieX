from django.urls import path
from . import views

urlpatterns = [
    # Test endpoint
    path('test/', views.TestView.as_view(), name='delivery-test'),
    
    # Partner Management
    path('partners/', views.DeliveryPartnerListView.as_view(), name='delivery-partners'),
    path('partners/top/', views.TopDeliveryPartnersView.as_view(), name='top-partners'),
    path('partners/<uuid:partner_id>/', views.DeliveryPartnerDetailView.as_view(), name='delivery-partner-detail'),
    path('partners/<uuid:partner_id>/verify/', views.DeliveryPartnerVerificationView.as_view(), name='verify-partner'),
    
    # Dashboards
    path('dashboard/', views.DeliveryPartnerDashboardView.as_view(), name='delivery-dashboard'),
    path('admin-dashboard/', views.AdminDeliveryDashboardView.as_view(), name='admin-delivery-dashboard'),
    
    # Analytics
    path('performance/', views.DeliveryPerformanceAnalyticsView.as_view(), name='delivery-performance'),
]