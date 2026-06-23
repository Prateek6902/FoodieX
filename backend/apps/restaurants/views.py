from rest_framework import status
import uuid
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Sum, Count, F, Value, FloatField
from django.db.models.functions import Coalesce
from django.utils import timezone
from decimal import Decimal
import secrets
import string

from .models import (
    Restaurant, MenuItem, RestaurantCategory, RestaurantOffer, 
    RestaurantReview, RestaurantBooking, DiningOffer, DiningPromotion
)
from .serializers import (
    RestaurantSerializer, MenuItemSerializer, RestaurantCategorySerializer,
    RestaurantOfferSerializer, RestaurantReviewSerializer, RestaurantBookingSerializer,
    DiningOfferSerializer, DiningPromotionSerializer, RestaurantDetailSerializer
)


# ============= RESTAURANT VIEWS =============

class RestaurantListView(APIView):
    """Get restaurants with filters"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        
        # Base queryset
        restaurants = Restaurant.objects.filter(status='APPROVED', is_active=True)
        
        # If vendor, show only their restaurants
        if user and user.is_authenticated and user.role.upper() == 'VENDOR':
            from apps.vendors.models import Vendor
            try:
                vendor = Vendor.objects.get(user=user)
                restaurants = restaurants.filter(vendor=vendor)
            except Vendor.DoesNotExist:
                restaurants = Restaurant.objects.none()
        
        # Dining filter
        dining = request.query_params.get('dining')
        if dining and dining.lower() in ['true', '1', 'yes']:
            restaurants = restaurants.filter(has_dining=True)
        
        # Filter by cuisine
        cuisine = request.query_params.get('cuisine')
        if cuisine:
            restaurants = restaurants.filter(cuisine_type__icontains=cuisine)
        
        # Filter by city
        city = request.query_params.get('city')
        if city:
            restaurants = restaurants.filter(city__icontains=city)
        
        # Filter by dining type
        dining_type = request.query_params.get('dining_type')
        if dining_type:
            restaurants = restaurants.filter(dining_type=dining_type.upper())
        
        # Filter by features
        features = request.query_params.getlist('features')
        feature_filters = {
            'Pure Veg': Q(is_veg=True),
            'Pet Friendly': Q(pet_friendly=True),
            'Serves Alcohol': Q(serves_alcohol=True),
            'Outdoor Seating': Q(outdoor_seating=True),
            'WiFi': Q(wifi_available=True),
            'Music': Q(music_available=True),
            'Parking': Q(parking_available=True),
        }
        for feature in features:
            if feature in feature_filters:
                restaurants = restaurants.filter(feature_filters[feature])
        
        # Filter by search
        search = request.query_params.get('search')
        if search:
            restaurants = restaurants.filter(
                Q(name__icontains=search) |
                Q(cuisine_type__icontains=search) |
                Q(city__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Filter by mood
        mood = request.query_params.get('mood')
        mood_filters = {
            'pureveg': Q(is_veg=True),
            'rooftop': Q(dining_type='ROOFTOP'),
            'premium': Q(dining_type='FINE'),
            'cozy': Q(dining_type='CAFE'),
            'family': Q(dining_type='FAMILY'),
            'drink_dine': Q(serves_alcohol=True),
            'live_music': Q(has_live_music=True),
            'private': Q(has_private_dining=True),
        }
        if mood in mood_filters:
            restaurants = restaurants.filter(mood_filters[mood])
        
        # Sorting
        sort_by = request.query_params.get('sort', '-rating')
        valid_sorts = ['rating', '-rating', 'name', '-name', 'created_at', '-created_at', 'total_orders', '-total_orders']
        if sort_by in valid_sorts:
            restaurants = restaurants.order_by(sort_by)
        else:
            restaurants = restaurants.order_by('-rating')
        
        # Annotate with average rating
        restaurants = restaurants.annotate(
            avg_rating=Coalesce(Avg('reviews__rating'), Value(0.0), output_field=FloatField())
        )
        
        # Serialize
        serializer = RestaurantSerializer(restaurants, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'count': restaurants.count(),
            'data': serializer.data
        })


class RestaurantDetailView(APIView):
    """Get detailed restaurant information"""
    permission_classes = [AllowAny]
    
    def get(self, request, restaurant_id):
        restaurant = get_object_or_404(Restaurant, id=restaurant_id, is_active=True)
        serializer = RestaurantDetailSerializer(restaurant, context={'request': request})
        
        return Response({
            'success': True,
            'data': serializer.data
        })


class RestaurantCreateView(APIView):
    """Create a new restaurant"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Get data from request
        name = request.data.get('name')
        cuisine_type = request.data.get('cuisine_type')
        city = request.data.get('city')
        
        # Validation
        if not name:
            return Response({
                'success': False,
                'message': 'Restaurant name is required'
            }, status=400)
        
        if not cuisine_type:
            return Response({
                'success': False,
                'message': 'Cuisine type is required'
            }, status=400)
        
        if not city:
            return Response({
                'success': False,
                'message': 'City is required'
            }, status=400)
        
        # Get or create vendor
        from apps.vendors.models import Vendor
        try:
            vendor = Vendor.objects.get(user=user)
        except Vendor.DoesNotExist:
            vendor = Vendor.objects.create(
                user=user,
                business_name=f"{user.first_name} {user.last_name}'s Restaurant",
                business_registration_number=f"REG{timezone.now().strftime('%Y%m%d')}{user.id[:8]}",
                tax_id=f"TAX{timezone.now().strftime('%Y%m%d')}{user.id[:8]}",
                business_address=request.data.get('address_line1', 'Not provided'),
                city=city,
                state=request.data.get('state', 'Maharashtra'),
                country='India',
                postal_code=request.data.get('postal_code', '400001'),
                phone_number=request.data.get('phone_number', 'Not provided'),
                status='APPROVED',
            )
        
        # Create restaurant
        restaurant_data = {
            'vendor': vendor,
            'name': name,
            'cuisine_type': cuisine_type,
            'city': city,
            'delivery_charge': Decimal(str(request.data.get('delivery_charge', 0))),
            'minimum_order_amount': Decimal(str(request.data.get('minimum_order_amount', 0))),
            'phone_number': request.data.get('phone_number', ''),
            'email': request.data.get('email', ''),
            'address_line1': request.data.get('address_line1', ''),
            'opening_time': request.data.get('opening_time', '09:00'),
            'closing_time': request.data.get('closing_time', '22:00'),
            'is_active': True,
            'status': 'APPROVED',
            'rating': Decimal('0'),
            # Dining fields
            'has_dining': request.data.get('has_dining', True),
            'dining_type': request.data.get('dining_type', 'CASUAL'),
            'seating_capacity': request.data.get('seating_capacity', 50),
            'is_veg': request.data.get('is_veg', False),
            'outdoor_seating': request.data.get('outdoor_seating', False),
            'parking_available': request.data.get('parking_available', False),
            'wifi_available': request.data.get('wifi_available', False),
            'music_available': request.data.get('music_available', False),
            'pet_friendly': request.data.get('pet_friendly', False),
            'serves_alcohol': request.data.get('serves_alcohol', False),
            'has_live_music': request.data.get('has_live_music', False),
            'has_private_dining': request.data.get('has_private_dining', False),
            'accepts_reservations': request.data.get('accepts_reservations', True),
            'special_diets': request.data.get('special_diets', []),
            'ambiance': request.data.get('ambiance', []),
            'gallery_images': request.data.get('gallery_images', []),
        }
        
        restaurant = Restaurant.objects.create(**restaurant_data)
        
        # Handle logo upload
        if 'logo' in request.FILES:
            restaurant.logo = request.FILES['logo']
            restaurant.save()
        
        # Build logo URL for response
        logo_url = None
        if restaurant.logo:
            logo_url = request.build_absolute_uri(restaurant.logo.url)
        
        return Response({
            'success': True,
            'message': 'Restaurant created successfully',
            'data': {
                'id': str(restaurant.id),
                'name': restaurant.name,
                'cuisine_type': restaurant.cuisine_type,
                'city': restaurant.city,
                'logo_url': logo_url,
                'vendor_id': str(vendor.id),
                'has_dining': restaurant.has_dining
            }
        }, status=201)


