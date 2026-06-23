from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, VendorDashboardView, VendorDocumentViewSet, VendorReviewViewSet

router = DefaultRouter()
router.register(r'', VendorViewSet, basename='vendor')
router.register(r'(?P<vendor_pk>[^/.]+)/documents', VendorDocumentViewSet, basename='vendor-documents')
router.register(r'(?P<vendor_pk>[^/.]+)/reviews', VendorReviewViewSet, basename='vendor-reviews')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', VendorDashboardView.as_view(), name='vendor-dashboard'),
    # The analytics endpoint is already available via the ViewSet at /api/vendors/analytics/
]