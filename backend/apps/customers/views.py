from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from apps.users.models import User
from apps.orders.models import Order, OrderItem
from apps.restaurants.models import Restaurant
from .models import (
    Address, Wishlist, CustomerReview, 
    Wallet, WalletTransaction, Coupon, 
    GiftCard, SavedCard, Feedback
)
from .serializers import (
    CustomerProfileSerializer, AddressSerializer, WishlistSerializer,
    CustomerReviewSerializer, OrderSerializer, CustomerOrderDetailSerializer,
    WalletSerializer, CouponSerializer,
    GiftCardSerializer, PaymentMethodSerializer, FeedbackSerializer
)


# ==================== PROFILE VIEWS ====================

class CustomerProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        if user.role.lower() != 'customer':
            return Response({
                'success': False,
                'message': 'Access denied. Customer only.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CustomerProfileSerializer(user)
        return Response({
            'success': True,
            'data': serializer.data
        })


class UpdateCustomerProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def put(self, request):
        user = request.user
        if user.role.lower() != 'customer':
            return Response({
                'success': False,
                'message': 'Access denied. Customer only.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CustomerProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== ADDRESS VIEWS ====================

class AddressListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        addresses = Address.objects.filter(user=user).order_by('-is_default', '-created_at')
        serializer = AddressSerializer(addresses, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class AddressCreateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        user = request.user
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response({
                'success': True,
                'message': 'Address created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, address_id):
        user = request.user
        address = get_object_or_404(Address, id=address_id, user=user)
        serializer = AddressSerializer(address)
        return Response({
            'success': True,
            'data': serializer.data
        })


class AddressUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def put(self, request, address_id):
        user = request.user
        address = get_object_or_404(Address, id=address_id, user=user)
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Address updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AddressDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def delete(self, request, address_id):
        user = request.user
        address = get_object_or_404(Address, id=address_id, user=user)
        address.delete()
        return Response({
            'success': True,
            'message': 'Address deleted successfully'
        })


class SetDefaultAddressView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request, address_id):
        user = request.user
        address = get_object_or_404(Address, id=address_id, user=user)
        Address.objects.filter(user=user).update(is_default=False)
        address.is_default = True
        address.save()
        
        return Response({
            'success': True,
            'message': 'Default address updated successfully'
        })


# ==================== WISHLIST VIEWS ====================

class WishlistView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        wishlist = Wishlist.objects.filter(user=user).select_related('product')
        serializer = WishlistSerializer(wishlist, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class AddToWishlistView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request, product_id):
        user = request.user
        from apps.products.models import Product
        product = get_object_or_404(Product, id=product_id)
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=user,
            product=product
        )
        
        if created:
            return Response({
                'success': True,
                'message': 'Product added to wishlist'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': 'Product already in wishlist'
            }, status=status.HTTP_400_BAD_REQUEST)


class RemoveFromWishlistView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def delete(self, request, product_id):
        user = request.user
        from apps.products.models import Product
        product = get_object_or_404(Product, id=product_id)
        Wishlist.objects.filter(user=user, product=product).delete()
        
        return Response({
            'success': True,
            'message': 'Product removed from wishlist'
        })


class ClearWishlistView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def delete(self, request):
        user = request.user
        Wishlist.objects.filter(user=user).delete()
        return Response({
            'success': True,
            'message': 'Wishlist cleared successfully'
        })


# ==================== ORDER VIEWS ====================

class CustomerOrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        orders = Order.objects.filter(customer_email=user.email).order_by('-created_at')
        
        # Manual serialization to ensure data is returned
        data = []
        for order in orders:
            items_count = order.order_items.count() if hasattr(order, 'order_items') else 0
            data.append({
                'id': str(order.id),
                'order_number': order.order_number,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'created_at': order.created_at,
                'items_count': items_count,
                'restaurant_name': order.restaurant_name,
                'order_type': getattr(order, 'order_type', 'delivery')
            })
        
        return Response({
            'success': True,
            'data': data
        })


class CustomerOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, order_id):
        user = request.user
        
        try:
            order = Order.objects.get(id=order_id, customer_email=user.email)
        except Order.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get order items
        items = []
        for item in order.order_items.all():
            items.append({
                'product_id': str(item.product_id) if hasattr(item, 'product_id') else None,
                'product_name': item.product_name,
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'total_price': float(item.total_price)
            })
        
        data = {
            'id': str(order.id),
            'order_number': order.order_number,
            'subtotal': float(order.subtotal),
            'delivery_fee': float(order.delivery_fee),
            'tax_amount': float(order.tax_amount),
            'discount_amount': float(order.discount_amount),
            'total_amount': float(order.total_amount),
            'status': order.status,
            'payment_status': order.payment_status,
            'delivery_address': order.delivery_address,
            'created_at': order.created_at,
            'delivered_at': order.delivered_at if hasattr(order, 'delivered_at') else None,
            'order_type': getattr(order, 'order_type', 'delivery'),
            'restaurant_name': order.restaurant_name,
            'items': items
        }
        
        return Response({
            'success': True,
            'data': data
        })


class TrackOrderView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, order_id):
        user = request.user
        order = get_object_or_404(Order, id=order_id, customer_email=user.email)
        
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


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request, order_id):
        user = request.user
        order = get_object_or_404(Order, id=order_id, customer_email=user.email)
        
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


# ==================== REVIEW VIEWS ====================

# apps/customers/views.py - Add these review views

class CustomerReviewsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        reviews = CustomerReview.objects.filter(customer=user).order_by('-created_at')
        serializer = CustomerReviewSerializer(reviews, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class CreateReviewView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        user = request.user
        
        order_id = request.data.get('order_id')
        product_id = request.data.get('product_id')
        restaurant_id = request.data.get('restaurant_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment')
        
        # Validate
        if not order_id:
            return Response({
                'success': False,
                'message': 'order_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not rating:
            return Response({
                'success': False,
                'message': 'Rating is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if order exists and belongs to user
        try:
            order = Order.objects.get(id=order_id, customer_email=user.email)
        except Order.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Only delivered orders can be reviewed
        if order.status != 'delivered':
            return Response({
                'success': False,
                'message': 'You can only review delivered orders'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already reviewed
        if CustomerReview.objects.filter(order=order, customer=user).exists():
            return Response({
                'success': False,
                'message': 'You have already reviewed this order'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create review data
        review_data = {
            'customer': user,
            'order': order,
            'rating': rating,
            'comment': comment or '',
            'is_verified_purchase': True
        }
        
        # Add product or restaurant if provided
        if product_id:
            try:
                from apps.products.models import Product
                product = Product.objects.get(id=product_id)
                review_data['product'] = product
            except:
                pass
        elif restaurant_id:
            try:
                restaurant = Restaurant.objects.get(id=restaurant_id)
                review_data['restaurant'] = restaurant
            except:
                pass
        
        # Create review
        review = CustomerReview.objects.create(**review_data)
        serializer = CustomerReviewSerializer(review)
        
        # Update restaurant rating
        if restaurant_id:
            try:
                restaurant = Restaurant.objects.get(id=restaurant_id)
                avg_rating = CustomerReview.objects.filter(
                    restaurant=restaurant
                ).aggregate(avg=Avg('rating'))['avg']
                if avg_rating:
                    restaurant.rating = avg_rating
                    restaurant.save()
            except:
                pass
        
        return Response({
            'success': True,
            'message': 'Review created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)


class UpdateReviewView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def put(self, request, review_id):
        user = request.user
        
        try:
            review = CustomerReview.objects.get(id=review_id, customer=user)
        except CustomerReview.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Review not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        days_since_created = (timezone.now() - review.created_at).days
        if days_since_created > 7:
            return Response({
                'success': False,
                'message': 'Reviews can only be edited within 7 days of creation'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        rating = request.data.get('rating')
        comment = request.data.get('comment')
        
        if rating:
            review.rating = rating
        if comment is not None:
            review.comment = comment
        
        review.save()
        
        # Update restaurant rating if review is for a restaurant
        if review.restaurant:
            avg_rating = CustomerReview.objects.filter(
                restaurant=review.restaurant
            ).aggregate(avg=Avg('rating'))['avg']
            if avg_rating:
                review.restaurant.rating = avg_rating
                review.restaurant.save()
        
        serializer = CustomerReviewSerializer(review)
        return Response({
            'success': True,
            'message': 'Review updated successfully',
            'data': serializer.data
        })


class DeleteReviewView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def delete(self, request, review_id):
        user = request.user
        
        try:
            review = CustomerReview.objects.get(id=review_id, customer=user)
        except CustomerReview.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Review not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        restaurant = review.restaurant
        review.delete()
        
        # Update restaurant rating
        if restaurant:
            avg_rating = CustomerReview.objects.filter(
                restaurant=restaurant
            ).aggregate(avg=Avg('rating'))['avg']
            if avg_rating:
                restaurant.rating = avg_rating
            else:
                restaurant.rating = 0
            restaurant.save()
        
        return Response({
            'success': True,
            'message': 'Review deleted successfully'
        })


# ==================== DASHBOARD VIEWS ====================

class CustomerDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        
        orders = Order.objects.filter(customer_email=user.email)
        total_orders = orders.count()
        total_spent = orders.aggregate(total=Sum('total_amount'))['total'] or 0
        pending_orders = orders.filter(status__in=['pending', 'confirmed', 'preparing']).count()
        completed_orders = orders.filter(status='delivered').count()
        
        recent_orders = orders.order_by('-created_at')[:5]
        wishlist_count = Wishlist.objects.filter(user=user).count()
        address_count = Address.objects.filter(user=user).count()
        
        recent_orders_data = []
        for order in recent_orders:
            recent_orders_data.append({
                'id': str(order.id),
                'order_number': order.order_number,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'created_at': order.created_at
            })
        
        return Response({
            'success': True,
            'data': {
                'total_orders': total_orders,
                'total_spent': float(total_spent),
                'pending_orders': pending_orders,
                'completed_orders': completed_orders,
                'wishlist_count': wishlist_count,
                'address_count': address_count,
                'recent_orders': recent_orders_data
            }
        })


class CustomerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        
        # Monthly spending for last 6 months
        monthly_spending = []
        for i in range(5, -1, -1):
            month_date = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_start = month_date.replace(day=1)
            if i == 0:
                month_end = timezone.now()
            else:
                next_month = month_start + timedelta(days=32)
                month_end = next_month.replace(day=1) - timedelta(days=1)
            
            month_orders = Order.objects.filter(
                customer_email=user.email,
                status='delivered',
                created_at__date__gte=month_start.date(),
                created_at__date__lte=month_end.date()
            )
            total = month_orders.aggregate(total=Sum('total_amount'))['total'] or 0
            count = month_orders.count()
            
            monthly_spending.append({
                'month': month_start.strftime('%b %Y'),
                'total': float(total),
                'count': count
            })
        
        # Favorite restaurants
        favorite_restaurants = Order.objects.filter(
            customer_email=user.email,
            status='delivered'
        ).values('restaurant_name').annotate(
            order_count=Count('id'),
            total_spent=Sum('total_amount')
        ).order_by('-order_count')[:5]
        
        # Total stats
        orders = Order.objects.filter(customer_email=user.email)
        total_orders = orders.count()
        total_spent = orders.aggregate(total=Sum('total_amount'))['total'] or 0
        average_order_value = float(total_spent / total_orders) if total_orders > 0 else 0
        
        return Response({
            'success': True,
            'data': {
                'monthly_spending': monthly_spending,
                'favorite_restaurants': list(favorite_restaurants),
                'total_orders': total_orders,
                'total_spent': float(total_spent),
                'average_order_value': average_order_value
            }
        })


# ==================== WALLET VIEWS ====================

class WalletView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        # Get wallet from user or create one
        wallet, created = Wallet.objects.get_or_create(user=user)
        serializer = WalletSerializer(wallet)
        return Response({
            'success': True,
            'data': serializer.data
        })


class AddToWalletView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        user = request.user
        amount = request.data.get('amount', 0)
        
        try:
            amount = Decimal(str(amount))
        except:
            return Response({
                'success': False,
                'message': 'Invalid amount'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if amount <= 0:
            return Response({
                'success': False,
                'message': 'Amount must be greater than 0'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        wallet, created = Wallet.objects.get_or_create(user=user)
        wallet.balance += amount
        wallet.total_added += amount
        wallet.save()
        
        # Create transaction
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=amount,
            transaction_type='CREDIT',
            description=f'Added ₹{amount} to wallet'
        )
        
        return Response({
            'success': True,
            'message': f'₹{amount} added to wallet successfully',
            'data': {'balance': float(wallet.balance)}
        })


class WalletTransactionsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        wallet = get_object_or_404(Wallet, user=user)
        transactions = wallet.transactions.all().order_by('-created_at')
        
        data = []
        for tx in transactions:
            data.append({
                'id': str(tx.id),
                'amount': float(tx.amount),
                'type': tx.transaction_type,
                'description': tx.description,
                'created_at': tx.created_at
            })
        
        return Response({
            'success': True,
            'data': data
        })


# ==================== COUPON VIEWS ====================

class CouponListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        coupons = Coupon.objects.filter(
            user=user,
            is_used=False,
            valid_until__gte=timezone.now()
        ).order_by('valid_until')
        
        serializer = CouponSerializer(coupons, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class ApplyCouponView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        user = request.user
        code = request.data.get('code')
        order_amount = request.data.get('order_amount', 0)
        
        if not code:
            return Response({
                'success': False,
                'message': 'Coupon code is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code, user=user, is_used=False)
        except Coupon.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Invalid coupon code'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if coupon.valid_until < timezone.now():
            return Response({
                'success': False,
                'message': 'Coupon has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate discount
        try:
            order_amount = Decimal(str(order_amount))
        except:
            order_amount = Decimal('0')
        
        discount = Decimal('0')
        if coupon.discount_type == 'PERCENTAGE':
            discount = (order_amount * coupon.discount_value) / 100
        else:
            discount = coupon.discount_value
        
        # Cap discount at order amount
        if discount > order_amount:
            discount = order_amount
        
        return Response({
            'success': True,
            'message': 'Coupon applied successfully',
            'data': {
                'discount': float(discount),
                'coupon_code': coupon.code
            }
        })


# ==================== FEEDBACK VIEWS ====================

class FeedbackCreateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def post(self, request):
        user = request.user
        serializer = FeedbackSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user=user)
            return Response({
                'success': True,
                'message': 'Feedback submitted successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class FeedbackListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        feedbacks = Feedback.objects.filter(user=user).order_by('-created_at')
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })