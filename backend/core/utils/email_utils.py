from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

class EmailService:
    
    @staticmethod
    def send_template_email(subject, template_name, context, to_email):
        """Send email using HTML template"""
        html_message = render_to_string(template_name, context)
        plain_message = strip_tags(html_message)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email to new user"""
        context = {
            'name': user.first_name,
            'email': user.email,
            'role': user.get_role_display_name(),
            'login_url': 'http://localhost:8000/api/auth/login/'
        }
        EmailService.send_template_email(
            subject=f"Welcome to Food Delivery Platform!",
            template_name='emails/welcome.html',
            context=context,
            to_email=user.email
        )
    
    @staticmethod
    def send_order_confirmation(order):
        """Send order confirmation email"""
        context = {
            'order_number': order.order_number,
            'customer_name': order.customer.full_name,
            'items': order.items.all(),
            'subtotal': order.subtotal,
            'tax': order.tax_amount,
            'delivery_fee': order.delivery_fee,
            'total': order.total_amount,
            'estimated_delivery': order.estimated_delivery_time,
            'tracking_url': f'http://localhost:8000/orders/{order.id}/track'
        }
        EmailService.send_template_email(
            subject=f"Order Confirmation - {order.order_number}",
            template_name='emails/order_confirmation.html',
            context=context,
            to_email=order.customer.email
        )
    
    @staticmethod
    def send_password_reset_email(user, reset_link):
        """Send password reset email"""
        context = {
            'name': user.first_name,
            'reset_link': reset_link,
            'expiry_hours': 24
        }
        EmailService.send_template_email(
            subject="Password Reset Request",
            template_name='emails/password_reset.html',
            context=context,
            to_email=user.email
        )