class RestaurantUpdateView(APIView):
    """Update a restaurant"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, restaurant_id):
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        # Check permission
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'You can only update your own restaurants'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        serializer = RestaurantSerializer(restaurant, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            # Handle logo upload
            if 'logo' in request.FILES:
                restaurant.logo = request.FILES['logo']
                restaurant.save()
            serializer.save()
            return Response({
                'success': True,
                'message': 'Restaurant updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=400)


class RestaurantDeleteView(APIView):
    """Soft delete a restaurant"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, restaurant_id):
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        restaurant.is_active = False
        restaurant.save()
        
        return Response({
            'success': True,
            'message': 'Restaurant deactivated successfully'
        })


class ToggleRestaurantStatusView(APIView):
    """Toggle restaurant active status"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, restaurant_id):
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        restaurant.is_active = not restaurant.is_active
        restaurant.save()
        
        status_text = "activated" if restaurant.is_active else "deactivated"
        return Response({
            'success': True,
            'message': f'Restaurant {status_text} successfully'
        })


class ToggleFeaturedView(APIView):
    """Toggle featured status"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, restaurant_id):
        if request.user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Only admins can feature restaurants'
            }, status=403)
        
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        restaurant.is_featured = not restaurant.is_featured
        restaurant.save()
        
        status_text = "featured" if restaurant.is_featured else "unfeatured"
        return Response({
            'success': True,
            'message': f'Restaurant {status_text} successfully'
        })


