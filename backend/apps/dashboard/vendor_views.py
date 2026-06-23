# apps/dashboard/vendor_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from apps.vendors.models import Vendor
from apps.orders.models import Order
from apps.restaurants.models import Restaurant


class VendorDashboardView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        if not user:
            return Response({
                'success': False,
                'message': 'Authentication required'
            }, status=401)
        
        try:
            # Get vendor profile
            vendor = Vendor.objects.get(user=user)
            
            # Get restaurants for this vendor
            restaurants = Restaurant.objects.filter(vendor=vendor)
            total_restaurants = restaurants.count()
            
            # Get orders for this vendor's restaurants
            restaurant_names = list(restaurants.values_list('name', flat=True))
            
            # Calculate order stats
            orders = Order.objects.filter(restaurant_name__in=restaurant_names)
            total_orders = orders.count()
            delivered_orders = orders.filter(status='delivered').count()
            
            # Calculate revenue
            total_revenue = orders.filter(status='delivered').aggregate(
                total=Sum('total_amount')
            )['total'] or 0
            
            # Calculate average rating from reviews
            from apps.vendors.models import VendorReview
            avg_rating = VendorReview.objects.filter(vendor=vendor).aggregate(
                avg=Avg('rating')
            )['avg'] or 0
            
            # Get recent orders (last 5)
            recent_orders = orders.order_by('-created_at')[:5]
            recent_orders_data = []
            for order in recent_orders:
                recent_orders_data.append({
                    'id': str(order.id),
                    'order_number': order.order_number,
                    'customer_name': order.customer_name,
                    'total_amount': float(order.total_amount),
                    'status': order.status,
                    'created_at': order.created_at
                })
            
            return Response({
                'success': True,
                'data': {
                    'total_revenue': float(total_revenue),
                    'total_orders': total_orders,
                    'delivered_orders': delivered_orders,
                    'pending_orders': total_orders - delivered_orders,
                    'total_restaurants': total_restaurants,
                    'average_rating': float(avg_rating),
                    'recent_orders': recent_orders_data
                }
            })
            
        except Vendor.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Vendor profile not found'
            }, status=404)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)