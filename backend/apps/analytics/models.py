import uuid
from django.db import models
from django.utils import timezone
from apps.users.models import User
from apps.restaurants.models import Restaurant
from apps.vendors.models import Vendor
from apps.orders.models import Order

class AnalyticsEvent(models.Model):
    EVENT_TYPES = [
        ('page_view', 'Page View'),
        ('click', 'Click'),
        ('purchase', 'Purchase'),
        ('login', 'Login'),
        ('search', 'Search'),
        ('add_to_cart', 'Add to Cart'),
        ('view_product', 'View Product'),
        ('checkout_start', 'Checkout Start'),
        ('checkout_complete', 'Checkout Complete'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='analytics_events')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, db_index=True)
    page_url = models.TextField()
    referrer = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    session_id = models.CharField(max_length=100, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'analytics_events'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['session_id', '-created_at']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.created_at}"

class DailyMetric(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True, db_index=True)
    
    # Revenue Metrics
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    total_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    avg_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # User Metrics
    new_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    new_customers = models.IntegerField(default=0)
    active_customers = models.IntegerField(default=0)
    
    # Vendor Metrics
    new_vendors = models.IntegerField(default=0)
    active_vendors = models.IntegerField(default=0)
    pending_vendors = models.IntegerField(default=0)
    
    # Restaurant Metrics
    new_restaurants = models.IntegerField(default=0)
    active_restaurants = models.IntegerField(default=0)
    
    # Delivery Metrics
    total_deliveries = models.IntegerField(default=0)
    on_time_deliveries = models.IntegerField(default=0)
    avg_delivery_time = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Performance Metrics
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    cancellation_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Order Metrics by Status
    pending_orders = models.IntegerField(default=0)
    accepted_orders = models.IntegerField(default=0)
    preparing_orders = models.IntegerField(default=0)
    ready_orders = models.IntegerField(default=0)
    picked_up_orders = models.IntegerField(default=0)
    out_for_delivery_orders = models.IntegerField(default=0)
    delivered_orders = models.IntegerField(default=0)
    cancelled_orders = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'daily_metrics'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['-total_revenue']),
            models.Index(fields=['-total_orders']),
        ]
    
    def __str__(self):
        return f"Metrics for {self.date}"

class WeeklyMetric(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    week_start = models.DateField(unique=True, db_index=True)
    week_end = models.DateField()
    
    # Revenue Metrics
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    total_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    avg_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Growth Metrics
    revenue_growth = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    order_growth = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    user_growth = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'weekly_metrics'
        ordering = ['-week_start']
    
    def __str__(self):
        return f"Week {self.week_start} to {self.week_end}"

class MonthlyMetric(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    month = models.DateField(unique=True, db_index=True)
    
    # Revenue Metrics
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    total_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    avg_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # User Metrics
    total_customers = models.IntegerField(default=0)
    new_customers = models.IntegerField(default=0)
    repeat_customers = models.IntegerField(default=0)
    customer_retention_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Vendor Metrics
    total_vendors = models.IntegerField(default=0)
    new_vendors = models.IntegerField(default=0)
    active_vendors = models.IntegerField(default=0)
    
    # Performance Metrics
    growth_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'monthly_metrics'
        ordering = ['-month']
    
    def __str__(self):
        return f"Metrics for {self.month.strftime('%B %Y')}"

class UserActivityLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=255)
    model_name = models.CharField(max_length=100, blank=True, null=True)
    object_id = models.CharField(max_length=100, blank=True, null=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'user_activity_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.created_at}"