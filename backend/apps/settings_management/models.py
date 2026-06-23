import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class SystemSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # General Settings
    site_name = models.CharField(max_length=255, default='Food Delivery Platform')
    site_logo = models.URLField(max_length=500, null=True, blank=True)
    site_favicon = models.URLField(max_length=500, null=True, blank=True)
    contact_email = models.EmailField(default='support@fooddelivery.com')
    contact_phone = models.CharField(max_length=20, default='+1234567890')
    contact_address = models.TextField(default='123 Business Street, City, Country')
    
    # Business Settings
    currency = models.CharField(max_length=3, default='USD')
    currency_symbol = models.CharField(max_length=5, default='$')
    timezone = models.CharField(max_length=50, default='UTC')
    date_format = models.CharField(max_length=20, default='Y-m-d')
    time_format = models.CharField(max_length=20, default='H:i:s')
    
    # Commission Settings
    vendor_commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    delivery_partner_commission = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Tax Settings
    default_tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    is_tax_enabled = models.BooleanField(default=True)
    tax_calculation_method = models.CharField(max_length=20, choices=[
        ('EXCLUSIVE', 'Exclusive'),
        ('INCLUSIVE', 'Inclusive')
    ], default='EXCLUSIVE')
    
    # Delivery Settings
    base_delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=50)
    free_delivery_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=500)
    max_delivery_radius_km = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    estimated_delivery_time_minutes = models.IntegerField(default=45)
    
    # Order Settings
    auto_cancel_unpaid_minutes = models.IntegerField(default=30)
    auto_confirm_delivery_hours = models.IntegerField(default=24)
    max_order_items = models.IntegerField(default=50)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Payment Settings
    payment_gateway = models.CharField(max_length=50, default='RAZORPAY')
    is_test_mode = models.BooleanField(default=True)
    razorpay_key = models.CharField(max_length=255, null=True, blank=True)
    razorpay_secret = models.CharField(max_length=255, null=True, blank=True)
    stripe_key = models.CharField(max_length=255, null=True, blank=True)
    stripe_secret = models.CharField(max_length=255, null=True, blank=True)
    
    # Email Settings
    smtp_host = models.CharField(max_length=255, null=True, blank=True)
    smtp_port = models.IntegerField(default=587)
    smtp_username = models.CharField(max_length=255, null=True, blank=True)
    smtp_password = models.CharField(max_length=255, null=True, blank=True)
    smtp_use_tls = models.BooleanField(default=True)
    from_email = models.EmailField(null=True, blank=True)
    
    # Notification Settings
    enable_email_notifications = models.BooleanField(default=True)
    enable_push_notifications = models.BooleanField(default=True)
    enable_sms_notifications = models.BooleanField(default=False)
    
    # Security Settings
    max_login_attempts = models.IntegerField(default=5)
    lockout_duration_minutes = models.IntegerField(default=30)
    password_expiry_days = models.IntegerField(default=90)
    session_timeout_minutes = models.IntegerField(default=120)
    require_email_verification = models.BooleanField(default=True)
    
    # Feature Flags
    enable_vendor_registration = models.BooleanField(default=True)
    enable_delivery_partner_registration = models.BooleanField(default=True)
    enable_referral_program = models.BooleanField(default=False)
    enable_loyalty_points = models.BooleanField(default=True)
    enable_coupons = models.BooleanField(default=True)
    
    # SEO Settings
    meta_title = models.CharField(max_length=255, null=True, blank=True)
    meta_description = models.TextField(null=True, blank=True)
    meta_keywords = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'system_settings'
        app_label = 'settings_management'
    
    def __str__(self):
        return self.site_name

class NotificationSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='notification_settings')
    
    # Email Notifications
    email_order_updates = models.BooleanField(default=True)
    email_promotions = models.BooleanField(default=False)
    email_system_alerts = models.BooleanField(default=True)
    email_delivery_updates = models.BooleanField(default=True)
    email_payment_updates = models.BooleanField(default=True)
    
    # Push Notifications
    push_order_updates = models.BooleanField(default=True)
    push_promotions = models.BooleanField(default=False)
    push_system_alerts = models.BooleanField(default=True)
    push_delivery_updates = models.BooleanField(default=True)
    push_chat_messages = models.BooleanField(default=True)
    
    # SMS Notifications
    sms_order_updates = models.BooleanField(default=False)
    sms_delivery_updates = models.BooleanField(default=False)
    sms_otp = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_settings'
        app_label = 'settings_management'
    
    def __str__(self):
        return f"Settings for {self.user.email}"