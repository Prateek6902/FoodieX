from django.urls import path
from .views import (
    AdminDashboardStatsView,
    RevenueChartView,
    RegionAnalysisView,
    TopRestaurantsView,
    RecentOrdersView,
    TopPerformersView,
    RevenueByCategoryView,
    OrderStatusView,
    AdminStatsView,
)
from .vendor_views import VendorDashboardView

urlpatterns = [
    path('admin/', AdminDashboardStatsView.as_view(), name='admin-dashboard'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('revenue-chart/', RevenueChartView.as_view(), name='revenue-chart'),
    path('region-analysis/', RegionAnalysisView.as_view(), name='region-analysis'),
    path('top-restaurants/', TopRestaurantsView.as_view(), name='top-restaurants'),
    path('recent-orders/', RecentOrdersView.as_view(), name='recent-orders'),
    path('top-performers/', TopPerformersView.as_view(), name='top-performers'),
    path('revenue-by-category/', RevenueByCategoryView.as_view(), name='revenue-by-category'),
    path('order-status/', OrderStatusView.as_view(), name='order-status'),
    path('vendor/', VendorDashboardView.as_view(), name='vendor-dashboard'),
]