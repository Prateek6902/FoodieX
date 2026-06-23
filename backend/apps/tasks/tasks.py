from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order, OrderTracking
from apps.authentication.models import OTP
from apps.vendors.models import Vendor, VendorPayout
from apps.notifications.models import Notification

@shared_task
def assign_delivery_partner(order_id):
    """Assign nearest available delivery partner to an order"""
    from apps.users.models import User
    from geopy.distance import geodesic
    
    order = Order.objects.get(id=order_id)
    
    # Find available delivery partners
    available_partners = User.objects.filter(
        role='DELIVERY_PARTNER',
        delivery_profile__is_available=True,
        delivery_profile__current_orders__lt=3
    )
    
    # Find nearest partner based on restaurant location
    nearest_partner = None
    min_distance = float('inf')
    
    for partner in available_partners:
        partner_location = (partner.delivery_profile.current_latitude, 
                           partner.delivery_profile.current_longitude)
        restaurant_location = (order.restaurant.latitude, order.restaurant.longitude)
        
        distance = geodesic(partner_location, restaurant_location).kilometers
        if distance < min_distance:
            min_distance = distance
            nearest_partner = partner
    
    if nearest_partner:
        order.delivery_partner = nearest_partner
        order.save()
        
        # Send notification to delivery partner
        Notification.objects.create(
            user=nearest_partner,
            title="New Delivery Assignment",
            message=f"New order #{order.order_number} assigned to you",
            type="DELIVERY_ASSIGNMENT",
            metadata={'order_id': str(order.id)}
        )
        
        # Send push notification (webhook ready)
        send_push_notification.delay(nearest_partner.id, "New Order", "You have a new delivery assignment")
    
    return bool(nearest_partner)

@shared_task
def send_daily_report():
    """Send daily sales report to admin"""
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    
    orders = Order.objects.filter(
        created_at__date=yesterday,
        status='DELIVERED'
    )
    
    total_revenue = orders.aggregate(total=models.Sum('total_amount'))['total'] or 0
    total_orders = orders.count()
    
    context = {
        'date': yesterday,
        'total_revenue': total_revenue,
        'total_orders': total_orders,
        'average_order_value': total_revenue / total_orders if total_orders > 0 else 0,
    }
    
    # Send to all super admins
    from apps.users.models import User
    admins = User.objects.filter(role__in=['SUPER_ADMIN', 'ADMIN'])
    
    for admin in admins:
        send_mail(
            subject=f"Daily Sales Report - {yesterday}",
            message=render_to_string('emails/daily_report.txt', context),
            from_email=None,
            recipient_list=[admin.email],
            html_message=render_to_string('emails/daily_report.html', context)
        )

@shared_task
def update_vendor_metrics():
    """Update vendor performance metrics"""
    vendors = Vendor.objects.all()
    
    for vendor in vendors:
        # Calculate metrics from last 30 days
        orders = Order.objects.filter(
            vendor=vendor,
            status='DELIVERED',
            created_at__gte=timezone.now() - timedelta(days=30)
        )
        
        total_revenue = orders.aggregate(total=models.Sum('total_amount'))['total'] or 0
        total_orders = orders.count()
        avg_rating = vendor.reviews.aggregate(avg=models.Avg('rating'))['avg'] or 0
        
        vendor.total_revenue = total_revenue
        vendor.total_orders = total_orders
        vendor.rating = avg_rating
        vendor.save()

@shared_task
def cleanup_expired_otps():
    """Remove expired OTPs from database"""
    expired_otps = OTP.objects.filter(expires_at__lt=timezone.now())
    deleted_count = expired_otps.delete()[0]
    return f"Deleted {deleted_count} expired OTPs"

@shared_task
def process_pending_payouts():
    """Process weekly vendor payouts"""
    vendors = Vendor.objects.filter(status='APPROVED')
    
    for vendor in vendors:
        last_payout = VendorPayout.objects.filter(vendor=vendor).order_by('-period_end').first()
        start_date = last_payout.period_end if last_payout else timezone.now() - timedelta(days=7)
        end_date = timezone.now()
        
        orders = Order.objects.filter(
            vendor=vendor,
            status='DELIVERED',
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        total_amount = orders.aggregate(total=models.Sum('total_amount'))['total'] or 0
        commission = total_amount * (vendor.commission_rate / 100)
        net_amount = total_amount - commission
        
        if total_amount > 0:
            VendorPayout.objects.create(
                vendor=vendor,
                amount=total_amount,
                commission=commission,
                net_amount=net_amount,
                period_start=start_date,
                period_end=end_date,
                status='PENDING'
            )

@shared_task
def update_order_estimates():
    """Update order delivery estimates based on traffic conditions"""
    pending_orders = Order.objects.filter(
        status__in=['PENDING', 'ACCEPTED', 'PREPARING', 'READY'],
        estimated_delivery_time__lt=timezone.now()
    )
    
    for order in pending_orders:
        # Adjust delivery time by 15 minutes
        order.estimated_delivery_time = timezone.now() + timedelta(minutes=15)
        order.save()
        
        # Notify customer about delay
        Notification.objects.create(
            user=order.customer,
            title="Order Delay",
            message=f"Your order #{order.order_number} is delayed. New estimated delivery: {order.estimated_delivery_time}",
            type="ORDER_DELAY",
            metadata={'order_id': str(order.id)}
        )

@shared_task
def send_push_notification(user_id, title, message):
    """Send push notification to user (webhook ready for Firebase/APNS)"""
    # Implementation for Firebase Cloud Messaging or APNS
    # This is a placeholder for actual push notification integration
    pass

@shared_task
def generate_invoice(order_id):
    """Generate invoice for completed order"""
    from apps.invoices.services import InvoiceService
    order = Order.objects.get(id=order_id)
    InvoiceService.generate_invoice(order)