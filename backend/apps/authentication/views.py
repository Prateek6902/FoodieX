from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User, LoginHistory
import json
import random
import string
import re

# Simple OTP storage (in production, use Redis or database)
otp_storage = {}


def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))


def send_verification_email(email, otp, user_name):
    """Send verification email (console for development)"""
    print(f"""
    ╔═══════════════════════════════════════════════════════════════════════════════╗
    ║                         EMAIL VERIFICATION                                    ║
    ╠═══════════════════════════════════════════════════════════════════════════════╣
    ║  To: {email:<55} ║
    ║  Name: {user_name:<53} ║
    ║                                                                               ║
    ║  Your verification code is: {otp}                                             ║
    ║                                                                               ║
    ║  This code will expire in 10 minutes.                                        ║
    ║                                                                               ║
    ║  If you didn't request this, please ignore this email.                       ║
    ╚═══════════════════════════════════════════════════════════════════════════════╝
    """)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_device_info(request):
    """Get device info from user agent"""
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
    
    device_info = {
        'device_type': 'unknown',
        'browser': 'unknown',
        'os': 'unknown'
    }
    
    if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
        device_info['device_type'] = 'mobile'
    elif 'tablet' in user_agent or 'ipad' in user_agent:
        device_info['device_type'] = 'tablet'
    else:
        device_info['device_type'] = 'desktop'
    
    if 'chrome' in user_agent:
        device_info['browser'] = 'chrome'
    elif 'firefox' in user_agent:
        device_info['browser'] = 'firefox'
    elif 'safari' in user_agent:
        device_info['browser'] = 'safari'
    elif 'edge' in user_agent:
        device_info['browser'] = 'edge'
    
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


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.data
            
            username = data.get('username', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            confirm_password = data.get('confirm_password', '')
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            middle_name = data.get('middle_name', '').strip()
            mobile_number = data.get('mobile_number', '').strip()
            role = data.get('role', 'CUSTOMER').upper()
            
            if not username or not email or not password:
                return Response({
                    'success': False,
                    'message': 'Username, email and password are required'
                }, status=400)
            
            if password != confirm_password:
                return Response({
                    'success': False,
                    'message': 'Passwords do not match'
                }, status=400)
            
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                return Response({
                    'success': False,
                    'message': 'Invalid email format'
                }, status=400)
            
            valid_roles = ['CUSTOMER', 'VENDOR', 'DELIVERY_PARTNER']
            if role not in valid_roles:
                role = 'CUSTOMER'
            
            if User.objects.filter(username=username).exists():
                return Response({
                    'success': False,
                    'message': 'Username already exists'
                }, status=400)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'success': False,
                    'message': 'Email already registered'
                }, status=400)
            
            if mobile_number and User.objects.filter(mobile_number=mobile_number).exists():
                return Response({
                    'success': False,
                    'message': 'Mobile number already registered'
                }, status=400)
            
            # Create user (not verified)
            user = User.objects.create(
                username=username,
                email=email,
                password=make_password(password),
                first_name=first_name,
                middle_name=middle_name if middle_name else None,
                last_name=last_name,
                mobile_number=mobile_number if mobile_number else '',
                role=role,
                is_active=True,
                is_verified=False
            )
            
            # Generate and store OTP
            otp = generate_otp()
            otp_storage[email] = {
                'otp': otp,
                'expires_at': timezone.now() + timedelta(minutes=10),
                'type': 'email_verification'
            }
            
            # Send verification email
            send_verification_email(email, otp, f"{first_name} {last_name}")
            
            # Generate temporary token (optional - for auto-login after verification)
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Registration successful! Please verify your email with the OTP sent.',
                'data': {
                    'user_id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_verified': user.is_verified,
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=201)
            
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Registration failed. Please try again.'
            }, status=500)


