from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)

class APIException(Exception):
    def __init__(self, detail, status_code=status.HTTP_400_BAD_REQUEST):
        self.detail = detail
        self.status_code = status_code

class ValidationError(APIException):
    pass

class AuthenticationError(APIException):
    def __init__(self, detail="Authentication failed"):
        super().__init__(detail, status.HTTP_401_UNAUTHORIZED)

class PermissionDeniedError(APIException):
    def __init__(self, detail="Permission denied"):
        super().__init__(detail, status.HTTP_403_FORBIDDEN)

class NotFoundError(APIException):
    def __init__(self, detail="Resource not found"):
        super().__init__(detail, status.HTTP_404_NOT_FOUND)

class BusinessError(APIException):
    pass

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        response.data['status_code'] = response.status_code
        
        if 'detail' in response.data:
            response.data['message'] = response.data.pop('detail')
        
        if isinstance(response.data, dict):
            response.data['success'] = False
    
    # Handle custom exceptions
    if isinstance(exc, APIException):
        return Response(
            {'success': False, 'message': exc.detail},
            status=exc.status_code
        )
    
    # Handle Django ValidationError
    if isinstance(exc, DjangoValidationError):
        return Response(
            {'success': False, 'message': str(exc)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Handle IntegrityError
    if isinstance(exc, IntegrityError):
        logger.error(f"IntegrityError: {str(exc)}")
        return Response(
            {'success': False, 'message': 'Database integrity error occurred'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Log unexpected errors
    if response is None:
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return Response(
            {'success': False, 'message': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response