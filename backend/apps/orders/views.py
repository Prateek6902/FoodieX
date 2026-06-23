from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import uuid
from .models import Order, OrderItem
from .serializers import OrderSerializer
from apps.restaurants.models import Restaurant, MenuItem
from django.db.models import Sum


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.all()
        
        # If user is customer, only show their orders
        if user.role.upper() == 'CUSTOMER':
            queryset = queryset.filter(customer_email=user.email)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        user = request.user
        
        # Get data from request
        restaurant_id = request.data.get('restaurant_id')
        items_data = request.data.get('items', [])
        delivery_address = request.data.get('delivery_address', {})
        order_type = request.data.get('order_type', 'delivery')
        payment_method = request.data.get('payment_method', 'COD')
        delivery_notes = request.data.get('delivery_notes', '')
        
        # Validate
        if not restaurant_id:
            return Response({
                'success': False,
                'message': 'Restaurant ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not items_data:
            return Response({
                'success': False,
                'message': 'Items are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get restaurant
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Restaurant not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate totals
        subtotal = Decimal('0')
        order_items = []
        
        with transaction.atomic():
            for item_data in items_data:
                product_id = item_data.get('product_id')
                quantity = item_data.get('quantity', 1)
                
                try:
                    menu_item = MenuItem.objects.get(id=product_id, restaurant=restaurant)
                except MenuItem.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': f'Item {product_id} not found'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                price = menu_item.price
                total_price = price * quantity
                subtotal += total_price
                
                order_items.append({
                    'menu_item': menu_item,
                    'quantity': quantity,
                    'unit_price': price,
                    'total_price': total_price
                })
            
            # Calculate delivery fee and tax
            delivery_fee = Decimal('40') if order_type == 'delivery' else Decimal('0')
            tax_amount = (subtotal * Decimal('0.05')).quantize(Decimal('0.01'))
            total_amount = subtotal + delivery_fee + tax_amount
            
            # Generate order number
            order_number = f"ORD-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            
            # Prepare delivery address
            if order_type == 'delivery':
                if not delivery_address or not delivery_address.get('address'):
                    return Response({
                        'success': False,
                        'message': 'Delivery address is required for delivery orders'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                delivery_address = {
                    'address': 'Takeaway - No delivery address',
                    'city': '',
                    'state': '',
                    'pincode': ''
                }
            
            # Create the order with customer_email
            order = Order.objects.create(
                id=uuid.uuid4(),
                order_number=order_number,
                customer_name=user.full_name or user.email,
                customer_email=user.email,
                customer_phone=getattr(user, 'mobile_number', ''),
                restaurant_name=restaurant.name,
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                tax_amount=tax_amount,
                discount_amount=Decimal('0'),
                total_amount=total_amount,
                status='pending',
                payment_status='pending',
                payment_method=payment_method,
                delivery_address=delivery_address,
                delivery_notes=delivery_notes,
                region=restaurant.city or 'Unknown',
                created_at=timezone.now()
            )
            
            # Create order items - FIXED: removed 'product_id' field
            for item in order_items:
                OrderItem.objects.create(
                    id=uuid.uuid4(),
                    order=order,
                    product_name=item['menu_item'].name,  # Use product_name instead of product_id
                    quantity=item['quantity'],
                    unit_price=item['unit_price'],
                    total_price=item['total_price']
                )
            
            serializer = self.get_serializer(order)
            
            return Response({
                'success': True,
                'message': 'Order placed successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get order statistics"""
        user = request.user
        
        # For customers, show their own stats
        if user.role.upper() == 'CUSTOMER':
            orders = Order.objects.filter(customer_email=user.email)
        else:
            orders = Order.objects.all()
        
        today = timezone.now().date()
        week_ago = today - timezone.timedelta(days=7)
        
        stats = {
            'total_orders': orders.count(),
            'pending_orders': orders.filter(status='pending').count(),
            'delivered_orders': orders.filter(status='delivered').count(),
            'today_orders': orders.filter(created_at__date=today).count(),
            'week_orders': orders.filter(created_at__date__gte=week_ago).count(),
            'total_revenue': float(orders.filter(status='delivered').aggregate(total=Sum('total_amount'))['total'] or 0),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        try:
            order = self.get_object()
            user = request.user
            
            # Check if user owns this order
            if user.role.upper() == 'CUSTOMER' and order.customer_email != user.email:
                return Response({
                    'success': False,
                    'message': 'You can only cancel your own orders'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if order.status not in ['pending', 'confirmed']:
                return Response({
                    'success': False,
                    'message': f'Order cannot be cancelled in {order.status} status'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            order.status = 'cancelled'
            order.save()
            
            return Response({
                'success': True,
                'message': 'Order cancelled successfully'
            })
        except Order.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def track(self, request, pk=None):
        """Track order status"""
        try:
            order = self.get_object()
            user = request.user
            
            # Check if user owns this order
            if user.role.upper() == 'CUSTOMER' and order.customer_email != user.email:
                return Response({
                    'success': False,
                    'message': 'You can only track your own orders'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Define tracking statuses
            tracking_statuses = {
                'pending': {'label': 'Order Placed', 'icon': 'package'},
                'confirmed': {'label': 'Order Confirmed', 'icon': 'check'},
                'preparing': {'label': 'Preparing Your Food', 'icon': 'cook'},
                'ready': {'label': 'Ready for Pickup/Delivery', 'icon': 'bell'},
                'out_for_delivery': {'label': 'Out for Delivery', 'icon': 'truck'},
                'delivered': {'label': 'Delivered', 'icon': 'home'}
            }
            
            status_history = []
            status_order = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
            current_index = status_order.index(order.status) if order.status in status_order else 0
            
            for idx, status_key in enumerate(status_order):
                status_history.append({
                    'status': status_key,
                    'label': tracking_statuses.get(status_key, {}).get('label', status_key),
                    'completed': idx <= current_index,
                    'is_current': idx == current_index
                })
            
            return Response({
                'success': True,
                'data': {
                    'order_id': str(order.id),
                    'order_number': order.order_number,
                    'status': order.status,
                    'status_history': status_history,
                    'created_at': order.created_at,
                    'delivered_at': order.delivered_at if hasattr(order, 'delivered_at') else None
                }
            })
        except Order.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)