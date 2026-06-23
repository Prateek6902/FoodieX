from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import SupportTicket, ChatMessage, Voucher, Subscription
from .services import AISupportService, AIGeneratedContentService, AIFoodImageGenerator
from .serializers import (
    SupportTicketSerializer, ChatMessageSerializer, 
    VoucherSerializer, SubscriptionSerializer
)
from apps.orders.models import Order


class SupportTicketCreateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        user = request.user
        ticket_type = request.data.get('ticket_type')
        description = request.data.get('description')
        order_id = request.data.get('order_id')
        images = request.data.get('images', [])
        
        if not ticket_type or not description:
            return Response({
                'success': False,
                'message': 'Ticket type and description are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get order if provided
        order = None
        if order_id:
            order = get_object_or_404(Order, id=order_id, customer_email=user.email)
        
        # Create ticket
        ticket = SupportTicket.objects.create(
            user=user,
            order=order,
            ticket_type=ticket_type,
            subject=request.data.get('subject', 'Support Request'),
            description=description,
            images=images
        )
        
        # AI Analysis
        ai_service = AISupportService(user, ticket_type, description, images, order)
        analysis = ai_service.analyze_complaint()
        
        # Store AI suggestions
        ticket.ai_suggestions = analysis
        ticket.save()
        
        # Generate AI response
        ai_response = ai_service.generate_response(analysis)
        
        # Create chat message
        chat_message = ChatMessage.objects.create(
            user=user,
            ticket=ticket,
            message_type='AI',
            content=ai_response
        )
        
        # Check if voucher should be generated
        voucher_data = None
        if analysis.get('voucher_eligible', True) and analysis.get('recommended_discount', 70) > 0:
            voucher = ai_service.generate_voucher(analysis.get('recommended_discount', 70))
            ticket.voucher_code = voucher['code']
            ticket.voucher_applied = True
            ticket.save()
            voucher_data = voucher
        
        # Check refund eligibility
        refund_data = None
        if order and analysis.get('refund_eligible', False):
            refund_eligibility = ai_service.check_refund_eligibility()
            if refund_eligibility['eligible']:
                ticket.refund_amount = refund_eligibility['amount']
                ticket.save()
                refund_data = refund_eligibility
        
        serializer = SupportTicketSerializer(ticket)
        
        return Response({
            'success': True,
            'message': 'Support ticket created successfully',
            'data': {
                'ticket': serializer.data,
                'ai_response': chat_message.content,
                'voucher': voucher_data,
                'refund_eligibility': refund_data
            }
        }, status=status.HTTP_201_CREATED)


class SupportTicketListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        tickets = SupportTicket.objects.filter(user=user).order_by('-created_at')
        serializer = SupportTicketSerializer(tickets, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class SupportTicketDetailView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, ticket_id):
        user = request.user
        ticket = get_object_or_404(SupportTicket, id=ticket_id, user=user)
        serializer = SupportTicketSerializer(ticket)
        return Response({
            'success': True,
            'data': serializer.data
        })


class ChatMessageListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, ticket_id):
        user = request.user
        ticket = get_object_or_404(SupportTicket, id=ticket_id, user=user)
        messages = ChatMessage.objects.filter(ticket=ticket).order_by('created_at')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class ChatMessageCreateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request, ticket_id):
        user = request.user
        ticket = get_object_or_404(SupportTicket, id=ticket_id, user=user)
        content = request.data.get('content')
        images = request.data.get('images', [])
        
        if not content:
            return Response({
                'success': False,
                'message': 'Content is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user message
        user_message = ChatMessage.objects.create(
            user=user,
            ticket=ticket,
            message_type='USER',
            content=content,
            images=images
        )
        
        # Generate AI response
        ai_service = AISupportService(
            user, 
            ticket.ticket_type, 
            content, 
            images, 
            ticket.order
        )
        
        analysis = ticket.ai_suggestions or ai_service.analyze_complaint()
        ai_response = ai_service.generate_response(analysis)
        
        # Create AI message
        ai_message = ChatMessage.objects.create(
            user=user,
            ticket=ticket,
            message_type='AI',
            content=ai_response
        )
        
        serializer = ChatMessageSerializer([user_message, ai_message], many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)


class VoucherApplyView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        user = request.user
        code = request.data.get('code')
        
        if not code:
            return Response({
                'success': False,
                'message': 'Voucher code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        voucher = get_object_or_404(Voucher, code=code, user=user, is_used=False)
        
        if voucher.valid_until < timezone.now():
            return Response({
                'success': False,
                'message': 'Voucher has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        voucher.is_used = True
        voucher.used_at = timezone.now()
        voucher.save()
        
        return Response({
            'success': True,
            'message': 'Voucher applied successfully',
            'data': {
                'discount_percentage': float(voucher.discount_percentage),
                'code': voucher.code
            }
        })


class VoucherListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        vouchers = Voucher.objects.filter(
            user=user, 
            is_used=False,
            valid_until__gte=timezone.now()
        ).order_by('valid_until')
        
        serializer = VoucherSerializer(vouchers, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class SubscriptionView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        subscription, created = Subscription.objects.get_or_create(user=user)
        serializer = SubscriptionSerializer(subscription)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def post(self, request):
        user = request.user
        plan = request.data.get('plan')
        
        if plan not in ['SILVER', 'GOLD', 'PLATINUM']:
            return Response({
                'success': False,
                'message': 'Invalid plan selected'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        subscription, created = Subscription.objects.get_or_create(user=user)
        subscription.plan = plan
        subscription.is_active = True
        subscription.start_date = timezone.now()
        
        # Set end date based on plan
        if plan == 'SILVER':
            subscription.end_date = timezone.now() + timezone.timedelta(days=30)
        elif plan == 'GOLD':
            subscription.end_date = timezone.now() + timezone.timedelta(days=30)
        elif plan == 'PLATINUM':
            subscription.end_date = timezone.now() + timezone.timedelta(days=365)
        
        subscription.save()
        
        serializer = SubscriptionSerializer(subscription)
        return Response({
            'success': True,
            'message': f'Successfully subscribed to {plan} plan',
            'data': serializer.data
        })


class GenerateFoodDescriptionView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        food_name = request.data.get('food_name')
        cuisine = request.data.get('cuisine', '')
        ingredients = request.data.get('ingredients', [])
        
        if not food_name:
            return Response({
                'success': False,
                'message': 'Food name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        description = AIGeneratedContentService.generate_food_description(
            food_name, cuisine, ingredients
        )
        
        # Generate image
        image_prompt = f"{food_name} {cuisine} food dish beautifully plated"
        image_url = AIFoodImageGenerator.generate_image(image_prompt)
        
        if not image_url:
            image_url = AIFoodImageGenerator.get_default_food_image(food_name)
        
        return Response({
            'success': True,
            'data': {
                'description': description,
                'image_url': image_url
            }
        })


class GenerateFoodQuoteView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        quote = AIGeneratedContentService.generate_food_quote()
        return Response({
            'success': True,
            'data': {
                'quote': quote,
                'author': 'FoodieX AI'
            }
        })