import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class UppercaseValidator:
    """
    Validate that the password contains at least one uppercase letter.
    """
    def validate(self, password, user=None):
        if not re.findall('[A-Z]', password):
            raise ValidationError(
                _("The password must contain at least 1 uppercase letter, A-Z."),
                code='password_no_upper',
            )
    
    def get_help_text(self):
        return _("Your password must contain at least 1 uppercase letter, A-Z.")

class SpecialCharacterValidator:
    """
    Validate that the password contains at least one special character.
    """
    def validate(self, password, user=None):
        if not re.findall('[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]', password):
            raise ValidationError(
                _("The password must contain at least 1 special character."),
                code='password_no_special',
            )
    
    def get_help_text(self):
        return _("Your password must contain at least 1 special character.")

class PhoneNumberValidator:
    """
    Validate phone number format
    """
    def __call__(self, value):
        if not re.match(r'^\+?1?\d{9,15}$', value):
            raise ValidationError('Enter a valid phone number (e.g., +1234567890)')
        return value