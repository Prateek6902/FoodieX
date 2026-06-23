from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Vendor, VendorDocument, VendorReview
from .serializers import VendorSerializer, VendorDocumentSerializer, VendorReviewSerializer


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.filter(deleted_at__isnull=True)
    serializer_class = VendorSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'city', 'state', 'is_featured']
    search_fields = ['business_name', 'business_registration_number', 'city', 'user__email']
    ordering_fields = ['rating', 'total_revenue', 'total_orders', 'joined_date']
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user = self.request.user if self.request.user.is_authenticated else None
        queryset = Vendor.objects.filter(deleted_at__isnull=True)
        
        # For admin/super_admin - show all vendors
        if user and user.role.upper() in ['ADMIN', 'SUPER_ADMIN']:
            return queryset
        
        # For vendor - show only their own profile
        if user and user.role.upper() == 'VENDOR':
            return queryset.filter(user=user)
        
        # For others - show only approved vendors
        return queryset.filter(status='APPROVED')
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Add pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'success': True,
                'data': serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count()
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get vendor statistics for admin dashboard"""
        user = request.user if request.user.is_authenticated else None
        
        # Check if user is admin or super admin (case insensitive)
        if not user or user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Access denied. Admin only.'
            }, status=403)
        
        vendors = Vendor.objects.filter(deleted_at__isnull=True)
        
        stats = {
            'total_vendors': vendors.count(),
            'active_vendors': vendors.filter(status='APPROVED').count(),
            'pending_vendors': vendors.filter(status='PENDING').count(),
            'suspended_vendors': vendors.filter(status='SUSPENDED').count(),
            'total_revenue': float(vendors.aggregate(total=Sum('total_revenue'))['total'] or 0),
            'total_orders': vendors.aggregate(total=Sum('total_orders'))['total'] or 0,
            'average_rating': float(vendors.aggregate(avg=Avg('rating'))['avg'] or 0),
        }
        
        return Response({
            'success': True,
            'data': stats
        })
    
    @action(detail=False, methods=['get'])
    def my_restaurants(self, request):
        """Get restaurants for the logged-in vendor"""
        from apps.restaurants.models import Restaurant
        from apps.restaurants.serializers import RestaurantSerializer

        # Check authentication
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'message': 'Authentication required. Please log in.',
                'code': 'AUTH_REQUIRED'
            }, status=401)

        user_role = request.user.role.upper() if hasattr(request.user, 'role') else ''
        
        print(f"my_restaurants - User: {request.user.email}, Role: {user_role}")
        
        # Check if user has vendor role
        if user_role != 'VENDOR':
            return Response({
                'success': False,
                'message': f'Access denied. Vendor only. Your role: {user_role}',
                'code': 'NOT_VENDOR',
                'user_role': user_role
            }, status=403)
        
        try:
            vendor = Vendor.objects.get(user=request.user)
            # Get restaurants for this vendor
            restaurants = Restaurant.objects.filter(vendor=vendor, is_active=True)
            
            print(f"Found {restaurants.count()} restaurants for vendor {vendor.business_name}")
            
            # Manual serialization to ensure data is returned
            data = []
            for restaurant in restaurants:
                logo_url = None
                if restaurant.logo:
                    logo_url = f"http://localhost:8000{restaurant.logo.url}"
                elif restaurant.logo_url:
                    if restaurant.logo_url.startswith('http'):
                        logo_url = restaurant.logo_url
                    elif restaurant.logo_url.startswith('/media/'):
                        logo_url = f"http://localhost:8000{restaurant.logo_url}"
                    else:
                        logo_url = f"http://localhost:8000/media/{restaurant.logo_url}"
                
                data.append({
                    'id': str(restaurant.id),
                    'name': restaurant.name,
                    'cuisine_type': restaurant.cuisine_type or '',
                    'city': restaurant.city or '',
                    'address_line1': restaurant.address_line1 or '',
                    'phone_number': restaurant.phone_number or '',
                    'email': restaurant.email or '',
                    'rating': float(restaurant.rating) if restaurant.rating else 0,
                    'delivery_charge': float(restaurant.delivery_charge) if restaurant.delivery_charge else 0,
                    'minimum_order_amount': float(restaurant.minimum_order_amount) if restaurant.minimum_order_amount else 0,
                    'is_active': restaurant.is_active,
                    'status': restaurant.status,
                    'total_orders': getattr(restaurant, 'total_orders', 0),
                    'total_revenue': float(getattr(restaurant, 'total_revenue', 0)),
                    'opening_time': str(restaurant.opening_time) if restaurant.opening_time else '09:00:00',
                    'closing_time': str(restaurant.closing_time) if restaurant.closing_time else '22:00:00',
                    'logo_url': logo_url,
                    'description': restaurant.description or '',
                    'created_at': restaurant.created_at.isoformat() if restaurant.created_at else None,
                })
            
            return Response({
                'success': True,
                'data': data,
                'count': restaurants.count()
            })
            
        except Vendor.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Vendor profile not found. Please complete your vendor registration.',
                'code': 'VENDOR_NOT_FOUND'
            }, status=404)
        except Exception as e:
            print(f"Error in my_restaurants: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'message': str(e),
                'code': 'SERVER_ERROR'
            }, status=500)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get analytics for the logged-in vendor"""
        user = request.user if request.user.is_authenticated else None
        
        if not user or user.role.upper() != 'VENDOR':
            return Response({
                'success': False,
                'message': 'Access denied. Vendor only.'
            }, status=403)
        
        try:
            from apps.restaurants.models import Restaurant
            from apps.orders.models import Order, OrderItem
            
            # Get vendor profile
            vendor = Vendor.objects.get(user=user)
            
            # Get restaurants for this vendor
            restaurants = Restaurant.objects.filter(vendor=vendor)
            total_restaurants = restaurants.count()
            restaurant_names = list(restaurants.values_list('name', flat=True))
            
            if total_restaurants == 0:
                return Response({
                    'success': True,
                    'data': {
                        'total_revenue': 0,
                        'total_orders': 0,
                        'total_profit': 0,
                        'average_order_value': 0,
                        'average_rating': 0,
                        'total_restaurants': 0,
                        'monthly_revenue': [],
                        'category_sales': [],
                        'top_products': [],
                        'daily_orders': [],
                        'recent_orders': []
                    }
                })
            
            # Get orders for these restaurants
            orders = Order.objects.filter(restaurant_name__in=restaurant_names)
            total_orders = orders.count()
            delivered_orders = orders.filter(status='delivered')
            total_revenue = delivered_orders.aggregate(total=Sum('total_amount'))['total'] or 0
            
            # Convert to float for calculations
            total_revenue_float = float(total_revenue)
            
            # Calculate profit (assuming 70% margin)
            total_profit = total_revenue_float * 0.7
            
            # Average order value
            average_order_value = total_revenue_float / total_orders if total_orders > 0 else 0
            
            # Average rating
            avg_rating = VendorReview.objects.filter(vendor=vendor).aggregate(avg=Avg('rating'))['avg'] or 0
            
            # Monthly revenue for last 6 months
            monthly_revenue = []
            current_date = timezone.now().date()
            for i in range(5, -1, -1):
                month_date = current_date.replace(day=1) - timedelta(days=30*i)
                month_orders = orders.filter(
                    status='delivered',
                    created_at__year=month_date.year,
                    created_at__month=month_date.month
                )
                revenue = month_orders.aggregate(total=Sum('total_amount'))['total'] or 0
                monthly_revenue.append({
                    'month': month_date.strftime('%b'),
                    'revenue': float(revenue)
                })
            
            # Category sales
            category_sales = {}
            order_items = OrderItem.objects.filter(order__in=orders, order__status='delivered')
            
            for item in order_items:
                product_name = item.product_name.lower() if item.product_name else ''
                category = 'Other'
                
                if 'biryani' in product_name:
                    category = 'Biryani'
                elif 'taco' in product_name:
                    category = 'Tacos'
                elif 'burrito' in product_name:
                    category = 'Burritos'
                elif 'nachos' in product_name:
                    category = 'Nachos'
                elif 'churros' in product_name:
                    category = 'Desserts'
                elif 'margarita' in product_name:
                    category = 'Beverages'
                elif 'rice bowl' in product_name:
                    category = 'Bowls'
                elif 'chicken 65' in product_name:
                    category = 'Starters'
                elif 'raita' in product_name or 'mirchi ka salan' in product_name:
                    category = 'Sides'
                elif 'gulab jamun' in product_name:
                    category = 'Desserts'
                
                category_sales[category] = category_sales.get(category, 0) + (item.quantity or 1)
            
            total_sales = sum(category_sales.values())
            category_data = [
                {'name': name, 'value': round((sales / total_sales * 100), 1) if total_sales > 0 else 0}
                for name, sales in category_sales.items()
            ]
            category_data.sort(key=lambda x: x['value'], reverse=True)
            
            # Top products
            top_products = order_items.values('product_name').annotate(
                total_sales=Sum('quantity'),
                total_revenue=Sum('total_price')
            ).order_by('-total_sales')[:10]
            
            products_data = []
            for p in top_products:
                if p['product_name']:
                    products_data.append({
                        'name': p['product_name'],
                        'sales': p['total_sales'] or 0,
                        'revenue': float(p['total_revenue'] or 0)
                    })
            
            # Daily orders for last 7 days
            daily_orders = []
            for i in range(6, -1, -1):
                date = current_date - timedelta(days=i)
                day_orders = orders.filter(created_at__date=date)
                daily_orders.append({
                    'date': date.strftime('%a'),
                    'orders': day_orders.count(),
                    'revenue': float(day_orders.filter(status='delivered').aggregate(total=Sum('total_amount'))['total'] or 0)
                })
            
            # Recent orders
            recent_orders = orders.order_by('-created_at')[:10]
            recent_orders_data = []
            for order in recent_orders:
                recent_orders_data.append({
                    'id': str(order.id),
                    'order_number': order.order_number,
                    'customer_name': order.customer_name,
                    'total_amount': float(order.total_amount),
                    'status': order.status,
                    'created_at': order.created_at.isoformat() if order.created_at else None
                })
            
            return Response({
                'success': True,
                'data': {
                    'total_revenue': total_revenue_float,
                    'total_orders': total_orders,
                    'total_profit': total_profit,
                    'average_order_value': average_order_value,
                    'average_rating': float(avg_rating) if avg_rating else 0,
                    'total_restaurants': total_restaurants,
                    'monthly_revenue': monthly_revenue,
                    'category_sales': category_data,
                    'top_products': products_data,
                    'daily_orders': daily_orders,
                    'recent_orders': recent_orders_data
                }
            })
            
        except Vendor.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Vendor profile not found'
            }, status=404)
        except Exception as e:
            print(f"Analytics error: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)
    
    @action(detail=True, methods=['post'])
    def approve_vendor(self, request, pk=None):
        if not request.user.is_authenticated or request.user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({'success': False, 'message': 'Permission denied'}, status=403)
        
        vendor = self.get_object()
        vendor.status = 'APPROVED'
        vendor.approved_at = timezone.now()
        vendor.approved_by = request.user
        vendor.save()
        return Response({'success': True, 'message': 'Vendor approved successfully'})
    
    @action(detail=True, methods=['post'])
    def reject_vendor(self, request, pk=None):
        if not request.user.is_authenticated or request.user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({'success': False, 'message': 'Permission denied'}, status=403)
        
        vendor = self.get_object()
        vendor.status = 'REJECTED'
        vendor.save()
        return Response({'success': True, 'message': 'Vendor rejected'})
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        if not request.user.is_authenticated:
            return Response({'success': False, 'message': 'Authentication required'}, status=401)
        
        try:
            vendor = Vendor.objects.get(user=request.user)
            serializer = self.get_serializer(vendor)
            return Response(serializer.data)
        except Vendor.DoesNotExist:
            return Response({'success': False, 'message': 'Vendor profile not found'}, status=404)
    
    @action(detail=True, methods=['get'])
    def vendor_analytics(self, request, pk=None):
        """Get analytics for a specific vendor (admin only)"""
        user = request.user if request.user.is_authenticated else None
        
        if not user or user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Access denied. Admin only.'
            }, status=403)
        
        vendor = self.get_object()
        
        try:
            from apps.restaurants.models import Restaurant
            from apps.orders.models import Order
            
            # Get restaurants for this vendor
            restaurants = Restaurant.objects.filter(vendor=vendor)
            restaurant_names = list(restaurants.values_list('name', flat=True))
            
            # Get orders for these restaurants
            orders = Order.objects.filter(restaurant_name__in=restaurant_names)
            
            total_orders = orders.filter(status='delivered').count()
            total_revenue = orders.filter(status='delivered').aggregate(total=Sum('total_amount'))['total'] or 0
            
            # Monthly revenue for last 6 months
            monthly_revenue = []
            current_date = timezone.now().date()
            for i in range(5, -1, -1):
                month_date = current_date.replace(day=1) - timedelta(days=30*i)
                month_orders = orders.filter(
                    status='delivered',
                    created_at__year=month_date.year,
                    created_at__month=month_date.month
                )
                revenue = month_orders.aggregate(total=Sum('total_amount'))['total'] or 0
                monthly_revenue.append({
                    'month': month_date.strftime('%b'),
                    'revenue': float(revenue)
                })
            
            return Response({
                'success': True,
                'data': {
                    'business_name': vendor.business_name,
                    'total_revenue': float(total_revenue),
                    'total_orders': total_orders,
                    'total_restaurants': restaurants.count(),
                    'monthly_revenue': monthly_revenue,
                    'rating': float(vendor.rating),
                    'status': vendor.status,
                    'joined_date': vendor.joined_date
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)


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
            from apps.restaurants.models import Restaurant
            from apps.orders.models import Order, OrderItem
            
            # Get vendor profile
            vendor = Vendor.objects.get(user=user)
            
            # Get restaurants for this vendor
            restaurants = Restaurant.objects.filter(vendor=vendor)
            total_restaurants = restaurants.count()
            restaurant_names = list(restaurants.values_list('name', flat=True))
            
            print(f"Dashboard - Vendor: {vendor.business_name}")
            print(f"Dashboard - Restaurants: {restaurant_names}")
            
            if total_restaurants == 0:
                return Response({
                    'success': True,
                    'data': {
                        'total_revenue': 0,
                        'total_orders': 0,
                        'delivered_orders': 0,
                        'pending_orders': 0,
                        'total_restaurants': 0,
                        'average_rating': 0,
                        'monthly_revenue': [],
                        'category_sales': [],
                        'recent_orders': []
                    }
                })
            
            # Get orders for this vendor's restaurants
            orders = Order.objects.filter(restaurant_name__in=restaurant_names)
            
            total_orders = orders.count()
            delivered_orders = orders.filter(status='delivered').count()
            total_revenue = delivered_orders.aggregate(total=Sum('total_amount'))['total'] or 0
            total_revenue_float = float(total_revenue)
            
            print(f"Dashboard - Total Orders: {total_orders}, Revenue: {total_revenue_float}")
            
            # Monthly revenue for last 6 months
            monthly_revenue = []
            current_date = timezone.now().date()
            for i in range(5, -1, -1):
                month_date = current_date.replace(day=1) - timedelta(days=30*i)
                month_orders = orders.filter(
                    status='delivered',
                    created_at__year=month_date.year,
                    created_at__month=month_date.month
                )
                revenue = month_orders.aggregate(total=Sum('total_amount'))['total'] or 0
                monthly_revenue.append({
                    'month': month_date.strftime('%b'),
                    'revenue': float(revenue)
                })
            
            print(f"Dashboard - Monthly Revenue: {monthly_revenue}")
            
            # Category sales for pie chart
            category_sales = {}
            order_items = OrderItem.objects.filter(order__in=orders, order__status='delivered')
            
            for item in order_items:
                product_name = item.product_name.lower() if item.product_name else ''
                category = 'Other'
                
                if 'biryani' in product_name:
                    category = 'Biryani'
                elif 'taco' in product_name:
                    category = 'Tacos'
                elif 'burrito' in product_name:
                    category = 'Burritos'
                elif 'nachos' in product_name:
                    category = 'Nachos'
                elif 'churros' in product_name:
                    category = 'Desserts'
                elif 'margarita' in product_name:
                    category = 'Beverages'
                elif 'rice bowl' in product_name:
                    category = 'Bowls'
                elif 'chicken 65' in product_name:
                    category = 'Starters'
                elif 'raita' in product_name or 'mirchi ka salan' in product_name:
                    category = 'Sides'
                elif 'gulab jamun' in product_name:
                    category = 'Desserts'
                elif 'butter chicken' in product_name:
                    category = 'North Indian'
                elif 'paneer tikka' in product_name:
                    category = 'Starters'
                elif 'french fries' in product_name:
                    category = 'Snacks'
                else:
                    category = 'Other'
                
                category_sales[category] = category_sales.get(category, 0) + (item.quantity or 1)
            
            total_sales = sum(category_sales.values())
            category_data = [
                {'name': name, 'value': round((sales / total_sales * 100), 1) if total_sales > 0 else 0}
                for name, sales in category_sales.items()
            ]
            category_data.sort(key=lambda x: x['value'], reverse=True)
            
            print(f"Dashboard - Category Sales: {category_data[:5]}")
            
            # Average rating
            from apps.vendors.models import VendorReview
            avg_rating_data = VendorReview.objects.filter(vendor=vendor).aggregate(avg=Avg('rating'))
            avg_rating = float(avg_rating_data['avg']) if avg_rating_data['avg'] else 0
            
            print(f"Dashboard - Avg Rating: {avg_rating}")
            
            # Recent orders
            recent_orders = orders.order_by('-created_at')[:10]
            recent_orders_data = []
            for order in recent_orders:
                recent_orders_data.append({
                    'id': str(order.id),
                    'order_number': order.order_number,
                    'customer_name': order.customer_name,
                    'total_amount': float(order.total_amount),
                    'status': order.status,
                    'created_at': order.created_at.isoformat() if order.created_at else None
                })
            
            response_data = {
                'total_revenue': total_revenue_float,
                'total_orders': total_orders,
                'delivered_orders': delivered_orders,
                'pending_orders': total_orders - delivered_orders,
                'total_restaurants': total_restaurants,
                'average_rating': avg_rating,
                'monthly_revenue': monthly_revenue,
                'category_sales': category_data,
                'recent_orders': recent_orders_data
            }
            
            print(f"Dashboard - Response prepared with {len(category_data)} categories")
            
            return Response({
                'success': True,
                'data': response_data
            })
            
        except Vendor.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Vendor profile not found'
            }, status=404)
        except Exception as e:
            print(f"Dashboard error: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)


class VendorDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = VendorDocumentSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        vendor_id = self.kwargs.get('vendor_pk')
        return VendorDocument.objects.filter(vendor_id=vendor_id)
    
    def perform_create(self, serializer):
        vendor = Vendor.objects.get(id=self.kwargs['vendor_pk'])
        serializer.save(vendor=vendor)


class VendorReviewViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VendorReviewSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['rating']
    ordering_fields = ['created_at', 'rating']
    
    def get_queryset(self):
        vendor_id = self.kwargs.get('vendor_pk')
        return VendorReview.objects.filter(vendor_id=vendor_id).select_related('customer')
    
    @action(detail=True, methods=['post'])
    def respond(self, request, vendor_pk=None, pk=None):
        if not request.user.is_authenticated:
            return Response({'success': False, 'message': 'Authentication required'}, status=401)
        
        review = self.get_object()
        vendor = review.vendor
        
        if request.user.role.upper() not in ['ADMIN', 'SUPER_ADMIN'] and vendor.user != request.user:
            return Response({'success': False, 'message': 'Permission denied'}, status=403)
        
        response_text = request.data.get('response')
        if not response_text:
            return Response({'success': False, 'message': 'Response text is required'}, status=400)
        
        review.response = response_text
        review.response_at = timezone.now()
        review.save()
        return Response({'success': True, 'message': 'Response added'})