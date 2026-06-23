from rest_framework import serializers
from .models import ContactQuery, ContactReply, FAQ, Feedback

class ContactReplySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    
    class Meta:
        model = ContactReply
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class ContactQuerySerializer(serializers.ModelSerializer):
    replies = ContactReplySerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    
    class Meta:
        model = ContactQuery
        fields = '__all__'
        read_only_fields = ['id', 'ticket_number', 'created_at', 'updated_at', 'resolved_at']

class CreateContactQuerySerializer(serializers.Serializer):
    query_type = serializers.ChoiceField(choices=ContactQuery.QUERY_TYPES)
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    subject = serializers.CharField(max_length=255)
    message = serializers.CharField()
    attachments = serializers.ListField(required=False, default=list)

class ReplyToQuerySerializer(serializers.Serializer):
    message = serializers.CharField()
    attachments = serializers.ListField(required=False, default=list)

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'views_count', 'helpful_count', 'not_helpful_count']

class FeedbackSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    responded_by_name = serializers.CharField(source='responded_by.full_name', read_only=True)
    
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'responded_at']

class CreateFeedbackSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    title = serializers.CharField(max_length=255)
    feedback = serializers.CharField()
    screenshot = serializers.URLField(required=False, allow_null=True)
    is_public = serializers.BooleanField(default=False)