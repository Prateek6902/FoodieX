from django.urls import path
from .views import OrderReportView, SalesReportView, VendorReportView

urlpatterns = [
    path('orders/', OrderReportView.as_view(), name='order-report'),
    path('sales/', SalesReportView.as_view(), name='sales-report'),
    path('vendors/', VendorReportView.as_view(), name='vendor-report'),
]