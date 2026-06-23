from django.http import JsonResponse
from django.shortcuts import redirect

def home(request):
    return JsonResponse({
        'message': 'Welcome to Food Delivery Platform API',
        'version': '1.0.0',
        'admin_url': '/admin/',
        'api_docs': '/api/docs/',
        'endpoints': {
            'auth': '/api/auth/',
            'users': '/api/users/',
            'orders': '/api/orders/',
            'restaurants': '/api/restaurants/',
            'products': '/api/products/',
        }
    })

def admin_redirect(request):
    return redirect('/admin/')