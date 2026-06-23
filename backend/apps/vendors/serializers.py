from rest_framework import serializers
from .models import Vendor, VendorDocument, VendorPayout, VendorReview
from apps.users.models import User

class VendorSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = '__all__'
        read_only_fields = ['id', 'joined_date', 'approved_at', 'rating', 'total_reviews', 'total_revenue', 'total_orders']
    
    def get_user_details(self, obj):
        return {
            'email': obj.user.email,
            'full_name': obj.user.full_name,
            'mobile_number': obj.user.mobile_number,
        }
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class VendorDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorDocument
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'is_verified', 'verified_at']

class VendorReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    
    class Meta:
        model = VendorReview
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'vendor', 'customer']