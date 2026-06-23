# apps/customers/serializers.py

from rest_framework import serializers
from apps.users.models import User
from apps.orders.models import Order, OrderItem
from .models import Address, Wishlist, CustomerReview, Wallet, WalletTransaction, Coupon, GiftCard, SavedCard, Feedback


class CustomerProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'middle_name', 'last_name',
            'full_name', 'mobile_number', 'profile_picture', 'role',
            'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'created_at']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class WishlistSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)
    product_image = serializers.CharField(source='product.image_url', read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_name', 'product_price', 'product_image', 'created_at']
        read_only_fields = ['id', 'created_at']


class CustomerReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    
    class Meta:
        model = CustomerReview
        fields = '__all__'
        read_only_fields = ['id', 'customer', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'product', 'product_name']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    restaurant_name = serializers.CharField(read_only=True)
    vendor_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 
            'order_number', 
            'restaurant_name', 
            'vendor_name',
            'subtotal', 
            'delivery_fee', 
            'tax_amount', 
            'discount_amount', 
            'total_amount',
            'status', 
            'payment_status', 
            'created_at', 
            'delivered_at', 
            'items'
        ]
        read_only_fields = [
            'id', 
            'order_number', 
            'restaurant_name', 
            'vendor_name',
            'subtotal', 
            'delivery_fee', 
            'tax_amount', 
            'discount_amount', 
            'total_amount',
            'status', 
            'payment_status', 
            'created_at', 
            'delivered_at'
        ]


class CustomerOrderSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField()
    
    class Meta:
        model = Order
        fields = [
            'id', 
            'order_number', 
            'total_amount', 
            'status', 
            'created_at',
            'items_count', 
            'restaurant_name', 
            'order_type'
        ]
        read_only_fields = [
            'id', 
            'order_number', 
            'total_amount', 
            'status', 
            'created_at', 
            'restaurant_name'
        ]


class CustomerOrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 
            'order_number', 
            'subtotal', 
            'delivery_fee', 
            'tax_amount',
            'discount_amount', 
            'total_amount', 
            'status', 
            'payment_status',
            'delivery_address', 
            'created_at', 
            'delivered_at',
            'order_type', 
            'restaurant_name', 
            'items'
        ]
        read_only_fields = [
            'id', 
            'order_number', 
            'subtotal', 
            'delivery_fee', 
            'tax_amount', 
            'discount_amount', 
            'total_amount', 
            'status', 
            'payment_status',
            'created_at', 
            'delivered_at'
        ]


class DashboardStatsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_orders = serializers.IntegerField()
    completed_orders = serializers.IntegerField()
    wishlist_count = serializers.IntegerField()
    address_count = serializers.IntegerField()
    recent_orders = serializers.ListField(child=serializers.DictField())


class AnalyticsSerializer(serializers.Serializer):
    monthly_spending = serializers.ListField(child=serializers.DictField())
    favorite_restaurants = serializers.ListField(child=serializers.DictField())
    total_orders = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)


class WalletSerializer(serializers.ModelSerializer):
    transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'total_added', 'total_spent', 'transactions', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_transactions(self, obj):
        return [{
            'id': str(tx.id),
            'amount': float(tx.amount),
            'type': tx.transaction_type,
            'description': tx.description,
            'created_at': tx.created_at
        } for tx in obj.transactions.all().order_by('-created_at')[:10]]


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id', 'amount', 'transaction_type', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value', 'description', 'valid_until', 'is_used']
        read_only_fields = ['id', 'code']


class GiftCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCard
        fields = ['id', 'card_number', 'balance', 'created_at', 'expires_at', 'is_active']
        read_only_fields = ['id', 'card_number', 'created_at']


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedCard
        fields = ['id', 'last_four', 'card_type', 'expiry_month', 'expiry_year', 'is_default']
        read_only_fields = ['id']


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'rating', 'comment', 'type', 'restaurant', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']