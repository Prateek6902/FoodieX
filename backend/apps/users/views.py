from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import LoginHistory
from .serializers import UserSerializer, LoginHistorySerializer
from apps.orders.models import Order

User = get_user_model()

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'data': serializer.data
        })

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        
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

class ChangeRoleView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Only super admins can change roles
        if request.user.role not in ['SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'You do not have permission to change roles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')
        
        if not user_id or not new_role:
            return Response({
                'success': False,
                'message': 'user_id and role are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            user.role = new_role
            user.save()
            
            return Response({
                'success': True,
                'message': f'User role changed to {new_role}',
                'data': {
                    'user_id': str(user.id),
                    'email': user.email,
                    'new_role': user.role
                }
            })
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

class LoginHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Users can only see their own login history
        history = LoginHistory.objects.filter(user=request.user).order_by('-login_time')[:50]
        serializer = LoginHistorySerializer(history, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })

# ==================== NEW ADMIN VIEWS ====================

class UserListView(APIView):
    """List all users - Admin only"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        
        # Check if user is admin or super admin
        if not user or user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Access denied. Admin only.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Filter by role
        role = request.query_params.get('role', '')
        
        if role:
            queryset = User.objects.filter(role=role, is_active=True)
        else:
            queryset = User.objects.filter(is_active=True)
        
        # Search
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(mobile_number__icontains=search)
            )
        
        # Order by
        ordering = request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)
        
        # Prepare response data with stats
        data = []
        for u in queryset:
            # Get order stats for customers
            total_orders = 0
            total_spent = 0
            
            if u.role == 'customer':
                orders = Order.objects.filter(customer_email=u.email)
                total_orders = orders.count()
                total_spent = orders.filter(status='delivered').aggregate(total=Sum('total_amount'))['total'] or 0
            
            data.append({
                'id': str(u.id),
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'full_name': u.get_full_name() or u.email,
                'mobile_number': u.mobile_number,
                'role': u.role,
                'is_active': u.is_active,
                'is_verified': u.is_verified,
                'created_at': u.created_at,
                'total_orders': total_orders,
                'total_spent': float(total_spent),
            })
        
        return Response({
            'success': True,
            'count': len(data),
            'results': data
        })


class CustomerStatsView(APIView):
    """Get customer statistics for admin dashboard"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        
        # Check if user is admin or super admin
        if not user or user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Access denied. Admin only.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        customers = User.objects.filter(role='customer')
        customer_emails = list(customers.values_list('email', flat=True))
        orders = Order.objects.filter(customer_email__in=customer_emails)
        
        # Calculate new customers in last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        new_customers = customers.filter(created_at__gte=thirty_days_ago).count()
        
        stats = {
            'total_customers': customers.count(),
            'active_customers': customers.filter(is_active=True).count(),
            'verified_customers': customers.filter(is_verified=True).count(),
            'total_orders': orders.count(),
            'total_revenue': float(orders.filter(status='delivered').aggregate(total=Sum('total_amount'))['total'] or 0),
            'new_customers_30d': new_customers,
        }
        
        return Response({
            'success': True,
            'data': stats
        })
class CheckAuthView(APIView):
    """Debug endpoint to check current user authentication"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        
        if not user:
            return Response({
                'authenticated': False,
                'message': 'Not authenticated'
            })
        
        return Response({
            'authenticated': True,
            'user_id': str(user.id),
            'email': user.email,
            'role': user.role,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_active': user.is_active,
        })