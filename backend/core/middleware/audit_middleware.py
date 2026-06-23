import json
from django.utils import timezone
from apps.audit_logs.models import AuditLog

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip audit for non-authenticated users or safe methods
        if not request.user.is_authenticated or request.method in ['GET', 'HEAD', 'OPTIONS']:
            return self.get_response(request)
        
        # Capture request body for POST/PUT/PATCH
        request_body = None
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                request_body = json.loads(request.body) if request.body else None
            except:
                request_body = str(request.body)
        
        response = self.get_response(request)
        
        # Log only for status codes 200-399
        if 200 <= response.status_code < 400:
            AuditLog.objects.create(
                user=request.user,
                action=f"{request.method} {request.path}",
                model_name=view.__class__.__name__ if hasattr(request, 'resolver_match') else None,
                object_id=None,
                changes={
                    'request_body': request_body,
                    'response_status': response.status_code,
                    'method': request.method,
                    'path': request.path
                },
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip