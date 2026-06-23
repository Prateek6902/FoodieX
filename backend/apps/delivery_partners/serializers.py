from rest_framework import serializers
from .models import DeliveryProfile, DeliveryZone, DeliveryAssignment, DeliveryEarning, DeliveryPerformance, DeliveryIncident, DeliveryNotification

class DeliveryProfileSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = DeliveryProfile
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'total_deliveries', 'total_earnings', 'rating']
    
    def get_user_details(self, obj):
        if obj.user:
            return {
                'email': obj.user.email,
                'username': obj.user.username,
            }
        return None


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class DeliveryAssignmentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer_name', read_only=True)
    
    class Meta:
        model = DeliveryAssignment
        fields = '__all__'
        read_only_fields = ['id', 'assigned_at']


class DeliveryEarningSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    partner_name = serializers.CharField(source='delivery_partner.full_name', read_only=True)
    
    class Meta:
        model = DeliveryEarning
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class DeliveryPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPerformance
        fields = '__all__'
        read_only_fields = ['id', 'last_updated']


class DeliveryIncidentSerializer(serializers.ModelSerializer):
    partner_name = serializers.CharField(source='delivery_partner.full_name', read_only=True)
    
    class Meta:
        model = DeliveryIncident
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class DeliveryNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryNotification
        fields = '__all__'
        read_only_fields = ['id', 'created_at']