import uuid
import hashlib
from datetime import datetime
from django.utils import timezone

def generate_unique_id():
    """Generate unique ID"""
    return str(uuid.uuid4())

def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    unique_hash = hashlib.md5(str(uuid.uuid4()).encode()).hexdigest()[:6].upper()
    return f"ORD-{timestamp}-{unique_hash}"

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_device_info(user_agent):
    """Parse user agent to get device info"""
    user_agent = user_agent.lower()
    
    device_type = 'desktop'
    if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
        device_type = 'mobile'
    elif 'tablet' in user_agent or 'ipad' in user_agent:
        device_type = 'tablet'
    
    browser = 'unknown'
    if 'chrome' in user_agent:
        browser = 'chrome'
    elif 'firefox' in user_agent:
        browser = 'firefox'
    elif 'safari' in user_agent:
        browser = 'safari'
    elif 'edge' in user_agent:
        browser = 'edge'
    
    os = 'unknown'
    if 'windows' in user_agent:
        os = 'windows'
    elif 'mac' in user_agent:
        os = 'macos'
    elif 'linux' in user_agent:
        os = 'linux'
    elif 'android' in user_agent:
        os = 'android'
    elif 'ios' in user_agent or 'iphone' in user_agent:
        os = 'ios'
    
    return {
        'device_type': device_type,
        'browser': browser,
        'os': os
    }

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates using Haversine formula"""
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return distance