# ============= CATEGORY VIEWS =============

class CategoryListView(APIView):
    """Get restaurant categories"""
    permission_classes = [AllowAny]
    
    def get(self, request, restaurant_id):
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        categories = RestaurantCategory.objects.filter(restaurant=restaurant, is_active=True)
        serializer = RestaurantCategorySerializer(categories, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class CategoryCreateView(APIView):
    """Create a category"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, restaurant_id):
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        serializer = RestaurantCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(restaurant=restaurant)
            return Response({
                'success': True,
                'message': 'Category created successfully',
                'data': serializer.data
            }, status=201)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=400)


class CategoryUpdateView(APIView):
    """Update a category"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, category_id):
        user = request.user
        category = get_object_or_404(RestaurantCategory, id=category_id)
        restaurant = category.restaurant
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        serializer = RestaurantCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Category updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=400)


class CategoryDeleteView(APIView):
    """Delete a category"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, category_id):
        user = request.user
        category = get_object_or_404(RestaurantCategory, id=category_id)
        restaurant = category.restaurant
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        category.delete()
        return Response({
            'success': True,
            'message': 'Category deleted successfully'
        })


# ============= MENU ITEM VIEWS =============

class MenuItemListView(APIView):
    """Get menu items"""
    permission_classes = [AllowAny]
    
    def get(self, request, restaurant_id):
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        category = request.query_params.get('category')
        menu_items = MenuItem.objects.filter(restaurant=restaurant, is_available=True)
        
        if category:
            menu_items = menu_items.filter(category__icontains=category)
        
        serializer = MenuItemSerializer(menu_items, many=True)
        return Response({
            'success': True,
            'count': menu_items.count(),
            'data': serializer.data
        })


class MenuItemCreateView(APIView):
    """Create a menu item"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, restaurant_id):
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        # Validate required fields
        name = request.data.get('name')
        price = request.data.get('price')
        
        if not name:
            return Response({
                'success': False,
                'message': 'Menu item name is required'
            }, status=400)
        
        if not price:
            return Response({
                'success': False,
                'message': 'Price is required'
            }, status=400)
        
        try:
            price = float(price)
            if price <= 0:
                raise ValueError("Price must be positive")
        except (ValueError, TypeError):
            return Response({
                'success': False,
                'message': 'Invalid price value'
            }, status=400)
        
        # Create menu item
        menu_item = MenuItem.objects.create(
            restaurant=restaurant,
            name=name,
            price=price,
            category=request.data.get('category', 'Uncategorized'),
            description=request.data.get('description', ''),
            preparation_time=request.data.get('preparation_time', 15),
            is_available=request.data.get('is_available', True),
            is_veg=request.data.get('is_veg', True),
            is_recommended=request.data.get('is_recommended', False),
            is_spicy=request.data.get('is_spicy', False),
            calories=request.data.get('calories'),
            dietary_info=request.data.get('dietary_info', []),
            ingredients=request.data.get('ingredients', []),
            allergens=request.data.get('allergens', []),
            discount_price=request.data.get('discount_price'),
            discount_percentage=request.data.get('discount_percentage'),
        )
        
        serializer = MenuItemSerializer(menu_item)
        return Response({
            'success': True,
            'message': 'Menu item added successfully',
            'data': serializer.data
        }, status=201)


class MenuItemUpdateView(APIView):
    """Update a menu item"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, restaurant_id, item_id):
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        menu_item = get_object_or_404(MenuItem, id=item_id, restaurant=restaurant)
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        serializer = MenuItemSerializer(menu_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Menu item updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=400)


class MenuItemDeleteView(APIView):
    """Delete a menu item"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, restaurant_id, item_id):
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        menu_item = get_object_or_404(MenuItem, id=item_id, restaurant=restaurant)
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        menu_item.delete()
        return Response({
            'success': True,
            'message': 'Menu item deleted successfully'
        })


# ============= OFFER VIEWS =============

class OfferListView(APIView):
    """Get restaurant offers"""
    permission_classes = [AllowAny]
    
    def get(self, request, restaurant_id):
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        now = timezone.now()
        offers = RestaurantOffer.objects.filter(
            restaurant=restaurant,
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        )
        serializer = RestaurantOfferSerializer(offers, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class OfferCreateView(APIView):
    """Create an offer"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, restaurant_id):
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        serializer = RestaurantOfferSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(restaurant=restaurant)
            return Response({
                'success': True,
                'message': 'Offer created successfully',
                'data': serializer.data
            }, status=201)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=400)


class OfferUpdateView(APIView):
    """Update an offer"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, offer_id):
        user = request.user
        offer = get_object_or_404(RestaurantOffer, id=offer_id)
        restaurant = offer.restaurant
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        serializer = RestaurantOfferSerializer(offer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Offer updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=400)


class OfferDeleteView(APIView):
    """Delete an offer"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, offer_id):
        user = request.user
        offer = get_object_or_404(RestaurantOffer, id=offer_id)
        restaurant = offer.restaurant
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        offer.delete()
        return Response({
            'success': True,
            'message': 'Offer deleted successfully'
        })


# ============= DINING OFFER VIEWS =============

class DiningOffersView(APIView):
    """Get dining offers"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        offers = DiningOffer.objects.filter(is_active=True)
        today = timezone.now()
        
        # Filter by restaurant
        restaurant_id = request.query_params.get('restaurant_id')
        if restaurant_id:
            offers = offers.filter(restaurant_id=restaurant_id)
        
        # Filter by type
        offer_type = request.query_params.get('type')
        if offer_type:
            offers = offers.filter(type=offer_type)
        
        # Get weekday offers
        weekday = today.weekday()
        is_weekend = weekday >= 5
        
        # Filter based on day type
        type_filter = request.query_params.get('type_filter')
        if type_filter == 'weekday':
            offers = offers.filter(type__in=['WEEKDAY', 'SPECIAL'])
        elif type_filter == 'weekend':
            offers = offers.filter(type__in=['WEEKEND', 'SPECIAL'])
        elif is_weekend:
            offers = offers.filter(Q(type='WEEKEND') | Q(type='SPECIAL') | Q(type='FESTIVE'))
        else:
            offers = offers.filter(Q(type='WEEKDAY') | Q(type='SPECIAL') | Q(type='FESTIVE'))
        
        # Filter by valid date
        offers = offers.filter(valid_from__lte=today, valid_to__gte=today)
        
        serializer = DiningOfferSerializer(offers, many=True)
        return Response({
            'success': True,
            'count': offers.count(),
            'data': serializer.data
        })


# ============= REVIEW VIEWS =============

class ReviewListView(APIView):
    """Get restaurant reviews"""
    permission_classes = [AllowAny]
    
    def get(self, request, restaurant_id):
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        reviews = restaurant.reviews.filter(is_public=True).order_by('-created_at')
        
        # Pagination (simplified)
        limit = int(request.query_params.get('limit', 20))
        offset = int(request.query_params.get('offset', 0))
        reviews = reviews[offset:offset + limit]
        
        serializer = RestaurantReviewSerializer(reviews, many=True)
        return Response({
            'success': True,
            'count': restaurant.reviews.filter(is_public=True).count(),
            'data': serializer.data
        })


class ReviewCreateView(APIView):
    """Create a review"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        restaurant_id = request.data.get('restaurant_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')
        images = request.data.get('images', [])
        dining_experience = request.data.get('dining_experience', {})
        
        if not restaurant_id or not rating:
            return Response({
                'success': False,
                'message': 'Restaurant ID and rating are required'
            }, status=400)
        
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        # Check if user has already reviewed
        existing_review = RestaurantReview.objects.filter(customer=user, restaurant=restaurant).first()
        if existing_review:
            # Update existing review
            existing_review.rating = rating
            existing_review.comment = comment
            existing_review.images = images
            existing_review.dining_experience = dining_experience
            existing_review.save()
            serializer = RestaurantReviewSerializer(existing_review)
            return Response({
                'success': True,
                'message': 'Review updated successfully',
                'data': serializer.data
            })
        
        review = RestaurantReview.objects.create(
            customer=user,
            restaurant=restaurant,
            rating=rating,
            comment=comment,
            images=images,
            dining_experience=dining_experience
        )
        
        # Update restaurant rating
        avg_rating = RestaurantReview.objects.filter(restaurant=restaurant).aggregate(avg=Avg('rating'))['avg']
        if avg_rating:
            restaurant.rating = avg_rating
            restaurant.total_reviews = RestaurantReview.objects.filter(restaurant=restaurant).count()
            restaurant.save()
        
        serializer = RestaurantReviewSerializer(review)
        return Response({
            'success': True,
            'message': 'Review submitted successfully',
            'data': serializer.data
        }, status=201)


class ReviewRespondView(APIView):
    """Respond to a review"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, review_id):
        user = request.user
        review = get_object_or_404(RestaurantReview, id=review_id)
        restaurant = review.restaurant
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        response_text = request.data.get('response')
        if not response_text:
            return Response({
                'success': False,
                'message': 'Response text is required'
            }, status=400)
        
        review.response = response_text
        review.response_at = timezone.now()
        review.save()
        
        return Response({
            'success': True,
            'message': 'Response added successfully'
        })


# ============= BOOKING VIEWS =============

class BookingListView(APIView):
    """Get user's bookings"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        bookings = RestaurantBooking.objects.filter(customer=request.user).order_by('-created_at')
        serializer = RestaurantBookingSerializer(bookings, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class BookingCreateView(APIView):
    """Create a booking"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        restaurant_id = request.data.get('restaurant_id')
        date = request.data.get('date')
        time = request.data.get('time')
        party_size = request.data.get('party_size', 2)
        special_requests = request.data.get('special_requests', '')
        
        if not restaurant_id or not date or not time:
            return Response({
                'success': False,
                'message': 'Restaurant ID, date, and time are required'
            }, status=400)
        
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        # Check if restaurant accepts reservations
        if not restaurant.accepts_reservations:
            return Response({
                'success': False,
                'message': 'This restaurant does not accept reservations'
            }, status=400)
        
        # Check if slot is available (simplified - check existing bookings)
        existing_bookings = RestaurantBooking.objects.filter(
            restaurant=restaurant,
            date=date,
            time=time,
            status__in=['PENDING', 'CONFIRMED']
        )
        
        # Assume capacity based on seating_capacity / 2 (tables)
        max_tables = max(restaurant.seating_capacity // 4, 10) if restaurant.seating_capacity else 20
        if existing_bookings.count() >= max_tables:
            return Response({
                'success': False,
                'message': 'No tables available for this time slot'
            }, status=400)
        
        booking = RestaurantBooking.objects.create(
            customer=user,
            restaurant=restaurant,
            date=date,
            time=time,
            party_size=party_size,
            special_requests=special_requests,
            status='PENDING',
            customer_name=user.full_name or user.email,
            customer_phone=request.data.get('phone_number', ''),
            customer_email=user.email,
        )
        
        serializer = RestaurantBookingSerializer(booking)
        return Response({
            'success': True,
            'message': 'Booking request sent successfully',
            'data': serializer.data
        }, status=201)


class BookingUpdateView(APIView):
    """Update booking status"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, booking_id):
        user = request.user
        booking = get_object_or_404(RestaurantBooking, id=booking_id)
        
        # Only admin/vendor can update status
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if booking.restaurant.vendor and booking.restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            elif booking.customer != user:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        # Customer can only cancel
        if booking.customer == user and user.role.upper() not in ['ADMIN', 'SUPER_ADMIN', 'VENDOR']:
            status_update = request.data.get('status')
            if status_update != 'CANCELLED':
                return Response({
                    'success': False,
                    'message': 'You can only cancel your bookings'
                }, status=403)
        
        serializer = RestaurantBookingSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Booking updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=400)


# ============= SEARCH VIEWS =============

class SearchRestaurantsView(APIView):
    """Search restaurants"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        dining_only = request.query_params.get('dining', 'false').lower() == 'true'
        
        restaurants = Restaurant.objects.filter(
            Q(name__icontains=query) |
            Q(cuisine_type__icontains=query) |
            Q(city__icontains=query) |
            Q(description__icontains=query),
            status='APPROVED',
            is_active=True
        ).distinct()
        
        if dining_only:
            restaurants = restaurants.filter(has_dining=True)
        
        serializer = RestaurantSerializer(restaurants, many=True, context={'request': request})
        return Response({
            'success': True,
            'count': restaurants.count(),
            'data': serializer.data
        })


class NearbyRestaurantsView(APIView):
    """Get nearby restaurants"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        radius = float(request.query_params.get('radius', 5))
        dining_only = request.query_params.get('dining', 'false').lower() == 'true'
        
        restaurants = Restaurant.objects.filter(status='APPROVED', is_active=True)
        
        if dining_only:
            restaurants = restaurants.filter(has_dining=True)
        
        # If coordinates provided, filter by radius (simplified)
        if latitude and longitude:
            # In a real implementation, use GeoDjango or calculate distance
            # For now, just return all approved restaurants
            pass
        
        serializer = RestaurantSerializer(restaurants, many=True, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data
        })


# ============= DASHBOARD VIEWS =============

class RestaurantAnalyticsView(APIView):
    """Get restaurant analytics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, restaurant_id):
        from apps.orders.models import Order, OrderItem
        
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        # Monthly revenue for last 6 months
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        monthly_revenue = []
        for i in range(5, -1, -1):
            month_date = timezone.now().date().replace(day=1) - timezone.timedelta(days=30*i)
            month_orders = Order.objects.filter(
                restaurant=restaurant,
                status='DELIVERED',
                created_at__year=month_date.year,
                created_at__month=month_date.month
            )
            revenue = month_orders.aggregate(total=Sum('total_amount'))['total'] or 0
            monthly_revenue.append({
                'month': month_date.strftime('%b'),
                'revenue': float(revenue)
            })
        
        # Top selling products
        top_products = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__status='DELIVERED'
        ).values('product__name').annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('total_price')
        ).order_by('-total_quantity')[:10]
        
        # Booking statistics
        bookings = RestaurantBooking.objects.filter(restaurant=restaurant)
        total_bookings = bookings.count()
        confirmed_bookings = bookings.filter(status='CONFIRMED').count()
        pending_bookings = bookings.filter(status='PENDING').count()
        cancelled_bookings = bookings.filter(status='CANCELLED').count()
        
        return Response({
            'success': True,
            'data': {
                'monthly_revenue': monthly_revenue,
                'top_products': list(top_products),
                'total_reviews': restaurant.reviews.count(),
                'average_rating': restaurant.reviews.aggregate(avg=Avg('rating'))['avg'] or 0,
                'bookings': {
                    'total': total_bookings,
                    'confirmed': confirmed_bookings,
                    'pending': pending_bookings,
                    'cancelled': cancelled_bookings,
                },
                'total_orders': restaurant.total_orders,
                'total_revenue': float(restaurant.total_revenue),
            }
        })


