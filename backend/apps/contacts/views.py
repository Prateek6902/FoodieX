from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
import uuid
from .models import ContactQuery, ContactReply, FAQ, Feedback
from .serializers import (
    ContactQuerySerializer, CreateContactQuerySerializer, ReplyToQuerySerializer,
    FAQSerializer, FeedbackSerializer, CreateFeedbackSerializer
)
from core.permissions.role_permissions import IsAdmin, IsSuperAdmin

class CreateContactQueryView(APIView):
    """Create a new contact query"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = CreateContactQuerySerializer(data=request.data)
        if serializer.is_valid():
            # Generate ticket number
            ticket_number = f"TKT-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            
            query = ContactQuery.objects.create(
                ticket_number=ticket_number,
                query_type=serializer.validated_data['query_type'],
                name=serializer.validated_data['name'],
                email=serializer.validated_data['email'],
                phone=serializer.validated_data['phone'],
                subject=serializer.validated_data['subject'],
                message=serializer.validated_data['message'],
                attachments=serializer.validated_data.get('attachments', []),
                customer=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'success': True,
                'message': 'Your query has been submitted successfully',
                'data': {
                    'ticket_number': ticket_number,
                    'ticket_id': str(query.id)
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ContactQueryListView(APIView):
    """List all contact queries (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request):
        queries = ContactQuery.objects.all().order_by('-created_at')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            queries = queries.filter(status=status_filter)
        
        # Filter by query type
        query_type = request.query_params.get('query_type')
        if query_type:
            queries = queries.filter(query_type=query_type)
        
        serializer = ContactQuerySerializer(queries, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class ContactQueryDetailView(APIView):
    """Get contact query details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, query_id):
        query = get_object_or_404(ContactQuery, id=query_id)
        
        # Check permission
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN']:
            if query.customer != request.user and query.email != request.user.email:
                return Response({
                    'success': False,
                    'message': 'You don\'t have permission to view this query'
                }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ContactQuerySerializer(query)
        return Response({
            'success': True,
            'data': serializer.data
        })

class ReplyToQueryView(APIView):
    """Reply to a contact query (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def post(self, request, query_id):
        query = get_object_or_404(ContactQuery, id=query_id)
        serializer = ReplyToQuerySerializer(data=request.data)
        
        if serializer.is_valid():
            reply = ContactReply.objects.create(
                query=query,
                user=request.user,
                message=serializer.validated_data['message'],
                attachments=serializer.validated_data.get('attachments', []),
                is_staff_reply=True
            )
            
            # Update query status
            query.status = 'IN_PROGRESS'
            query.save()
            
            reply_serializer = ContactReplySerializer(reply)
            return Response({
                'success': True,
                'message': 'Reply sent successfully',
                'data': reply_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ResolveQueryView(APIView):
    """Mark query as resolved (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def post(self, request, query_id):
        query = get_object_or_404(ContactQuery, id=query_id)
        resolution_notes = request.data.get('resolution_notes', '')
        
        query.status = 'RESOLVED'
        query.resolution_notes = resolution_notes
        query.resolved_at = timezone.now()
        query.save()
        
        return Response({
            'success': True,
            'message': 'Query marked as resolved'
        })

class FAQListView(APIView):
    """List FAQs"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        category = request.query_params.get('category')
        faqs = FAQ.objects.filter(is_active=True)
        
        if category:
            faqs = faqs.filter(category=category)
        
        serializer = FAQSerializer(faqs, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class FAQDetailView(APIView):
    """Get FAQ details"""
    permission_classes = [AllowAny]
    
    def get(self, request, faq_id):
        faq = get_object_or_404(FAQ, id=faq_id, is_active=True)
        
        # Increment view count
        faq.views_count += 1
        faq.save()
        
        serializer = FAQSerializer(faq)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def post(self, request, faq_id):
        """Mark FAQ as helpful/not helpful"""
        faq = get_object_or_404(FAQ, id=faq_id, is_active=True)
        is_helpful = request.data.get('is_helpful', True)
        
        if is_helpful:
            faq.helpful_count += 1
        else:
            faq.not_helpful_count += 1
        faq.save()
        
        return Response({
            'success': True,
            'message': 'Thank you for your feedback'
        })

class CreateFeedbackView(APIView):
    """Create feedback"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = CreateFeedbackSerializer(data=request.data)
        if serializer.is_valid():
            feedback = Feedback.objects.create(
                name=request.data.get('name', 'Anonymous'),
                email=request.data.get('email', 'anonymous@example.com'),
                rating=serializer.validated_data['rating'],
                title=serializer.validated_data['title'],
                feedback=serializer.validated_data['feedback'],
                screenshot=serializer.validated_data.get('screenshot'),
                is_public=serializer.validated_data.get('is_public', False),
                user=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'success': True,
                'message': 'Thank you for your feedback!',
                'data': FeedbackSerializer(feedback).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class FeedbackListView(APIView):
    """List public feedbacks"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        feedbacks = Feedback.objects.filter(is_public=True).order_by('-created_at')
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })