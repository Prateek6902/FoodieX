import logging
import json
from django.utils import timezone
from django.http import JsonResponse
from rest_framework import status
from apps.audit_logs.models import AuditLog
from apps.common.utils import get_client_ip

logger = logging.getLogger(__name__)

class AuditLogMiddleware:
    """
    Middleware to log all API requests and responses
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log request
        if request.path.startswith('/api/'):
            request.start_time = timezone.now()
            
        response = self.get_response(request)
        
        # Log response
        if hasattr(request, 'start_time') and request.user.is_authenticated:
            response_time = (timezone.now() - request.start_time).total_seconds()
            
            AuditLog.objects.create(
                user=request.user,
                action=request.method,
                model_name=request.path.split('/')[3] if len(request.path.split('/')) > 3 else '',
                object_id=request.resolver_match.kwargs.get('pk', ''),
                changes={
                    'path': request.path,
                    'method': request.method,
                    'status_code': response.status_code,
                    'response_time': response_time,
                    'ip_address': get_client_ip(request),
                    'user_agent': request.META.get('HTTP_USER_AGENT', '')
                },
                ip_address=get_client_ip(request)
            )
        
        return response

class ExceptionHandlingMiddleware:
    """
    Global exception handling middleware
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        return self.get_response(request)
    
    def process_exception(self, request, exception):
        logger.error(f"Unhandled exception: {str(exception)}", exc_info=True)
        
        return JsonResponse(
            {
                'error': 'An internal server error occurred',
                'code': 'INTERNAL_SERVER_ERROR'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class RequestLoggingMiddleware:
    """
    Log all incoming requests
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log only API requests
        if request.path.startswith('/api/'):
            logger.info(
                f"Request: {request.method} {request.path} | "
                f"IP: {get_client_ip(request)} | "
                f"User: {request.user.username if request.user.is_authenticated else 'Anonymous'}"
            )
        
        response = self.get_response(request)
        
        if request.path.startswith('/api/'):
            logger.info(
                f"Response: {request.method} {request.path} | "
                f"Status: {response.status_code}"
            )
        
        return response