class RestaurantDashboardView(APIView):
    """Get restaurant dashboard data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, restaurant_id):
        from apps.orders.models import Order
        
        user = request.user
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        
        if user.role.upper() not in ['ADMIN', 'SUPER_ADMIN']:
            if user.role.upper() == 'VENDOR':
                if restaurant.vendor and restaurant.vendor.user != user:
                    return Response({
                        'success': False,
                        'message': 'Permission denied'
                    }, status=403)
            else:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=403)
        
        today = timezone.now().date()
        today_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__date=today
        )
        
        week_ago = timezone.now() - timezone.timedelta(days=7)
        week_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__gte=week_ago
        )
        
        # Today's bookings
        today_bookings = RestaurantBooking.objects.filter(
            restaurant=restaurant,
            date=today
        )
        
        return Response({
            'success': True,
            'data': {
                'today': {
                    'orders': today_orders.count(),
                    'revenue': float(today_orders.aggregate(total=Sum('total_amount'))['total'] or 0),
                    'pending_orders': today_orders.filter(status='PENDING').count(),
                    'bookings': today_bookings.count(),
                },
                'weekly': {
                    'orders': week_orders.count(),
                    'revenue': float(week_orders.aggregate(total=Sum('total_amount'))['total'] or 0)
                },
                'total_reviews': restaurant.reviews.count(),
                'average_rating': restaurant.reviews.aggregate(avg=Avg('rating'))['avg'] or 0,
            }
        })