from rest_framework import serializers
from .models import Invoice, InvoiceItem, InvoiceSetting

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = '__all__'
        read_only_fields = ['id']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'invoice_number']
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()

class CreateInvoiceSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    notes = serializers.CharField(required=False, allow_null=True)

class InvoiceSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceSetting
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']