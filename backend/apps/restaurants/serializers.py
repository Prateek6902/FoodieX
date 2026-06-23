from rest_framework import serializers
from django.utils import timezone
from .models import (
    Restaurant, MenuItem, RestaurantCategory, RestaurantOffer, 
    RestaurantReview, RestaurantBooking, DiningOffer, DiningPromotion
)


class RestaurantSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)
    is_open_now = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()
    dining_type_display = serializers.CharField(source='get_dining_type_display', read_only=True)
    total_offers = serializers.SerializerMethodField()
    is_offering = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = '__all__'
        read_only_fields = ['id', 'vendor', 'created_at', 'updated_at', 'rating', 'total_reviews', 'total_orders', 'total_revenue']
    
    def get_is_open_now(self, obj):
        return obj.is_open_now()
    
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return obj.logo_url
    
    def get_cover_image_url(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return obj.cover_image_url
    
    def get_total_offers(self, obj):
        now = timezone.now()
        return obj.offers.filter(
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        ).count()
    
    def get_is_offering(self, obj):
        now = timezone.now()
        return obj.offers.filter(
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        ).exists()
    
    def get_discount(self, obj):
        now = timezone.now()
        offer = obj.offers.filter(
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        ).first()
        if offer:
            return f"{offer.discount_value}% OFF" if offer.discount_type == 'PERCENTAGE' else f"₹{offer.discount_value} OFF"
        return None


class MenuItemSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    price_display = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_sold']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'category': {'required': False, 'allow_blank': True},
            'preparation_time': {'required': False},
            'image': {'required': False, 'allow_blank': True},
            'is_veg': {'required': False},
            'is_recommended': {'required': False},
            'is_spicy': {'required': False},
            'calories': {'required': False},
            'dietary_info': {'required': False},
            'ingredients': {'required': False},
            'allergens': {'required': False},
            'discount_price': {'required': False},
            'discount_percentage': {'required': False},
        }
    
    def get_price_display(self, obj):
        if obj.discount_price and obj.discount_price < obj.price:
            return f"₹{obj.discount_price} (was ₹{obj.price})"
        return f"₹{obj.price}"


class RestaurantCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantCategory
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class RestaurantOfferSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = RestaurantOffer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        return obj.is_valid_now()


class RestaurantReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_avatar = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    
    class Meta:
        model = RestaurantReview
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_customer_avatar(self, obj):
        if obj.customer and hasattr(obj.customer, 'avatar'):
            return obj.customer.avatar
        return None
    
    def get_formatted_date(self, obj):
        return obj.created_at.strftime('%B %d, %Y')


class RestaurantBookingSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    customer_name_display = serializers.CharField(source='customer.full_name', read_only=True)
    
    class Meta:
        model = RestaurantBooking
        fields = '__all__'
        read_only_fields = ['id', 'booking_reference', 'created_at', 'updated_at']


class DiningOfferSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = DiningOffer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        now = timezone.now()
        return obj.is_active and obj.valid_from <= now <= obj.valid_to


class DiningPromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiningPromotion
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class RestaurantDetailSerializer(RestaurantSerializer):
    """Detailed restaurant serializer with nested data"""
    menu_items = MenuItemSerializer(many=True, read_only=True)
    categories = RestaurantCategorySerializer(many=True, read_only=True)
    offers = RestaurantOfferSerializer(many=True, read_only=True)
    dining_offers = DiningOfferSerializer(many=True, read_only=True)
    recent_reviews = serializers.SerializerMethodField()
    
    class Meta(RestaurantSerializer.Meta):
        # Since RestaurantSerializer.Meta.fields = '__all__', we need to explicitly list fields
        fields = [
            'id', 'vendor', 'vendor_name', 'name', 'description', 'cuisine_type',
            'phone_number', 'email', 'address_line1', 'address_line2', 'city', 
            'state', 'postal_code', 'country', 'latitude', 'longitude',
            'logo', 'logo_url', 'cover_image', 'cover_image_url', 'gallery_images',
            'status', 'is_active', 'is_featured', 'rating', 'total_reviews',
            'opening_time', 'closing_time', 'is_open_24_7',
            'minimum_order_amount', 'delivery_radius_km', 'delivery_charge', 
            'is_delivery_available', 'is_takeaway_available',
            'has_dining', 'dining_type', 'dining_type_display', 'seating_capacity',
            'is_veg', 'outdoor_seating', 'parking_available', 'wifi_available',
            'music_available', 'pet_friendly', 'serves_alcohol', 'has_live_music',
            'has_private_dining', 'has_booking_system', 'accepts_reservations',
            'dress_code', 'special_diets', 'ambiance',
            'total_orders', 'total_revenue',
            'created_at', 'updated_at',
            'is_open_now', 'total_offers', 'is_offering', 'discount',
            'menu_items', 'categories', 'offers', 'dining_offers', 'recent_reviews'
        ]
    
    def get_recent_reviews(self, obj):
        reviews = obj.reviews.filter(is_public=True).order_by('-created_at')[:5]
        return RestaurantReviewSerializer(reviews, many=True).data