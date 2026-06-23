from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from .services import ReportGenerator
from core.permissions.role_permissions import IsAdmin, IsSuperAdmin

class OrderReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        format_type = request.query_params.get('format', 'pdf')
        
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        else:
            start_date = timezone.now() - timedelta(days=30)
        
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        else:
            end_date = timezone.now()
        
        return ReportGenerator.generate_order_report(start_date, end_date, format_type)

class SalesReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        format_type = request.query_params.get('format', 'pdf')
        
        return ReportGenerator.generate_sales_report(period, format_type)

class VendorReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        vendor_id = request.query_params.get('vendor_id')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        format_type = request.query_params.get('format', 'pdf')
        
        return ReportGenerator.generate_vendor_report(vendor_id, start_date_str, end_date_str, format_type)