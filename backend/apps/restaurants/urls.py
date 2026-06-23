from django.urls import path
from . import views

urlpatterns = [
    # Restaurant URLs
    path('', views.RestaurantListView.as_view(), name='restaurant-list'),
    path('<uuid:restaurant_id>/', views.RestaurantDetailView.as_view(), name='restaurant-detail'),
    path('create/', views.RestaurantCreateView.as_view(), name='restaurant-create'),
    path('<uuid:restaurant_id>/update/', views.RestaurantUpdateView.as_view(), name='restaurant-update'),
    path('<uuid:restaurant_id>/delete/', views.RestaurantDeleteView.as_view(), name='restaurant-delete'),
    path('<uuid:restaurant_id>/toggle-status/', views.ToggleRestaurantStatusView.as_view(), name='toggle-status'),
    path('<uuid:restaurant_id>/toggle-featured/', views.ToggleFeaturedView.as_view(), name='toggle-featured'),
    
    # Category URLs
    path('<uuid:restaurant_id>/categories/', views.CategoryListView.as_view(), name='category-list'),
    path('<uuid:restaurant_id>/categories/create/', views.CategoryCreateView.as_view(), name='category-create'),
    path('categories/<uuid:category_id>/update/', views.CategoryUpdateView.as_view(), name='category-update'),
    path('categories/<uuid:category_id>/delete/', views.CategoryDeleteView.as_view(), name='category-delete'),
    
    # Menu Item URLs
    path('<uuid:restaurant_id>/menu/', views.MenuItemListView.as_view(), name='menu-list'),
    path('<uuid:restaurant_id>/menu/create/', views.MenuItemCreateView.as_view(), name='menu-create'),
    path('<uuid:restaurant_id>/menu/<uuid:item_id>/update/', views.MenuItemUpdateView.as_view(), name='menu-update'),
    path('<uuid:restaurant_id>/menu/<uuid:item_id>/delete/', views.MenuItemDeleteView.as_view(), name='menu-delete'),
    
    # Offer URLs
    path('<uuid:restaurant_id>/offers/', views.OfferListView.as_view(), name='offer-list'),
    path('<uuid:restaurant_id>/offers/create/', views.OfferCreateView.as_view(), name='offer-create'),
    path('offers/<uuid:offer_id>/update/', views.OfferUpdateView.as_view(), name='offer-update'),
    path('offers/<uuid:offer_id>/delete/', views.OfferDeleteView.as_view(), name='offer-delete'),
    
    # Dining Offers
    path('dining-offers/', views.DiningOffersView.as_view(), name='dining-offers'),
    
    # Review URLs
    path('<uuid:restaurant_id>/reviews/', views.ReviewListView.as_view(), name='review-list'),
    path('reviews/create/', views.ReviewCreateView.as_view(), name='review-create'),
    path('reviews/<uuid:review_id>/respond/', views.ReviewRespondView.as_view(), name='review-respond'),
    
    # Booking URLs
    path('bookings/', views.BookingListView.as_view(), name='booking-list'),
    path('bookings/create/', views.BookingCreateView.as_view(), name='booking-create'),
    path('bookings/<uuid:booking_id>/update/', views.BookingUpdateView.as_view(), name='booking-update'),
    
    # Search URLs
    path('search/', views.SearchRestaurantsView.as_view(), name='search-restaurants'),
    path('nearby/', views.NearbyRestaurantsView.as_view(), name='nearby-restaurants'),
    
    # Dashboard URLs
    path('<uuid:restaurant_id>/analytics/', views.RestaurantAnalyticsView.as_view(), name='restaurant-analytics'),
    path('<uuid:restaurant_id>/dashboard/', views.RestaurantDashboardView.as_view(), name='restaurant-dashboard'),
]