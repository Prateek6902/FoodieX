import io
import uuid
from decimal import Decimal
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from django.utils import timezone
from django.core.files.base import ContentFile
from django.conf import settings
from .models import Invoice, InvoiceItem, InvoiceSetting

class InvoiceService:
    
    @staticmethod
    def generate_invoice(order):
        """Generate invoice for an order"""
        from apps.orders.models import OrderItem
        
        # Generate invoice number
        invoice_number = InvoiceService.generate_invoice_number()
        
        # Get invoice settings
        settings = InvoiceSetting.objects.first()
        if not settings:
            settings = InvoiceService.create_default_settings()
        
        # Calculate tax amounts
        tax_rate = Decimal('18.0')  # 18% GST
        cgst_rate = tax_rate / 2
        sgst_rate = tax_rate / 2
        
        # Create invoice
        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            order=order,
            customer_name=order.customer.full_name,
            customer_email=order.customer.email,
            customer_phone=order.customer.mobile_number,
            customer_address=order.delivery_address,
            vendor_name=order.vendor.business_name,
            vendor_gst=order.vendor.tax_id,
            vendor_address=order.vendor.business_address,
            invoice_date=timezone.now(),
            due_date=timezone.now() + timezone.timedelta(days=15),
            subtotal=order.subtotal,
            discount_amount=order.discount_amount,
            delivery_fee=order.delivery_fee,
            packaging_charge=Decimal('0'),
            total_amount=order.total_amount,
            cgst_rate=cgst_rate,
            sgst_rate=sgst_rate,
            cgst_amount=order.tax_amount / 2,
            sgst_amount=order.tax_amount / 2,
            tax_amount=order.tax_amount,
            payment_method=order.payment_method,
            payment_status=order.payment_status,
            status='ISSUED',
            terms=settings.invoice_terms,
            notes=settings.invoice_notes
        )
        
        # Create invoice items
        for item in order.items.all():
            InvoiceItem.objects.create(
                invoice=invoice,
                product_name=item.product.name,
                product_code=item.product.sku,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.total_price,
                discount=Decimal('0'),
                tax_rate=tax_rate,
                tax_amount=(item.total_price * tax_rate / 100),
                cgst=(item.total_price * cgst_rate / 100),
                sgst=(item.total_price * sgst_rate / 100)
            )
        
        # Generate PDF
        pdf_content = InvoiceService.generate_pdf(invoice)
        if pdf_content:
            invoice.pdf_file.save(f"{invoice_number}.pdf", ContentFile(pdf_content))
        
        return invoice
    
    @staticmethod
    def generate_invoice_number():
        """Generate unique invoice number"""
        settings = InvoiceSetting.objects.first()
        if settings:
            prefix = settings.invoice_prefix
            number = settings.next_invoice_number
            settings.next_invoice_number += 1
            settings.save()
        else:
            prefix = 'INV'
            number = 1
        
        year = timezone.now().strftime('%Y')
        return f"{prefix}/{year}/{number:06d}"
    
    @staticmethod
    def create_default_settings():
        """Create default invoice settings"""
        return InvoiceSetting.objects.create(
            company_name="Food Delivery Platform",
            company_address="123 Business Street, City, Country",
            company_email="finance@fooddelivery.com",
            company_phone="+1234567890",
            company_gst="GST123456789",
            default_tax_rate=18.0,
            is_gst_enabled=True,
            invoice_prefix="INV",
            next_invoice_number=1,
            invoice_terms="Payment is due within 15 days. Late payments may incur additional charges.",
            invoice_notes="Thank you for your business!"
        )
    
    @staticmethod
    def generate_pdf(invoice):
        """Generate PDF for invoice"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2E3B4E'),
            spaceAfter=30,
            alignment=1
        )
        
        header_style = ParagraphStyle(
            'HeaderStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#666666')
        )
        
        # Company Header
        settings = InvoiceSetting.objects.first()
        company_name = settings.company_name if settings else "Food Delivery Platform"
        
        header_data = [
            [Paragraph(f"<b>{company_name}</b>", title_style), ""],
            [Paragraph("Tax Invoice", title_style), ""],
        ]
        header_table = Table(header_data, colWidths=[400, 100])
        elements.append(header_table)
        elements.append(Spacer(1, 10))
        
        # Invoice Details
        invoice_details = [
            ['Invoice Number:', invoice.invoice_number],
            ['Invoice Date:', invoice.invoice_date.strftime('%Y-%m-%d')],
            ['Due Date:', invoice.due_date.strftime('%Y-%m-%d')],
            ['Order Number:', invoice.order.order_number],
        ]
        
        invoice_table = Table(invoice_details, colWidths=[100, 200])
        invoice_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(invoice_table)
        elements.append(Spacer(1, 15))
        
        # Billing Details
        billing_data = [
            ['<b>Bill To:</b>', '<b>Vendor Details:</b>'],
            [invoice.customer_name, invoice.vendor_name],
            [invoice.customer_address, invoice.vendor_address],
            [f"Email: {invoice.customer_email}", f"GST: {invoice.vendor_gst or 'N/A'}"],
            [f"Phone: {invoice.customer_phone}", ""],
        ]
        
        billing_table = Table(billing_data, colWidths=[250, 250])
        billing_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(billing_table)
        elements.append(Spacer(1, 15))
        
        # Items Table
        items_data = [['#', 'Product', 'Quantity', 'Unit Price', 'Tax', 'Total']]
        for idx, item in enumerate(invoice.items.all(), 1):
            items_data.append([
                str(idx),
                item.product_name,
                str(item.quantity),
                f"₹{item.unit_price}",
                f"{item.tax_rate}%",
                f"₹{item.total_price}"
            ])
        
        items_table = Table(items_data, colWidths=[40, 200, 60, 80, 60, 80])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 15))
        
        # Totals
        totals_data = [
            ['Subtotal:', f"₹{invoice.subtotal}"],
            ['Discount:', f"-₹{invoice.discount_amount}"],
            ['Delivery Fee:', f"₹{invoice.delivery_fee}"],
            [f'CGST ({invoice.cgst_rate}%):', f"₹{invoice.cgst_amount}"],
            [f'SGST ({invoice.sgst_rate}%):', f"₹{invoice.sgst_amount}"],
            ['<b>Total Amount:</b>', f"<b>₹{invoice.total_amount}</b>"],
        ]
        
        totals_table = Table(totals_data, colWidths=[300, 100])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(totals_table)
        elements.append(Spacer(1, 15))
        
        # Terms and Notes
        if invoice.terms:
            elements.append(Paragraph("<b>Terms & Conditions:</b>", styles['Normal']))
            elements.append(Paragraph(invoice.terms, header_style))
            elements.append(Spacer(1, 10))
        
        if invoice.notes:
            elements.append(Paragraph("<b>Notes:</b>", styles['Normal']))
            elements.append(Paragraph(invoice.notes, header_style))
        
        # Footer
        elements.append(Spacer(1, 30))
        footer_text = "This is a computer generated invoice and does not require physical signature."
        elements.append(Paragraph(footer_text, header_style))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()