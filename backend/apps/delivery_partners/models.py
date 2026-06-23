import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class DeliveryProfile(models.Model):
    VEHICLE_CHOICES = [
        ('BIKE', 'Bike'),
        ('SCOOTER', 'Scooter'),
        ('CAR', 'Car'),
        ('BICYCLE', 'Bicycle'),
        ('WALKING', 'Walking'),
    ]
    
    AVAILABILITY_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('ASSIGNED', 'Assigned'),
        ('BUSY', 'Busy'),
        ('OFFLINE', 'Offline'),
        ('ON_BREAK', 'On Break'),
    ]
    
    VERIFICATION_STATUS = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('DOCUMENTS_REQUIRED', 'Documents Required'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='delivery_profile_detail')
    
    # Personal Information
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    alternate_phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    
    # Vehicle Information
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_CHOICES, default='BIKE')
    vehicle_number = models.CharField(max_length=20, unique=True)
    vehicle_model = models.CharField(max_length=100)
    vehicle_color = models.CharField(max_length=50)
    vehicle_photo = models.ImageField(upload_to='delivery/vehicles/', null=True, blank=True)
    
    # Availability & Status
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='OFFLINE')
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    verification_status = models.CharField(max_length=30, choices=VERIFICATION_STATUS, default='PENDING')
    
    # Location Tracking
    current_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    current_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    last_location_update = models.DateTimeField(null=True, blank=True)
    
    # Assigned Zone
    assigned_zone = models.CharField(max_length=100, null=True, blank=True)
    delivery_priority = models.IntegerField(default=5)
    max_orders = models.IntegerField(default=3)
    current_orders = models.IntegerField(default=0)
    
    # Performance Metrics
    total_deliveries = models.IntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_reviews = models.IntegerField(default=0)
    
    # Performance Scores
    performance_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    reliability_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    customer_satisfaction_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    attendance_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Delivery Metrics
    on_time_delivery_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    acceptance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    rejection_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    average_delivery_time = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_delivery_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    cancellation_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Documents
    driving_license = models.FileField(upload_to='delivery/documents/', null=True, blank=True)
    license_number = models.CharField(max_length=50, blank=True)
    license_expiry = models.DateField(null=True, blank=True)
    aadhar_card = models.FileField(upload_to='delivery/documents/', null=True, blank=True)
    pan_card = models.FileField(upload_to='delivery/documents/', null=True, blank=True)
    background_check_completed = models.BooleanField(default=False)
    document_verified_at = models.DateTimeField(null=True, blank=True)
    
    # Shift & Attendance
    shift_start_time = models.TimeField(null=True, blank=True)
    shift_end_time = models.TimeField(null=True, blank=True)
    total_working_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_login = models.DateTimeField(null=True, blank=True)
    last_logout = models.DateTimeField(null=True, blank=True)
    
    # Earnings Breakdown
    incentive_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bonus_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    penalty_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Timestamps
    joined_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'delivery_profiles'
        indexes = [
            models.Index(fields=['availability_status']),
            models.Index(fields=['is_active', 'is_verified']),
            models.Index(fields=['assigned_zone']),
            models.Index(fields=['-performance_score']),
        ]
    
    def __str__(self):
        return f"{self.full_name} - {self.vehicle_number}"


class DeliveryZone(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    boundaries = models.JSONField(default=dict)
    center_latitude = models.DecimalField(max_digits=10, decimal_places=7)
    center_longitude = models.DecimalField(max_digits=10, decimal_places=7)
    radius_km = models.DecimalField(max_digits=10, decimal_places=2, default=5)
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'delivery_zones'
    
    def __str__(self):
        return self.name


class DeliveryAssignment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('PICKED_UP', 'Picked Up'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='delivery_assignment')
    delivery_partner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='delivery_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'delivery_assignments'
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"Order {self.order.order_number}"


class DeliveryEarning(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery_partner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='delivery_earnings')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE)
    base_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    incentive_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonus_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('PROCESSED', 'Processed'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed')
    ], default='PENDING')
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'delivery_earnings'
        ordering = ['-created_at']


class DeliveryPerformance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery_partner = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='delivery_performance_detail')
    
    # Today's metrics
    today_deliveries = models.IntegerField(default=0)
    today_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    today_on_time = models.IntegerField(default=0)
    today_late = models.IntegerField(default=0)
    
    # Weekly metrics
    weekly_deliveries = models.IntegerField(default=0)
    weekly_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    weekly_on_time_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    
    # Monthly metrics
    monthly_deliveries = models.IntegerField(default=0)
    monthly_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_acceptance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    
    # Lifetime metrics
    lifetime_deliveries = models.IntegerField(default=0)
    lifetime_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'delivery_performance'


class DeliveryIncident(models.Model):
    INCIDENT_TYPES = [
        ('LATE_DELIVERY', 'Late Delivery'),
        ('FAILED_DELIVERY', 'Failed Delivery'),
        ('CUSTOMER_COMPLAINT', 'Customer Complaint'),
        ('VENDOR_COMPLAINT', 'Vendor Complaint'),
        ('ACCIDENT', 'Accident'),
        ('MISBEHAVIOR', 'Misbehavior'),
        ('OTHER', 'Other'),
    ]
    
    SEVERITY_LEVELS = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery_partner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='delivery_incidents')
    incident_type = models.CharField(max_length=30, choices=INCIDENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='MEDIUM')
    description = models.TextField()
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'delivery_incidents'
        ordering = ['-created_at']


class DeliveryNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery_partner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='delivery_notifications')  # Changed related_name
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(max_length=50, default='GENERAL')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'delivery_notifications'
        ordering = ['-created_at']