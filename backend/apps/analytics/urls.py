# apps/analytics/urls.py
from django.urls import path
from .views import (
    RevenueAnalyticsView,
    CustomerGrowthView,
    TopProductsView,
    SalesByCategoryView,
    SalesAnalysisView,
    DashboardStatsView,
    RegionAnalysisView
)

urlpatterns = [
    path('revenue/', RevenueAnalyticsView.as_view(), name='revenue-analytics'),
    path('customer-growth/', CustomerGrowthView.as_view(), name='customer-growth'),
    path('top-products/', TopProductsView.as_view(), name='top-products'),
    path('sales-by-category/', SalesByCategoryView.as_view(), name='sales-by-category'),
    path('sales-analysis/', SalesAnalysisView.as_view(), name='sales-analysis'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/region-analysis/', RegionAnalysisView.as_view(), name='region-analysis'),
]