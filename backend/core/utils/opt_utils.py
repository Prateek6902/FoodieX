import random
import string
from django.core.cache import cache
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from apps.authentication.models import OTP

def generate_otp(length=6):
    """Generate random OTP"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp(email, otp_type):
    """Send OTP to email"""
    # Delete existing OTPs
    OTP.objects.filter(email=email, otp_type=otp_type, is_used=False).delete()
    
    # Generate new OTP
    otp_code = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=10)
    
    # Store OTP
    otp = OTP.objects.create(
        email=email,
        otp_code=otp_code,
        otp_type=otp_type,
        expires_at=expires_at
    )
    
    # Send email
    subject = f"Your OTP for {otp_type.replace('_', ' ').title()}"
    message = f"""
    Your OTP for {otp_type.replace('_', ' ').title()} is: {otp_code}
    
    This OTP is valid for 10 minutes.
    
    If you didn't request this, please ignore this email.
    """
    
    send_mail(
        subject=subject,
        message=message,
        from_email=None,
        recipient_list=[email],
        fail_silently=False
    )
    
    return otp

def verify_otp(email, otp_code, otp_type):
    """Verify OTP"""
    try:
        otp = OTP.objects.get(
            email=email,
            otp_code=otp_code,
            otp_type=otp_type,
            is_used=False,
            expires_at__gt=timezone.now()
        )
        otp.is_used = True
        otp.save()
        return True
    except OTP.DoesNotExist:
        return False

def resend_otp(email, otp_type):
    """Resend OTP"""
    # Delete expired/unused OTPs
    OTP.objects.filter(email=email, otp_type=otp_type, is_used=False).delete()
    return send_otp(email, otp_type)