from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from .models import Invoice, InvoiceItem, InvoiceSetting
from .serializers import InvoiceSerializer, CreateInvoiceSerializer, InvoiceSettingSerializer
from .services import InvoiceService
from core.permissions.role_permissions import IsAdmin, IsSuperAdmin

class InvoiceListView(APIView):
    """Get all invoices"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role == 'CUSTOMER':
            invoices = Invoice.objects.filter(customer_email=user.email)
        elif user.role == 'VENDOR':
            invoices = Invoice.objects.filter(vendor_name__icontains=user.vendor_profile.business_name)
        else:
            invoices = Invoice.objects.all()
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            invoices = invoices.filter(status=status_filter)
        
        # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            invoices = invoices.filter(invoice_date__gte=start_date)
        if end_date:
            invoices = invoices.filter(invoice_date__lte=end_date)
        
        invoices = invoices.order_by('-invoice_date')
        
        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        total = invoices.count()
        invoices = invoices[offset:offset + limit]
        
        serializer = InvoiceSerializer(invoices, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'data': serializer.data
        })

class InvoiceDetailView(APIView):
    """Get invoice details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, invoice_id):
        invoice = get_object_or_404(Invoice, id=invoice_id)
        
        # Check permission
        if request.user.role == 'CUSTOMER' and invoice.customer_email != request.user.email:
            return Response({
                'success': False,
                'message': 'You don\'t have permission to view this invoice'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = InvoiceSerializer(invoice)
        return Response({
            'success': True,
            'data': serializer.data
        })

class GenerateInvoiceView(APIView):
    """Generate invoice for an order"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreateInvoiceSerializer(data=request.data)
        if serializer.is_valid():
            order_id = serializer.validated_data['order_id']
            
            from apps.orders.models import Order
            order = get_object_or_404(Order, id=order_id)
            
            # Check if invoice already exists
            if hasattr(order, 'invoice'):
                return Response({
                    'success': False,
                    'message': 'Invoice already exists for this order',
                    'data': InvoiceSerializer(order.invoice).data
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check permission
            if request.user.role == 'CUSTOMER' and order.customer != request.user:
                return Response({
                    'success': False,
                    'message': 'You can only generate invoices for your own orders'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Generate invoice using service
            invoice = InvoiceService.generate_invoice(order)
            
            if invoice:
                return Response({
                    'success': True,
                    'message': 'Invoice generated successfully',
                    'data': InvoiceSerializer(invoice).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to generate invoice'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class DownloadInvoicePDFView(APIView):
    """Download invoice as PDF"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, invoice_id):
        invoice = get_object_or_404(Invoice, id=invoice_id)
        
        # Check permission
        if request.user.role == 'CUSTOMER' and invoice.customer_email != request.user.email:
            return Response({
                'success': False,
                'message': 'You don\'t have permission to download this invoice'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Generate PDF
        pdf_content = InvoiceService.generate_pdf(invoice)
        
        if pdf_content:
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
            return response
        else:
            return Response({
                'success': False,
                'message': 'Failed to generate PDF'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateInvoiceStatusView(APIView):
    """Update invoice status (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def put(self, request, invoice_id):
        invoice = get_object_or_404(Invoice, id=invoice_id)
        new_status = request.data.get('status')
        
        if new_status not in dict(Invoice.INVOICE_STATUS):
            return Response({
                'success': False,
                'message': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        invoice.status = new_status
        if new_status == 'PAID':
            invoice.payment_date = timezone.now()
        invoice.save()
        
        return Response({
            'success': True,
            'message': f'Invoice status updated to {new_status}',
            'data': InvoiceSerializer(invoice).data
        })

class MarkInvoiceAsPaidView(APIView):
    """Mark invoice as paid"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, invoice_id):
        invoice = get_object_or_404(Invoice, id=invoice_id)
        
        # Check permission
        if request.user.role == 'CUSTOMER' and invoice.customer_email != request.user.email:
            return Response({
                'success': False,
                'message': 'You don\'t have permission to update this invoice'
            }, status=status.HTTP_403_FORBIDDEN)
        
        transaction_id = request.data.get('transaction_id')
        
        invoice.status = 'PAID'
        invoice.payment_status = 'COMPLETED'
        invoice.payment_date = timezone.now()
        invoice.transaction_id = transaction_id
        invoice.save()
        
        return Response({
            'success': True,
            'message': 'Invoice marked as paid successfully',
            'data': InvoiceSerializer(invoice).data
        })

class InvoiceStatsView(APIView):
    """Get invoice statistics"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        total_invoices = Invoice.objects.count()
        paid_invoices = Invoice.objects.filter(status='PAID').count()
        overdue_invoices = Invoice.objects.filter(status='OVERDUE').count()
        draft_invoices = Invoice.objects.filter(status='DRAFT').count()
        cancelled_invoices = Invoice.objects.filter(status='CANCELLED').count()
        
        total_amount = Invoice.objects.aggregate(total=models.Sum('total_amount'))['total'] or 0
        paid_amount = Invoice.objects.filter(status='PAID').aggregate(total=models.Sum('total_amount'))['total'] or 0
        overdue_amount = Invoice.objects.filter(status='OVERDUE').aggregate(total=models.Sum('total_amount'))['total'] or 0
        
        # Monthly revenue
        current_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_revenue = Invoice.objects.filter(
            status='PAID',
            payment_date__gte=current_month
        ).aggregate(total=models.Sum('total_amount'))['total'] or 0
        
        return Response({
            'success': True,
            'data': {
                'total_invoices': total_invoices,
                'paid_invoices': paid_invoices,
                'overdue_invoices': overdue_invoices,
                'draft_invoices': draft_invoices,
                'cancelled_invoices': cancelled_invoices,
                'total_amount': float(total_amount),
                'paid_amount': float(paid_amount),
                'overdue_amount': float(overdue_amount),
                'monthly_revenue': float(monthly_revenue),
                'collection_rate': (paid_amount / total_amount * 100) if total_amount > 0 else 0
            }
        })

class InvoiceSettingView(APIView):
    """Get/Update invoice settings (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        settings = InvoiceSetting.objects.first()
        if not settings:
            return Response({
                'success': False,
                'message': 'Invoice settings not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = InvoiceSettingSerializer(settings)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def put(self, request):
        settings = InvoiceSetting.objects.first()
        if not settings:
            serializer = InvoiceSettingSerializer(data=request.data)
        else:
            serializer = InvoiceSettingSerializer(settings, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Invoice settings updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)