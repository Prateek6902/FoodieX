from django.urls import path
from . import views

urlpatterns = [
    # Invoice List and Detail
    path('', views.InvoiceListView.as_view(), name='invoice-list'),
    path('<uuid:invoice_id>/', views.InvoiceDetailView.as_view(), name='invoice-detail'),
    
    # Generate Invoice
    path('generate/', views.GenerateInvoiceView.as_view(), name='generate-invoice'),
    
    # Download PDF
    path('<uuid:invoice_id>/download/', views.DownloadInvoicePDFView.as_view(), name='download-invoice'),
    
    # Update Status
    path('<uuid:invoice_id>/update-status/', views.UpdateInvoiceStatusView.as_view(), name='update-invoice-status'),
    path('<uuid:invoice_id>/mark-paid/', views.MarkInvoiceAsPaidView.as_view(), name='mark-invoice-paid'),
    
    # Statistics
    path('stats/', views.InvoiceStatsView.as_view(), name='invoice-stats'),
    
    # Settings
    path('settings/', views.InvoiceSettingView.as_view(), name='invoice-settings'),
]