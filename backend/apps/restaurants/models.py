import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class Restaurant(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SUSPENDED', 'Suspended'),
    ]
    
    DINING_TYPE_CHOICES = [
        ('CASUAL', 'Casual Dining'),
        ('FINE', 'Fine Dining'),
        ('ROOFTOP', 'Rooftop'),
        ('CAFE', 'Cafe'),
        ('FAMILY', 'Family Dining'),
        ('FAST_CASUAL', 'Fast Casual'),
        ('BUFFET', 'Buffet'),
        ('BAR', 'Bar & Grill'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name='restaurants', null=True, blank=True)
    
    # Basic Info
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    cuisine_type = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    # Media
    logo = models.ImageField(upload_to='restaurant_logos/', null=True, blank=True)
    logo_url = models.URLField(max_length=500, null=True, blank=True)
    cover_image = models.ImageField(upload_to='restaurant_covers/', null=True, blank=True)
    cover_image_url = models.URLField(max_length=500, null=True, blank=True)
    gallery_images = models.JSONField(default=list, blank=True)  # List of image URLs
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPROVED')
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Ratings
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.IntegerField(default=0)
    
    # Timing
    opening_time = models.TimeField(default='09:00')
    closing_time = models.TimeField(default='22:00')
    is_open_24_7 = models.BooleanField(default=False)
    
    # Delivery
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_radius_km = models.DecimalField(max_digits=5, decimal_places=2, default=5)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_delivery_available = models.BooleanField(default=True)
    is_takeaway_available = models.BooleanField(default=True)
    
    # Dining Specific Fields
    has_dining = models.BooleanField(default=True)
    dining_type = models.CharField(max_length=20, choices=DINING_TYPE_CHOICES, default='CASUAL')
    seating_capacity = models.IntegerField(default=50)
    is_veg = models.BooleanField(default=False)
    outdoor_seating = models.BooleanField(default=False)
    parking_available = models.BooleanField(default=False)
    wifi_available = models.BooleanField(default=False)
    music_available = models.BooleanField(default=False)
    pet_friendly = models.BooleanField(default=False)
    serves_alcohol = models.BooleanField(default=False)
    has_live_music = models.BooleanField(default=False)
    has_private_dining = models.BooleanField(default=False)
    has_booking_system = models.BooleanField(default=True)
    accepts_reservations = models.BooleanField(default=True)
    dress_code = models.CharField(max_length=100, blank=True, null=True)
    special_diets = models.JSONField(default=list, blank=True)  # ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto']
    ambiance = models.JSONField(default=list, blank=True)  # ['Romantic', 'Family', 'Business', 'Casual']
    
    # Statistics
    total_orders = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'restaurants'
        ordering = ['-rating', 'name']
        indexes = [
            models.Index(fields=['has_dining', 'is_active', 'status']),
            models.Index(fields=['city', 'cuisine_type']),
            models.Index(fields=['is_veg', 'serves_alcohol']),
        ]
    
    def __str__(self):
        return self.name
    
    def is_open_now(self):
        now = timezone.now().time()
        if self.is_open_24_7:
            return True
        return self.opening_time <= now <= self.closing_time
    
    def get_dining_type_display(self):
        return dict(self.DINING_TYPE_CHOICES).get(self.dining_type, 'Casual Dining')


class MenuItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, blank=True, null=True)
    sub_category = models.CharField(max_length=100, blank=True, null=True)
    
    is_available = models.BooleanField(default=True)
    is_veg = models.BooleanField(default=True)
    is_recommended = models.BooleanField(default=False)
    is_spicy = models.BooleanField(default=False)
    
    preparation_time = models.IntegerField(default=15)  # in minutes
    image = models.URLField(max_length=500, null=True, blank=True)
    calories = models.IntegerField(null=True, blank=True)
    dietary_info = models.JSONField(default=list, blank=True)  # ['Gluten-Free', 'Vegan', 'Keto']
    ingredients = models.JSONField(default=list, blank=True)
    allergens = models.JSONField(default=list, blank=True)
    
    total_sold = models.IntegerField(default=0)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'menu_items'
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['restaurant', 'is_available']),
            models.Index(fields=['restaurant', 'category']),
        ]
    
    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"


class RestaurantCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    image = models.URLField(max_length=500, null=True, blank=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'restaurant_categories'
        ordering = ['display_order', 'name']
        unique_together = ['restaurant', 'name']
    
    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"


class RestaurantOffer(models.Model):
    OFFER_TYPE_CHOICES = [
        ('PERCENTAGE', 'Percentage'),
        ('FIXED', 'Fixed'),
        ('BOGO', 'Buy One Get One'),
        ('COMBO', 'Combo Deal'),
    ]
    
    OFFER_TARGET_CHOICES = [
        ('ALL', 'All Items'),
        ('CATEGORY', 'Category'),
        ('ITEM', 'Specific Item'),
        ('DINING', 'Dining Only'),
        ('DELIVERY', 'Delivery Only'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='offers')
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    discount_type = models.CharField(max_length=20, choices=OFFER_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    target_type = models.CharField(max_length=20, choices=OFFER_TARGET_CHOICES, default='ALL')
    target_id = models.UUIDField(null=True, blank=True)  # Can be category_id or menu_item_id
    
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    days_of_week = models.JSONField(default=list, blank=True)  # [0,1,2,3,4,5,6] for Monday-Sunday
    time_slots = models.JSONField(default=list, blank=True)  # [{'start': '09:00', 'end': '17:00'}]
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'restaurant_offers'
        indexes = [
            models.Index(fields=['restaurant', 'is_active']),
            models.Index(fields=['valid_from', 'valid_to']),
        ]
    
    def __str__(self):
        return f"{self.restaurant.name} - {self.title}"
    
    def is_valid_now(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.valid_from or now > self.valid_to:
            return False
        # Check day of week
        if self.days_of_week:
            current_day = now.weekday()
            if current_day not in self.days_of_week:
                return False
        return True


class RestaurantReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey('users.User', on_delete=models.CASCADE, null=True, related_name='restaurant_reviews')
    
    order_id = models.CharField(max_length=100, null=True, blank=True)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    response = models.TextField(null=True, blank=True)
    response_at = models.DateTimeField(null=True, blank=True)
    
    images = models.JSONField(default=list, blank=True)
    dining_experience = models.JSONField(default=dict, blank=True)  # {'ambiance': 4, 'service': 5, 'food': 4}
    
    is_verified = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'restaurant_reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['restaurant', '-created_at']),
            models.Index(fields=['customer', 'restaurant']),
        ]
        unique_together = ['customer', 'restaurant']
    
    def __str__(self):
        return f"{self.customer} - {self.restaurant.name} - {self.rating}"


class RestaurantBooking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
        ('NO_SHOW', 'No Show'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='bookings')
    customer = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='restaurant_bookings')
    
    date = models.DateField()
    time = models.TimeField()
    party_size = models.IntegerField(default=2)
    special_requests = models.TextField(blank=True)
    
    table_number = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    customer_name = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    customer_email = models.EmailField(blank=True)
    
    booking_reference = models.CharField(max_length=50, unique=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'restaurant_bookings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['restaurant', 'date', 'status']),
            models.Index(fields=['customer']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.booking_reference:
            import secrets
            import string
            alphabet = string.ascii_uppercase + string.digits
            self.booking_reference = 'BK-' + ''.join(secrets.choice(alphabet) for _ in range(8))
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.customer} - {self.restaurant.name} - {self.date}"


class DiningOffer(models.Model):
    """Special offers specifically for dining experience"""
    OFFER_TYPES = [
        ('WEEKDAY', 'Weekday Offer'),
        ('WEEKEND', 'Weekend Offer'),
        ('SPECIAL', 'Special Offer'),
        ('FESTIVE', 'Festive Offer'),
        ('HAPPY_HOUR', 'Happy Hour'),
        ('BIRTHDAY', 'Birthday Special'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='dining_offers')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    discount = models.CharField(max_length=100)  # "20% OFF", "Free Dessert", etc.
    type = models.CharField(max_length=20, choices=OFFER_TYPES)
    
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    terms_conditions = models.TextField(blank=True)
    minimum_spend = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dining_offers'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.restaurant.name} - {self.title}"


class DiningPromotion(models.Model):
    """Promotional campaigns for dining"""
    PROMOTION_TYPES = [
        ('FLASH_SALE', 'Flash Sale'),
        ('FESTIVE', 'Festive Offer'),
        ('LOYALTY', 'Loyalty Program'),
        ('REFERRAL', 'Referral Offer'),
        ('NEW_USER', 'New User Offer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=PROMOTION_TYPES)
    
    image = models.URLField(max_length=500, null=True, blank=True)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    discount_type = models.CharField(max_length=10, choices=[('PERCENTAGE', 'Percentage'), ('FIXED', 'Fixed')])
    
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    applicable_restaurants = models.ManyToManyField(Restaurant, blank=True, related_name='promotions')
    minimum_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    priority = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'dining_promotions'
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return self.title