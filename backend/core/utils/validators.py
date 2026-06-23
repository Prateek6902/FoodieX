import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_password_strength(password):
    """Validate password strength"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not re.search(r'[0-9]', password):
        errors.append("Password must contain at least one number")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")
    
    if errors:
        raise ValidationError(errors)
    
    return password

def validate_indian_mobile_number(value):
    """Validate Indian mobile number"""
    pattern = r'^[6-9]\d{9}$'
    if not re.match(pattern, value):
        raise ValidationError(_('Enter a valid Indian mobile number.'))
    return value

def validate_pincode(value):
    """Validate Indian pincode"""
    pattern = r'^[1-9][0-9]{5}$'
    if not re.match(pattern, str(value)):
        raise ValidationError(_('Enter a valid 6-digit pincode.'))
    return value

def validate_gst_number(value):
    """Validate GST number"""
    pattern = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    if not re.match(pattern, value):
        raise ValidationError(_('Enter a valid GST number.'))
    return value