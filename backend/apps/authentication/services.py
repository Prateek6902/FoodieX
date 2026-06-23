from apps.users.models import LoginHistory
from apps.authentication.models import SessionTracking
from core.utils.helpers import get_client_ip, get_device_info

class AuthService:
    
    @staticmethod
    def track_login(user, request):
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        device_info = get_device_info(user_agent)
        
        LoginHistory.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            device_type=device_info['device_type'],
            browser=device_info['browser'],
            os=device_info['os'],
            is_successful=True
        )
    
    @staticmethod
    def update_logout_time(user):
        latest_login = LoginHistory.objects.filter(user=user, logout_time__isnull=True).first()
        if latest_login:
            latest_login.logout_time = timezone.now()
            latest_login.save()
    
    @staticmethod
    def track_session(user, jwt_token, request):
        SessionTracking.objects.create(
            user=user,
            session_key=request.session.session_key,
            jwt_token=jwt_token,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            device_id=request.data.get('device_id')
        )