import uuid
from django.db import models
from django.utils import timezone

class Invoice(models.Model):
    INVOICE_STATUS = [
        ('DRAFT', 'Draft'),
        ('ISSUED', 'Issued'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='invoice')
    
    # Customer Details
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField()
    customer_gst = models.CharField(max_length=50, null=True, blank=True)
    
    # Vendor Details
    vendor_name = models.CharField(max_length=255)
    vendor_gst = models.CharField(max_length=50, null=True, blank=True)
    vendor_address = models.TextField()
    vendor_pan = models.CharField(max_length=50, null=True, blank=True)
    
    # Invoice Details
    invoice_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField()
    
    # Amount Breakdown
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    packaging_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Tax Details (GST)
    cgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    cgst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    sgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    sgst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    igst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    igst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Payment Details
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20)
    transaction_id = models.CharField(max_length=255, null=True, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=INVOICE_STATUS, default='DRAFT')
    notes = models.TextField(null=True, blank=True)
    terms = models.TextField(null=True, blank=True)
    
    # File
    pdf_file = models.FileField(upload_to='invoices/', null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invoices'
        ordering = ['-invoice_date']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['order']),
            models.Index(fields=['customer_email']),
            models.Index(fields=['status']),
            models.Index(fields=['-invoice_date']),
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - Order {self.order.order_number}"
    
    def is_overdue(self):
        return self.due_date < timezone.now() and self.status not in ['PAID', 'CANCELLED']

class InvoiceItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=255)
    product_code = models.CharField(max_length=100, null=True, blank=True)
    hsn_code = models.CharField(max_length=20, null=True, blank=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cgst = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sgst = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    igst = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'invoice_items'
    
    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

class InvoiceSetting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255)
    company_logo = models.URLField(max_length=500, null=True, blank=True)
    company_address = models.TextField()
    company_email = models.EmailField()
    company_phone = models.CharField(max_length=20)
    company_gst = models.CharField(max_length=50, null=True, blank=True)
    company_pan = models.CharField(max_length=50, null=True, blank=True)
    
    # Tax Settings
    default_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.0)
    is_gst_enabled = models.BooleanField(default=True)
    
    # Invoice Settings
    invoice_prefix = models.CharField(max_length=10, default='INV')
    next_invoice_number = models.IntegerField(default=1)
    invoice_terms = models.TextField(default="Payment is due within 15 days")
    invoice_notes = models.TextField(blank=True, null=True)
    
    # Payment Settings
    bank_name = models.CharField(max_length=255, null=True, blank=True)
    bank_account_name = models.CharField(max_length=255, null=True, blank=True)
    bank_account_number = models.CharField(max_length=50, null=True, blank=True)
    bank_ifsc = models.CharField(max_length=20, null=True, blank=True)
    upi_id = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invoice_settings'
    
    def __str__(self):
        return self.company_name