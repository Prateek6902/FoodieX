import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

VENDOR_STATUS = [
    ('PENDING', 'Pending'),
    ('APPROVED', 'Approved'),
    ('REJECTED', 'Rejected'),
    ('SUSPENDED', 'Suspended'),
]

DOCUMENT_TYPES = [
    ('GST', 'GST Certificate'),
    ('PAN', 'PAN Card'),
    ('FSSAI', 'FSSAI License'),
]

class Vendor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='vendor_profile')
    business_name = models.CharField(max_length=255)
    business_registration_number = models.CharField(max_length=100, unique=True)
    tax_id = models.CharField(max_length=100)
    business_address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    phone_number = models.CharField(max_length=20)
    alternate_phone = models.CharField(max_length=20, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=VENDOR_STATUS, default='PENDING')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_reviews = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    is_featured = models.BooleanField(default=False)
    joined_date = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='approved_vendors')
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'vendors'
        indexes = [
            models.Index(fields=['status', '-rating']),
            models.Index(fields=['business_name']),
            models.Index(fields=['city', 'state']),
            models.Index(fields=['-total_revenue']),
        ]
    
    def __str__(self):
        return self.business_name


class VendorDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    document_number = models.CharField(max_length=100)
    document_file = models.FileField(upload_to='vendor_documents/')
    issued_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vendor_documents'
        unique_together = ['vendor', 'document_type']


class VendorPayout(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='payouts')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    commission = models.DecimalField(max_digits=12, decimal_places=2)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[('PENDING', 'Pending'), ('PROCESSED', 'Processed'), ('FAILED', 'Failed')])
    transaction_id = models.CharField(max_length=255, null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vendor_payouts'
        ordering = ['-created_at']


class VendorReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True)
    # Remove order foreign key - use string instead
    # order = models.ForeignKey('orders.Order', on_delete=models.CASCADE)
    order_id = models.CharField(max_length=100, null=True, blank=True)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    response = models.TextField(null=True, blank=True)
    response_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vendor_reviews'
        indexes = [
            models.Index(fields=['vendor', '-created_at']),
            models.Index(fields=['rating']),
        ]
    
    def __str__(self):
        return f"{self.customer} - {self.vendor.business_name} - {self.rating}"