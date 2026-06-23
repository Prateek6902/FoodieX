from django.http import JsonResponse
from django.shortcuts import render
import json

def bad_request(request, exception=None):
    """Handle 400 Bad Request errors"""
    return JsonResponse({
        'success': False,
        'error': 'Bad Request',
        'message': 'The request could not be understood by the server',
        'code': 400
    }, status=400)

def permission_denied(request, exception=None):
    """Handle 403 Forbidden errors"""
    return JsonResponse({
        'success': False,
        'error': 'Forbidden',
        'message': 'You do not have permission to access this resource',
        'code': 403
    }, status=403)

def page_not_found(request, exception=None):
    """Handle 404 Not Found errors"""
    return JsonResponse({
        'success': False,
        'error': 'Not Found',
        'message': 'The requested resource was not found',
        'code': 404
    }, status=404)

def server_error(request):
    """Handle 500 Internal Server Error"""
    return JsonResponse({
        'success': False,
        'error': 'Internal Server Error',
        'message': 'An error occurred on the server. Please try again later.',
        'code': 500
    }, status=500)