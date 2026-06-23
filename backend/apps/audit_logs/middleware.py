import json
import time
from django.utils import timezone
from .models import APIAccessLog, AuditLog
from core.utils.helpers import get_client_ip

class APILoggingMiddleware:
    """Middleware to log all API requests"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Skip logging for certain paths
        skip_paths = ['/admin/', '/static/', '/media/', '/api/docs/']
        for skip_path in skip_paths:
            if request.path.startswith(skip_path):
                return self.get_response(request)
        
        # Start timer
        start_time = time.time()
        
        # Process request
        response = self.get_response(request)
        
        # Calculate response time
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Log API access asynchronously (in production, use Celery)
        try:
            # Get request body safely
            request_body = None
            if request.method in ['POST', 'PUT', 'PATCH'] and request.body:
                try:
                    request_body = request.body.decode('utf-8')[:1000]  # Limit size
                except:
                    request_body = str(request.body)[:1000]
            
            # Get response body safely
            response_body = None
            if hasattr(response, 'content') and response.content:
                try:
                    response_body = response.content.decode('utf-8')[:1000]  # Limit size
                except:
                    response_body = str(response.content)[:1000]
            
            APIAccessLog.objects.create(
                method=request.method,
                path=request.path,
                query_params=dict(request.GET),
                request_body=request_body,
                status_code=response.status_code,
                response_body=response_body,
                response_time_ms=response_time_ms,
                user=request.user if request.user.is_authenticated else None,
                user_ip=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                error_message=None if response.status_code < 400 else str(response.content)[:500]
            )
        except Exception as e:
            # Silently fail - don't break the request
            pass
        
        return response

class AuditMiddleware:
    """Middleware to log user actions"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Log for authenticated users on state-changing methods
        if request.user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            try:
                action_map = {
                    'POST': 'CREATE',
                    'PUT': 'UPDATE',
                    'PATCH': 'UPDATE',
                    'DELETE': 'DELETE'
                }
                
                AuditLog.objects.create(
                    user=request.user,
                    user_email=request.user.email,
                    user_role=request.user.role,
                    user_ip=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                    action=action_map.get(request.method, 'VIEW'),
                    model_name=request.resolver_match.url_name if hasattr(request, 'resolver_match') else 'Unknown',
                    request_method=request.method,
                    request_path=request.path,
                    request_query_params=dict(request.GET),
                    status_code=response.status_code,
                    message=f"{request.method} request to {request.path}"
                )
            except Exception:
                pass
        
        return response