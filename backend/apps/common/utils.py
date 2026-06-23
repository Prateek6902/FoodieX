import re
import hashlib
import json
from django.core.cache import cache
from django.utils import timezone
from django.utils.crypto import get_random_string
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

def get_client_ip(request):
    """
    Get client IP address from request
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_device_info(request):
    """
    Extract device information from user agent
    """
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
    
    device_info = {
        'device_type': 'unknown',
        'browser': 'unknown',
        'os': 'unknown',
    }
    
    # Detect device type
    if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
        device_info['device_type'] = 'mobile'
    elif 'tablet' in user_agent or 'ipad' in user_agent:
        device_info['device_type'] = 'tablet'
    else:
        device_info['device_type'] = 'desktop'
    
    # Detect browser
    if 'chrome' in user_agent:
        device_info['browser'] = 'chrome'
    elif 'firefox' in user_agent:
        device_info['browser'] = 'firefox'
    elif 'safari' in user_agent:
        device_info['browser'] = 'safari'
    elif 'edge' in user_agent:
        device_info['browser'] = 'edge'
    
    # Detect OS
    if 'windows' in user_agent:
        device_info['os'] = 'windows'
    elif 'mac' in user_agent:
        device_info['os'] = 'mac'
    elif 'linux' in user_agent:
        device_info['os'] = 'linux'
    elif 'android' in user_agent:
        device_info['os'] = 'android'
    elif 'ios' in user_agent or 'iphone' in user_agent:
        device_info['os'] = 'ios'
    
    return device_info

def generate_otp(length=6):
    """
    Generate numeric OTP
    """
    return get_random_string(length, allowed_chars='0123456789')

def generate_reference_number(prefix='ORD'):
    """
    Generate unique reference number
    """
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_suffix = get_random_string(4, allowed_chars='0123456789ABCDEF')
    return f"{prefix}{timestamp}{random_suffix}"

def sanitize_html(text):
    """
    Sanitize HTML content to prevent XSS
    """
    import bleach
    allowed_tags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'span', 'div']
    allowed_attributes = {'span': ['style'], 'div': ['class']}
    return bleach.clean(text, tags=allowed_tags, attributes=allowed_attributes, strip=True)

def validate_base64_image(base64_string):
    """
    Validate base64 image
    """
    import base64
    from PIL import Image
    from io import BytesIO
    
    try:
        # Check if string is valid base64
        image_data = base64.b64decode(base64_string)
        image = Image.open(BytesIO(image_data))
        
        # Validate image format
        if image.format not in ['JPEG', 'PNG', 'WEBP']:
            return False, "Invalid image format. Only JPEG, PNG, WEBP allowed."
        
        # Validate image size (max 5MB)
        if len(image_data) > 5 * 1024 * 1024:
            return False, "Image size must be less than 5MB"
        
        return True, image
    except Exception as e:
        return False, f"Invalid image: {str(e)}"

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates using Haversine formula
    """
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth's radius in km
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return distance

def format_currency(amount, currency='USD'):
    """
    Format currency amount
    """
    from decimal import Decimal
    import locale
    
    try:
        locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
        return locale.currency(amount, grouping=True)
    except:
        return f"{currency} {amount:,.2f}"

def calculate_percentage_change(current, previous):
    """
    Calculate percentage change between two values
    """
    if previous == 0:
        return 0 if current == 0 else 100
    return ((current - previous) / abs(previous)) * 100