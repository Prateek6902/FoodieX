from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count, F
from django.utils import timezone
from .models import Product, ProductCategory, ProductVariant, ProductAddon
from .serializers import (
    ProductSerializer, ProductCategorySerializer, 
    ProductVariantSerializer, ProductAddonSerializer
)

# ==================== Product CRUD Views ====================

class ProductListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        products = Product.objects.filter(is_active=True, is_available=True)
        
        # Filter by restaurant
        restaurant_id = request.query_params.get('restaurant_id')
        if restaurant_id:
            products = products.filter(restaurant_id=restaurant_id)
        
        # Filter by category
        category_id = request.query_params.get('category_id')
        if category_id:
            products = products.filter(category_id=category_id)
        
        # Filter by price range
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)
        
        # Filter by veg/non-veg
        is_veg = request.query_params.get('is_veg')
        if is_veg is not None:
            products = products.filter(is_veg=is_veg)
        
        # Search
        search = request.query_params.get('search')
        if search:
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Order by
        ordering = request.query_params.get('ordering', '-created_at')
        products = products.order_by(ordering)
        
        serializer = ProductSerializer(products, many=True)
        return Response({
            'success': True,
            'count': products.count(),
            'data': serializer.data
        })

class ProductDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id, is_active=True)
        serializer = ProductSerializer(product)
        
        # Get additional info
        data = serializer.data
        data['variants'] = ProductVariantSerializer(product.variants.filter(is_active=True), many=True).data
        data['addons'] = ProductAddonSerializer(product.addons.filter(is_active=True), many=True).data
        
        return Response({
            'success': True,
            'data': data
        })

class ProductCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Check if user is vendor or admin
        if request.user.role not in ['VENDOR', 'ADMIN', 'SUPER_ADMIN', 'RESTAURANT_MANAGER']:
            return Response({
                'success': False,
                'message': 'You don\'t have permission to create products'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            return Response({
                'success': True,
                'message': 'Product created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ProductUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        
        # Check permission
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            if hasattr(product, 'restaurant') and product.restaurant.vendor.user != request.user:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Product updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ProductDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        
        # Check permission
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            if hasattr(product, 'restaurant') and product.restaurant.vendor.user != request.user:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
        
        product.is_active = False
        product.save()
        
        return Response({
            'success': True,
            'message': 'Product deleted successfully'
        })

# ==================== Category Views ====================

class CategoryListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        categories = ProductCategory.objects.filter(is_active=True)
        
        # Filter by restaurant
        restaurant_id = request.query_params.get('restaurant_id')
        if restaurant_id:
            categories = categories.filter(restaurant_id=restaurant_id)
        
        serializer = ProductCategorySerializer(categories, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class CategoryCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role not in ['VENDOR', 'ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Category created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, category_id):
        category = get_object_or_404(ProductCategory, id=category_id, is_active=True)
        serializer = ProductCategorySerializer(category)
        
        # Get products in this category
        products = Product.objects.filter(category=category, is_active=True)
        product_serializer = ProductSerializer(products, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'products': product_serializer.data
        })

class CategoryUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, category_id):
        category = get_object_or_404(ProductCategory, id=category_id)
        
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductCategorySerializer(category, data=request.data, partial=True)
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
        }, status=status.HTTP_400_BAD_REQUEST)

class CategoryDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, category_id):
        category = get_object_or_404(ProductCategory, id=category_id)
        
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        category.is_active = False
        category.save()
        
        return Response({
            'success': True,
            'message': 'Category deleted successfully'
        })

# ==================== Variant Views ====================

class VariantListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, product_id):
        variants = ProductVariant.objects.filter(product_id=product_id, is_active=True)
        serializer = ProductVariantSerializer(variants, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class VariantCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        
        if request.user.role not in ['VENDOR', 'ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response({
                'success': True,
                'message': 'Variant created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class VariantUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, variant_id):
        variant = get_object_or_404(ProductVariant, id=variant_id)
        
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductVariantSerializer(variant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Variant updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class VariantDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, variant_id):
        variant = get_object_or_404(ProductVariant, id=variant_id)
        
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        variant.is_active = False
        variant.save()
        
        return Response({
            'success': True,
            'message': 'Variant deleted successfully'
        })

# ==================== Addon Views ====================

class AddonListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, product_id):
        addons = ProductAddon.objects.filter(product_id=product_id, is_active=True)
        serializer = ProductAddonSerializer(addons, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

class AddonCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        
        if request.user.role not in ['VENDOR', 'ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductAddonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response({
                'success': True,
                'message': 'Addon created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class AddonUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, addon_id):
        addon = get_object_or_404(ProductAddon, id=addon_id)
        
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProductAddonSerializer(addon, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Addon updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class AddonDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, addon_id):
        addon = get_object_or_404(ProductAddon, id=addon_id)
        
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        addon.is_active = False
        addon.save()
        
        return Response({
            'success': True,
            'message': 'Addon deleted successfully'
        })

# ==================== Inventory Management ====================

class UpdateStockView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        
        if request.user.role not in ['VENDOR', 'ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        quantity = request.data.get('quantity')
        operation = request.data.get('operation', 'set')
        
        if quantity is None:
            return Response({
                'success': False,
                'message': 'Quantity is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if operation == 'set':
            product.stock_quantity = quantity
        elif operation == 'add':
            product.stock_quantity += quantity
        elif operation == 'subtract':
            product.stock_quantity -= quantity
        else:
            return Response({
                'success': False,
                'message': 'Invalid operation'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        product.save()
        
        return Response({
            'success': True,
            'message': 'Stock updated successfully',
            'data': {
                'product_id': str(product.id),
                'stock_quantity': product.stock_quantity
            }
        })

class InventoryStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['VENDOR', 'ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        products = Product.objects.filter(is_active=True)
        
        # If vendor, only show their products
        if request.user.role == 'VENDOR':
            from apps.vendors.models import Vendor
            vendor = Vendor.objects.get(user=request.user)
            products = products.filter(restaurant__vendor=vendor)
        
        stats = products.aggregate(
            total_products=Count('id'),
            total_value=Sum(F('stock_quantity') * F('price')),
            low_stock=Count('id', filter=Q(stock_quantity__lte=F('low_stock_threshold'), stock_quantity__gt=0)),
            out_of_stock=Count('id', filter=Q(stock_quantity=0))
        )
        
        return Response({
            'success': True,
            'data': stats
        })

class LowStockProductsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['VENDOR', 'ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        products = Product.objects.filter(
            is_active=True,
            stock_quantity__lte=F('low_stock_threshold'),
            stock_quantity__gt=0
        )
        
        # If vendor, only show their products
        if request.user.role == 'VENDOR':
            from apps.vendors.models import Vendor
            vendor = Vendor.objects.get(user=request.user)
            products = products.filter(restaurant__vendor=vendor)
        
        serializer = ProductSerializer(products, many=True)
        return Response({
            'success': True,
            'count': products.count(),
            'data': serializer.data
        })

# ==================== Search Views ====================

class SearchProductsView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        
        products = Product.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query),
            is_active=True,
            is_available=True
        ).distinct()
        
        serializer = ProductSerializer(products, many=True)
        return Response({
            'success': True,
            'count': products.count(),
            'data': serializer.data
        })

class ProductsByRestaurantView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, restaurant_id):
        products = Product.objects.filter(
            restaurant_id=restaurant_id,
            is_active=True,
            is_available=True
        )
        
        serializer = ProductSerializer(products, many=True)
        return Response({
            'success': True,
            'count': products.count(),
            'data': serializer.data
        })

class ProductsByCategoryView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, category_id):
        products = Product.objects.filter(
            category_id=category_id,
            is_active=True,
            is_available=True
        )
        
        serializer = ProductSerializer(products, many=True)
        return Response({
            'success': True,
            'count': products.count(),
            'data': serializer.data
        })

# ==================== Bulk Operations ====================

class BulkUpdateStockView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        updates = request.data.get('updates', [])
        
        for update in updates:
            product_id = update.get('product_id')
            quantity = update.get('quantity')
            
            if product_id and quantity is not None:
                Product.objects.filter(id=product_id).update(stock_quantity=quantity)
        
        return Response({
            'success': True,
            'message': f'Updated {len(updates)} products'
        })

class BulkDeleteProductsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        if request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        product_ids = request.data.get('product_ids', [])
        
        if not product_ids:
            return Response({
                'success': False,
                'message': 'product_ids are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        Product.objects.filter(id__in=product_ids).update(is_active=False)
        
        return Response({
            'success': True,
            'message': f'Deleted {len(product_ids)} products'
        })