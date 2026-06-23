from rest_framework import serializers

class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_revenue = serializers.FloatField()
    total_revenue_change = serializers.FloatField()
    total_sales = serializers.IntegerField()
    total_sales_change = serializers.FloatField()
    total_profit = serializers.FloatField()
    total_profit_change = serializers.FloatField()
    active_users = serializers.IntegerField()
    active_users_change = serializers.FloatField()
    orders = serializers.IntegerField()
    orders_change = serializers.FloatField()
    active_vendors = serializers.IntegerField()
    active_delivery_partners = serializers.IntegerField()

class RevenueChartSerializer(serializers.Serializer):
    """Serializer for revenue chart data"""
    period = serializers.CharField()
    data = serializers.ListField(child=serializers.DictField())

class RegionWiseAnalysisSerializer(serializers.Serializer):
    """Serializer for region-wise analysis"""
    region = serializers.CharField()
    revenue = serializers.FloatField()
    profit = serializers.FloatField()
    percentage = serializers.FloatField()