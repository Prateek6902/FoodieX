from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q, Avg, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import django
from .models import DeliveryProfile, DeliveryZone, DeliveryAssignment, DeliveryEarning, DeliveryPerformance, DeliveryIncident, DeliveryNotification
from .serializers import DeliveryProfileSerializer, DeliveryZoneSerializer, DeliveryAssignmentSerializer, DeliveryEarningSerializer, DeliveryPerformanceSerializer, DeliveryIncidentSerializer
from apps.orders.models import Order
from apps.users.models import User


class TestView(APIView):
    """Test endpoint to verify the app is working"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'success': True,
            'message': 'Delivery Partners API is working!',
            'total_partners': DeliveryProfile.objects.count(),
            'endpoints': [
                'GET /api/delivery/partners/ - List all partners',
                'GET /api/delivery/partners/top/ - Get top partners',
                'GET /api/delivery/partners/<id>/ - Get partner details',
                'GET /api/delivery/dashboard/ - Delivery partner dashboard',
                'GET /api/delivery/admin-dashboard/ - Admin dashboard',
                'GET /api/delivery/performance/ - Performance analytics',
                'POST /api/delivery/partners/<id>/verify/ - Verify partner',
                'GET /api/delivery/zones/ - List delivery zones',
                'GET /api/delivery/earnings/ - View earnings',
                'GET /api/delivery/incidents/ - View incidents',
                'GET /api/delivery/assignments/ - View assignments',
            ]
        })


class DeliveryPartnerListView(APIView):
    """List all delivery partners for admin"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            partners = DeliveryProfile.objects.filter(deleted_at__isnull=True)
            
            # Filter by status
            status_filter = request.query_params.get('status')
            if status_filter:
                partners = partners.filter(availability_status=status_filter)
            
            # Filter by verification
            verification_filter = request.query_params.get('verification')
            if verification_filter:
                partners = partners.filter(verification_status=verification_filter)
            
            # Filter by zone
            zone_filter = request.query_params.get('zone')
            if zone_filter:
                partners = partners.filter(assigned_zone=zone_filter)
            
            # Search
            search = request.query_params.get('search')
            if search:
                partners = partners.filter(
                    Q(full_name__icontains=search) |
                    Q(phone_number__icontains=search) |
                    Q(vehicle_number__icontains=search)
                )
            
            serializer = DeliveryProfileSerializer(partners, many=True)
            
            # Get statistics
            total_partners = DeliveryProfile.objects.filter(deleted_at__isnull=True).count()
            active_partners = DeliveryProfile.objects.filter(is_active=True, deleted_at__isnull=True).count()
            available_partners = DeliveryProfile.objects.filter(availability_status='AVAILABLE').count()
            
            return Response({
                'success': True,
                'data': serializer.data,
                'stats': {
                    'total_partners': total_partners,
                    'active_partners': active_partners,
                    'available_partners': available_partners,
                    'online_partners': DeliveryProfile.objects.exclude(availability_status='OFFLINE').count(),
                    'busy_partners': DeliveryProfile.objects.filter(availability_status='BUSY').count(),
                    'offline_partners': DeliveryProfile.objects.filter(availability_status='OFFLINE').count(),
                    'verified_partners': DeliveryProfile.objects.filter(is_verified=True).count(),
                    'pending_verification': DeliveryProfile.objects.filter(verification_status='PENDING').count(),
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'data': []
            }, status=500)


class TopDeliveryPartnersView(APIView):
    """Get top performing delivery partners"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
            
            # Get top partners by rating and performance score
            top_partners = DeliveryProfile.objects.filter(
                is_active=True,
                is_verified=True,
                total_deliveries__gt=0
            ).order_by('-rating', '-performance_score')[:limit]
            
            serializer = DeliveryProfileSerializer(top_partners, many=True)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'data': []
            }, status=500)


class DeliveryPartnerDetailView(APIView):
    """Get, update, delete a specific delivery partner"""
    permission_classes = [AllowAny]
    
    def get(self, request, partner_id):
        try:
            partner = get_object_or_404(DeliveryProfile, id=partner_id, deleted_at__isnull=True)
            serializer = DeliveryProfileSerializer(partner)
            
            # Get additional stats
            today = timezone.now().date()
            week_ago = timezone.now() - timedelta(days=7)
            
            # Get assignments for this partner
            assignments = DeliveryAssignment.objects.filter(delivery_partner=partner.user) if partner.user else []
            
            today_deliveries = assignments.filter(delivered_at__date=today, status='DELIVERED').count() if assignments else 0
            week_deliveries = assignments.filter(delivered_at__gte=week_ago, status='DELIVERED').count() if assignments else 0
            
            total_earnings = 0
            pending_earnings = 0
            
            if partner.user:
                earnings = DeliveryEarning.objects.filter(delivery_partner=partner.user)
                total_earnings = earnings.filter(status='PAID').aggregate(total=Sum('total_amount'))['total'] or 0
                pending_earnings = earnings.filter(status='PENDING').aggregate(total=Sum('total_amount'))['total'] or 0
            
            return Response({
                'success': True,
                'data': serializer.data,
                'stats': {
                    'today_deliveries': today_deliveries,
                    'week_deliveries': week_deliveries,
                    'total_deliveries': partner.total_deliveries,
                    'total_earnings': float(total_earnings),
                    'pending_earnings': float(pending_earnings),
                    'acceptance_rate': float(partner.acceptance_rate) if partner.acceptance_rate else 0,
                    'on_time_rate': float(partner.on_time_delivery_rate) if partner.on_time_delivery_rate else 0,
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)
    
    def put(self, request, partner_id):
        try:
            partner = get_object_or_404(DeliveryProfile, id=partner_id)
            serializer = DeliveryProfileSerializer(partner, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({'success': True, 'message': 'Delivery partner updated', 'data': serializer.data})
            
            return Response({'success': False, 'errors': serializer.errors}, status=400)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)
    
    def delete(self, request, partner_id):
        try:
            partner = get_object_or_404(DeliveryProfile, id=partner_id)
            partner.deleted_at = timezone.now()
            partner.is_active = False
            partner.save()
            return Response({'success': True, 'message': 'Delivery partner removed'})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)


class DeliveryPartnerVerificationView(APIView):
    """Verify delivery partner"""
    permission_classes = [AllowAny]
    
    def post(self, request, partner_id):
        try:
            partner = get_object_or_404(DeliveryProfile, id=partner_id)
            action = request.data.get('action')
            
            if action == 'approve':
                partner.verification_status = 'APPROVED'
                partner.is_verified = True
                partner.document_verified_at = timezone.now()
                partner.save()
                return Response({'success': True, 'message': 'Partner approved'})
            elif action == 'reject':
                partner.verification_status = 'REJECTED'
                partner.is_verified = False
                partner.save()
                return Response({'success': True, 'message': 'Partner rejected'})
            elif action == 'request_documents':
                partner.verification_status = 'DOCUMENTS_REQUIRED'
                partner.save()
                return Response({'success': True, 'message': 'Document request sent'})
            
            return Response({'success': False, 'message': 'Invalid action'}, status=400)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)


class DeliveryPartnerDashboardView(APIView):
    """Dashboard for delivery partner"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # For delivery partner, return partner dashboard
            # For admin, return admin dashboard
            return Response({
                'success': True,
                'data': {
                    'profile': {
                        'full_name': 'Demo Partner',
                        'phone_number': '+1234567890',
                        'vehicle_type': 'BIKE',
                        'vehicle_number': 'DEMO123',
                        'rating': 4.8,
                        'availability_status': 'AVAILABLE',
                        'is_active': True,
                    },
                    'today': {
                        'deliveries': 5,
                        'earnings': 45.50,
                        'active': 2,
                        'pending': 1,
                    },
                    'weekly': {
                        'deliveries': 32,
                        'earnings': 289.50,
                    },
                    'lifetime': {
                        'total_deliveries': 150,
                        'total_earnings': 1250.75,
                        'acceptance_rate': 95.5,
                        'on_time_rate': 98.2,
                    },
                    'recent_assignments': [],
                }
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)


class AdminDeliveryDashboardView(APIView):
    """Admin dashboard for delivery management"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            total_partners = DeliveryProfile.objects.filter(deleted_at__isnull=True).count()
            active_partners = DeliveryProfile.objects.filter(is_active=True, deleted_at__isnull=True).count()
            available_partners = DeliveryProfile.objects.filter(availability_status='AVAILABLE').count()
            
            return Response({
                'success': True,
                'data': {
                    'partners': {
                        'total': total_partners,
                        'active': active_partners,
                        'available': available_partners,
                        'online': available_partners,
                        'verified': DeliveryProfile.objects.filter(is_verified=True).count(),
                        'pending_verification': DeliveryProfile.objects.filter(verification_status='PENDING').count(),
                    },
                    'deliveries': {
                        'total_assignments': 0,
                        'completed': 0,
                        'pending': 0,
                        'completion_rate': 0,
                        'today_assignments': 0,
                        'today_completed': 0,
                    },
                    'earnings': {
                        'total': 0,
                        'pending': 0,
                    },
                    'performance': {
                        'average_rating': float(DeliveryProfile.objects.filter(total_deliveries__gt=0).aggregate(avg=Avg('rating'))['avg'] or 0),
                        'average_acceptance_rate': 92.5,
                    }
                }
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)


class DeliveryPerformanceAnalyticsView(APIView):
    """Performance analytics and charts"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            period = request.query_params.get('period', 'weekly')
            today = timezone.now().date()
            
            if period == 'daily':
                data = []
                for i in range(30, -1, -1):
                    date = today - timedelta(days=i)
                    deliveries = DeliveryAssignment.objects.filter(
                        delivered_at__date=date,
                        status='DELIVERED'
                    ).count()
                    earnings = DeliveryEarning.objects.filter(
                        created_at__date=date,
                        status='PAID'
                    ).aggregate(total=Sum('total_amount'))['total'] or 0
                    
                    data.append({
                        'date': date.strftime('%b %d'),
                        'deliveries': deliveries,
                        'earnings': float(earnings),
                    })
            elif period == 'weekly':
                data = []
                for i in range(11, -1, -1):
                    week_start = today - timedelta(weeks=i)
                    week_end = week_start + timedelta(days=6)
                    deliveries = DeliveryAssignment.objects.filter(
                        delivered_at__date__range=[week_start, week_end],
                        status='DELIVERED'
                    ).count()
                    earnings = DeliveryEarning.objects.filter(
                        created_at__date__range=[week_start, week_end],
                        status='PAID'
                    ).aggregate(total=Sum('total_amount'))['total'] or 0
                    
                    data.append({
                        'week': f"Week {12 - i}",
                        'deliveries': deliveries,
                        'earnings': float(earnings),
                    })
            else:
                data = [
                    {'week': 'Week 1', 'deliveries': 45, 'earnings': 450},
                    {'week': 'Week 2', 'deliveries': 52, 'earnings': 520},
                    {'week': 'Week 3', 'deliveries': 48, 'earnings': 480},
                    {'week': 'Week 4', 'deliveries': 60, 'earnings': 600},
                ]
            
            return Response({
                'success': True,
                'period': period,
                'data': data
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)


class DeliveryZoneManagementView(APIView):
    """Manage delivery zones"""
    permission_classes = [AllowAny]
    
    def get(self, request, zone_id=None):
        try:
            if zone_id:
                zone = get_object_or_404(DeliveryZone, id=zone_id, is_active=True)
                serializer = DeliveryZoneSerializer(zone)
                return Response({'success': True, 'data': serializer.data})
            
            zones = DeliveryZone.objects.filter(is_active=True)
            serializer = DeliveryZoneSerializer(zones, many=True)
            return Response({'success': True, 'data': serializer.data})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)
    
    def post(self, request):
        try:
            serializer = DeliveryZoneSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'success': True, 'data': serializer.data}, status=201)
            return Response({'success': False, 'errors': serializer.errors}, status=400)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)


class DeliveryEarningsView(APIView):
    """View and manage delivery earnings"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            partner_id = request.query_params.get('partner_id')
            
            if partner_id:
                earnings = DeliveryEarning.objects.filter(delivery_partner_id=partner_id)
            else:
                earnings = DeliveryEarning.objects.all()
            
            earnings = earnings.order_by('-created_at')
            serializer = DeliveryEarningSerializer(earnings, many=True)
            
            # Summary
            total_earnings = earnings.filter(status='PAID').aggregate(total=Sum('total_amount'))['total'] or 0
            pending_earnings = earnings.filter(status='PENDING').aggregate(total=Sum('total_amount'))['total'] or 0
            
            return Response({
                'success': True,
                'data': serializer.data,
                'summary': {
                    'total_earnings': float(total_earnings),
                    'pending_earnings': float(pending_earnings),
                }
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)


class DeliveryIncidentManagementView(APIView):
    """Manage delivery incidents and complaints"""
    permission_classes = [AllowAny]
    
    def get(self, request, incident_id=None):
        try:
            if incident_id:
                incident = get_object_or_404(DeliveryIncident, id=incident_id)
                serializer = DeliveryIncidentSerializer(incident)
                return Response({'success': True, 'data': serializer.data})
            
            incidents = DeliveryIncident.objects.all().order_by('-created_at')
            serializer = DeliveryIncidentSerializer(incidents, many=True)
            return Response({'success': True, 'data': serializer.data})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)
    
    def post(self, request):
        try:
            serializer = DeliveryIncidentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'success': True, 'data': serializer.data}, status=201)
            return Response({'success': False, 'errors': serializer.errors}, status=400)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)


class DeliveryPartnerAssignmentView(APIView):
    """Assign orders to delivery partners"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Get pending assignments
            pending_assignments = DeliveryAssignment.objects.filter(status='PENDING').select_related('order').order_by('-assigned_at')
            serializer = DeliveryAssignmentSerializer(pending_assignments, many=True)
            
            # Get available partners
            available_partners = DeliveryProfile.objects.filter(
                is_active=True,
                is_verified=True,
                availability_status='AVAILABLE'
            )
            
            partner_serializer = DeliveryProfileSerializer(available_partners, many=True)
            
            return Response({
                'success': True,
                'pending_assignments': serializer.data,
                'available_partners': partner_serializer.data,
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)
    
    def post(self, request):
        try:
            order_id = request.data.get('order_id')
            partner_id = request.data.get('partner_id')
            
            if not order_id or not partner_id:
                return Response({'success': False, 'message': 'order_id and partner_id required'}, status=400)
            
            order = get_object_or_404(Order, id=order_id)
            partner = get_object_or_404(User, id=partner_id)
            
            # Check if already assigned
            if DeliveryAssignment.objects.filter(order=order).exists():
                return Response({'success': False, 'message': 'Order already assigned'}, status=400)
            
            assignment = DeliveryAssignment.objects.create(
                order=order,
                delivery_partner=partner,
                status='PENDING'
            )
            
            serializer = DeliveryAssignmentSerializer(assignment)
            return Response({'success': True, 'data': serializer.data}, status=201)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)