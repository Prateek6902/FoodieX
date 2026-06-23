from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import Http404
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """Custom exception handler for consistent error responses"""
    
    response = exception_handler(exc, context)
    
    if response is not None:
        return Response({
            'success': False,
            'message': response.data.get('detail', 'An error occurred'),
            'errors': response.data
        }, status=response.status_code)
    
    # Handle custom exceptions
    if isinstance(exc, ValidationError):
        return Response({
            'success': False,
            'message': 'Validation Error',
            'errors': exc.message_dict
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if isinstance(exc, IntegrityError):
        logger.error(f"Database integrity error: {str(exc)}")
        return Response({
            'success': False,
            'message': 'Database constraint violation',
            'errors': {'detail': str(exc)}
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if isinstance(exc, Http404):
        return Response({
            'success': False,
            'message': 'Resource not found',
            'errors': {'detail': str(exc)}
        }, status=status.HTTP_404_NOT_FOUND)
    
    if isinstance(exc, PermissionError):
        return Response({
            'success': False,
            'message': 'Permission denied',
            'errors': {'detail': str(exc)}
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Log unexpected errors
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return Response({
        'success': False,
        'message': 'Internal server error',
        'errors': {'detail': 'An unexpected error occurred'}
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)