from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # JWT Token Endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Authentication URLs
    path('api/auth/', include('apps.authentication.urls')),
    
    # Dashboard URLs
    path('api/dashboard/', include('apps.dashboard.urls')),
    
    # Users URLs
    path('api/users/', include('apps.users.urls')),
    
    # Orders URLs
    path('api/orders/', include('apps.orders.urls')),
    
    # Restaurants URLs
    path('api/restaurants/', include('apps.restaurants.urls')),
    
    # Delivery URLs
    path('api/delivery/', include('apps.delivery_partners.urls')),
    
    # Vendors URLs
    path('api/vendors/', include('apps.vendors.urls')),
    
    # Customers URLs
    path('api/customers/', include('apps.customers.urls')),
    #path('api/dine/', include('apps.dine.urls')),
    # Products URLs
    path('api/products/', include('apps.products.urls')),
    
    # Analytics URLs
    path('api/analytics/', include('apps.analytics.urls')),
    
    # Reports URLs
    path('api/reports/', include('apps.reports.urls')),
    
    # Invoices URLs
    path('api/invoices/', include('apps.invoices.urls')),
    
    # Notifications URLs
    path('api/notifications/', include('apps.notifications.urls')),
    
    # Chat URLs
    path('api/chat/', include('apps.chat.urls')),
    
    # Tasks URLs
    path('api/tasks/', include('apps.tasks.urls')),
    
    # Settings URLs
    path('api/settings/', include('apps.settings_management.urls')),
    
    # Audit Logs URLs
    path('api/audit-logs/', include('apps.audit_logs.urls')),
]

# Serve media and static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug Toolbar (if installed)
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

# Custom error handlers
handler400 = 'apps.common.views.bad_request'
handler403 = 'apps.common.views.permission_denied'
handler404 = 'apps.common.views.page_not_found'
handler500 = 'apps.common.views.server_error'