class VerifyEmailView(APIView):
    """
    Verify email with OTP
    POST /api/auth/verify-email/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.data
            
            email = data.get('email', '').strip().lower()
            otp_code = data.get('otp_code', '').strip()
            
            if not email or not otp_code:
                return Response({
                    'success': False,
                    'message': 'Email and OTP are required'
                }, status=400)
            
            # Check OTP
            stored_otp = otp_storage.get(email)
            if not stored_otp:
                return Response({
                    'success': False,
                    'message': 'OTP not found. Please request a new OTP.',
                    'needs_resend': True
                }, status=400)
            
            if stored_otp['expires_at'] < timezone.now():
                del otp_storage[email]
                return Response({
                    'success': False,
                    'message': 'OTP has expired. Please request a new OTP.',
                    'needs_resend': True
                }, status=400)
            
            if stored_otp['otp'] != otp_code:
                return Response({
                    'success': False,
                    'message': 'Invalid OTP. Please try again.',
                    'attempts_left': 3
                }, status=400)
            
            if stored_otp['type'] != 'email_verification':
                return Response({
                    'success': False,
                    'message': 'Invalid OTP type'
                }, status=400)
            
            # Verify user
            try:
                user = User.objects.get(email=email)
                user.is_verified = True
                user.save()
                del otp_storage[email]
                
                # Generate tokens for auto-login
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'success': True,
                    'message': 'Email verified successfully! You can now login.',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': str(user.id),
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'is_verified': user.is_verified,
                    }
                })
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=404)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)


class ResendOTPView(APIView):
    """
    Resend OTP for email verification
    POST /api/auth/resend-otp/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.data
            
            email = data.get('email', '').strip().lower()
            otp_type = data.get('type', 'email_verification')
            
            if not email:
                return Response({
                    'success': False,
                    'message': 'Email is required'
                }, status=400)
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
                if otp_type == 'email_verification' and user.is_verified:
                    return Response({
                        'success': False,
                        'message': 'Email already verified. Please login.'
                    }, status=400)
                
                user_name = f"{user.first_name} {user.last_name}"
            except User.DoesNotExist:
                # For password reset, don't reveal if user exists
                if otp_type == 'password_reset':
                    return Response({
                        'success': True,
                        'message': 'If email exists, OTP has been sent'
                    })
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=404)
            
            # Generate and send new OTP
            otp = generate_otp()
            otp_storage[email] = {
                'otp': otp,
                'expires_at': timezone.now() + timedelta(minutes=10),
                'type': otp_type
            }
            
            if otp_type == 'email_verification':
                send_verification_email(email, otp, user_name)
                message = 'Verification OTP sent successfully'
            else:
                send_verification_email(email, otp, user_name)
                message = 'Password reset OTP sent successfully'
            
            return Response({
                'success': True,
                'message': message,
                'expires_in': 600  # 10 minutes in seconds
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.data
            
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            
            if not email or not password:
                return Response({
                    'success': False,
                    'message': 'Email and password are required'
                }, status=400)
            
            try:
                user = User.objects.get(email=email)
                
                if not user.check_password(password):
                    return Response({
                        'success': False,
                        'message': 'Invalid email or password'
                    }, status=401)
                
                if not user.is_active:
                    return Response({
                        'success': False,
                        'message': 'Account is disabled. Please contact support.'
                    }, status=401)
                
                # Check if email is verified
                if not user.is_verified:
                    return Response({
                        'success': False,
                        'message': 'Please verify your email first. Check your inbox for OTP.',
                        'requires_verification': True,
                        'email': user.email
                    }, status=401)
                
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])
                
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'success': True,
                    'message': 'Login successful',
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': str(user.id),
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'full_name': user.get_full_name(),
                        'mobile_number': user.mobile_number,
                        'role': user.role,
                        'is_verified': user.is_verified,
                    }
                })
                
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Invalid email or password'
                }, status=401)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.data
            
            refresh_token = data.get('refresh')
            
            if not refresh_token:
                return Response({
                    'success': False,
                    'message': 'Refresh token is required'
                }, status=400)
            
            refresh = RefreshToken(refresh_token)
            
            return Response({
                'success': True,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Invalid refresh token'
            }, status=401)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.data
            
            refresh_token = data.get('refresh')
            
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'success': True,
                'message': 'Logged out successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=400)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'success': True,
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'middle_name': user.middle_name,
                'last_name': user.last_name,
                'full_name': user.full_name,
                'mobile_number': user.mobile_number,
                'profile_picture': user.profile_picture,
                'role': user.role,
                'is_verified': user.is_verified,
                'is_active': user.is_active,
                'created_at': user.created_at,
                'last_login': user.last_login,
            }
        })


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            data = json.loads(request.body) if request.content_type == 'application/json' else request.data
            
            old_password = data.get('old_password')
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')
            
            if not old_password or not new_password:
                return Response({
                    'success': False,
                    'message': 'Old password and new password are required'
                }, status=400)
            
            if new_password != confirm_password:
                return Response({
                    'success': False,
                    'message': 'New passwords do not match'
                }, status=400)
            
            user = request.user
            if not user.check_password(old_password):
                return Response({
                    'success': False,
                    'message': 'Current password is incorrect'
                }, status=400)
            
            user.set_password(new_password)
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password changed successfully. Please login again.'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            data = json.loads(request.body) if request.content_type == 'application/json' else request.data
            email = data.get('email', '').strip().lower()
            
            if not email:
                return Response({
                    'success': False,
                    'message': 'Email is required'
                }, status=400)
            
            try:
                user = User.objects.get(email=email)
                otp = generate_otp()
                otp_storage[email] = {
                    'otp': otp,
                    'expires_at': timezone.now() + timedelta(minutes=10),
                    'type': 'password_reset'
                }
                send_verification_email(email, otp, user.full_name)
                
                return Response({
                    'success': True,
                    'message': 'OTP sent to your email for password reset'
                })
            except User.DoesNotExist:
                return Response({
                    'success': True,
                    'message': 'If email exists, OTP has been sent'
                })
                
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            data = json.loads(request.body) if request.content_type == 'application/json' else request.data
            
            email = data.get('email', '').strip().lower()
            otp_code = data.get('otp_code', '').strip()
            new_password = data.get('new_password', '')
            confirm_password = data.get('confirm_password', '')
            
            if not email or not otp_code or not new_password:
                return Response({
                    'success': False,
                    'message': 'Email, OTP and new password are required'
                }, status=400)
            
            if new_password != confirm_password:
                return Response({
                    'success': False,
                    'message': 'Passwords do not match'
                }, status=400)
            
            stored_otp = otp_storage.get(email)
            if not stored_otp or stored_otp['type'] != 'password_reset':
                return Response({
                    'success': False,
                    'message': 'Invalid or expired OTP request'
                }, status=400)
            
            if stored_otp['expires_at'] < timezone.now():
                del otp_storage[email]
                return Response({
                    'success': False,
                    'message': 'OTP has expired'
                }, status=400)
            
            if stored_otp['otp'] != otp_code:
                return Response({
                    'success': False,
                    'message': 'Invalid OTP'
                }, status=400)
            
            try:
                user = User.objects.get(email=email)
                user.set_password(new_password)
                user.save()
                del otp_storage[email]
                
                return Response({
                    'success': True,
                    'message': 'Password reset successfully. Please login with your new password.'
                })
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=404)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)