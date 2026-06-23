from django.urls import path
from . import views

urlpatterns = [
    # Customer Profile
    path('profile/', views.CustomerProfileView.as_view(), name='customer-profile'),
    path('update-profile/', views.UpdateCustomerProfileView.as_view(), name='update-profile'),
    
    # Address Management
    path('addresses/', views.AddressListView.as_view(), name='address-list'),
    path('addresses/create/', views.AddressCreateView.as_view(), name='address-create'),
    path('addresses/<uuid:address_id>/', views.AddressDetailView.as_view(), name='address-detail'),
    path('addresses/<uuid:address_id>/update/', views.AddressUpdateView.as_view(), name='address-update'),
    path('addresses/<uuid:address_id>/delete/', views.AddressDeleteView.as_view(), name='address-delete'),
    path('addresses/<uuid:address_id>/set-default/', views.SetDefaultAddressView.as_view(), name='set-default-address'),
    
    # Wishlist
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/add/<uuid:product_id>/', views.AddToWishlistView.as_view(), name='add-to-wishlist'),
    path('wishlist/remove/<uuid:product_id>/', views.RemoveFromWishlistView.as_view(), name='remove-from-wishlist'),
    path('wishlist/clear/', views.ClearWishlistView.as_view(), name='clear-wishlist'),
    
    # Order History
    path('orders/', views.CustomerOrderHistoryView.as_view(), name='order-history'),
    path('orders/<uuid:order_id>/', views.CustomerOrderDetailView.as_view(), name='order-detail'),
    path('orders/<uuid:order_id>/track/', views.TrackOrderView.as_view(), name='track-order'),
    path('orders/<uuid:order_id>/cancel/', views.CancelOrderView.as_view(), name='cancel-order'),
    
    # Reviews
    path('reviews/', views.CustomerReviewsView.as_view(), name='customer-reviews'),
    path('reviews/create/', views.CreateReviewView.as_view(), name='create-review'),
    path('reviews/<uuid:review_id>/update/', views.UpdateReviewView.as_view(), name='update-review'),
    path('reviews/<uuid:review_id>/delete/', views.DeleteReviewView.as_view(), name='delete-review'),
    
    # Dashboard
    path('dashboard/', views.CustomerDashboardView.as_view(), name='customer-dashboard'),
    path('analytics/', views.CustomerAnalyticsView.as_view(), name='customer-analytics'),
    
    # Wallet
    path('wallet/', views.WalletView.as_view(), name='wallet'),
    path('wallet/add/', views.AddToWalletView.as_view(), name='wallet-add'),
    path('wallet/transactions/', views.WalletTransactionsView.as_view(), name='wallet-transactions'),
    
    # Coupons
    path('coupons/', views.CouponListView.as_view(), name='coupon-list'),
    path('coupons/apply/', views.ApplyCouponView.as_view(), name='coupon-apply'),
    
    # Feedback
    path('feedback/', views.FeedbackListView.as_view(), name='feedback-list'),
    path('feedback/create/', views.FeedbackCreateView.as_view(), name='feedback-create'),
]