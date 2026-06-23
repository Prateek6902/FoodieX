from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Restaurant, MenuItem, RestaurantCategory, RestaurantOffer, 
    RestaurantReview, RestaurantBooking, DiningOffer, DiningPromotion
)


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'vendor', 'cuisine_type', 'city', 'rating', 'is_active', 'has_dining', 'is_featured']
    list_filter = ['status', 'is_active', 'is_featured', 'has_dining', 'dining_type', 'city', 'is_veg']
    search_fields = ['name', 'cuisine_type', 'city', 'address_line1']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total_orders', 'total_revenue']
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'vendor', 'name', 'description', 'cuisine_type')
        }),
        ('Contact', {
            'fields': ('phone_number', 'email', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude')
        }),
        ('Media', {
            'fields': ('logo', 'logo_url', 'cover_image', 'cover_image_url', 'gallery_images')
        }),
        ('Status', {
            'fields': ('status', 'is_active', 'is_featured')
        }),
        ('Ratings', {
            'fields': ('rating', 'total_reviews')
        }),
        ('Timing', {
            'fields': ('opening_time', 'closing_time', 'is_open_24_7')
        }),
        ('Delivery', {
            'fields': ('minimum_order_amount', 'delivery_radius_km', 'delivery_charge', 'is_delivery_available', 'is_takeaway_available')
        }),
        ('Dining', {
            'fields': ('has_dining', 'dining_type', 'seating_capacity', 'is_veg', 'outdoor_seating', 'parking_available',
                      'wifi_available', 'music_available', 'pet_friendly', 'serves_alcohol', 'has_live_music',
                      'has_private_dining', 'has_booking_system', 'accepts_reservations', 'dress_code', 'special_diets', 'ambiance')
        }),
        ('Statistics', {
            'fields': ('total_orders', 'total_revenue')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'category', 'price', 'is_available', 'is_veg', 'is_recommended']
    list_filter = ['is_available', 'is_veg', 'is_recommended', 'restaurant', 'category']
    search_fields = ['name', 'description', 'restaurant__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total_sold']


@admin.register(RestaurantCategory)
class RestaurantCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'display_order', 'is_active']
    list_filter = ['is_active', 'restaurant']
    search_fields = ['name', 'restaurant__name']


@admin.register(RestaurantOffer)
class RestaurantOfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'restaurant', 'discount_type', 'discount_value', 'valid_from', 'valid_to', 'is_active']
    list_filter = ['is_active', 'discount_type', 'restaurant']
    search_fields = ['title', 'restaurant__name']


@admin.register(RestaurantReview)
class RestaurantReviewAdmin(admin.ModelAdmin):
    list_display = ['restaurant', 'customer', 'rating', 'comment_preview', 'created_at']
    list_filter = ['rating', 'restaurant']
    search_fields = ['restaurant__name', 'customer__email', 'comment']
    readonly_fields = ['id', 'created_at']
    
    def comment_preview(self, obj):
        return obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
    comment_preview.short_description = 'Comment'


@admin.register(RestaurantBooking)
class RestaurantBookingAdmin(admin.ModelAdmin):
    list_display = ['booking_reference', 'restaurant', 'customer', 'date', 'time', 'party_size', 'status']
    list_filter = ['status', 'date', 'restaurant']
    search_fields = ['booking_reference', 'customer__email', 'restaurant__name']


@admin.register(DiningOffer)
class DiningOfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'restaurant', 'type', 'discount', 'valid_to', 'is_active']
    list_filter = ['type', 'is_active', 'restaurant']
    search_fields = ['title', 'restaurant__name']


@admin.register(DiningPromotion)
class DiningPromotionAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'discount_value', 'valid_from', 'valid_to', 'is_active']
    list_filter = ['type', 'is_active']
    search_fields = ['title', 'description']