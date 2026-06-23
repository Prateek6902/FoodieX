from django.urls import path
from . import views

urlpatterns = [
    # Product CRUD
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<uuid:product_id>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('create/', views.ProductCreateView.as_view(), name='product-create'),
    path('<uuid:product_id>/update/', views.ProductUpdateView.as_view(), name='product-update'),
    path('<uuid:product_id>/delete/', views.ProductDeleteView.as_view(), name='product-delete'),
    
    # Product Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/create/', views.CategoryCreateView.as_view(), name='category-create'),
    path('categories/<uuid:category_id>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('categories/<uuid:category_id>/update/', views.CategoryUpdateView.as_view(), name='category-update'),
    path('categories/<uuid:category_id>/delete/', views.CategoryDeleteView.as_view(), name='category-delete'),
    
    # Product Variants
    path('<uuid:product_id>/variants/', views.VariantListView.as_view(), name='variant-list'),
    path('<uuid:product_id>/variants/create/', views.VariantCreateView.as_view(), name='variant-create'),
    path('variants/<uuid:variant_id>/update/', views.VariantUpdateView.as_view(), name='variant-update'),
    path('variants/<uuid:variant_id>/delete/', views.VariantDeleteView.as_view(), name='variant-delete'),
    
    # Product Addons
    path('<uuid:product_id>/addons/', views.AddonListView.as_view(), name='addon-list'),
    path('<uuid:product_id>/addons/create/', views.AddonCreateView.as_view(), name='addon-create'),
    path('addons/<uuid:addon_id>/update/', views.AddonUpdateView.as_view(), name='addon-update'),
    path('addons/<uuid:addon_id>/delete/', views.AddonDeleteView.as_view(), name='addon-delete'),
    
    # Inventory Management
    path('<uuid:product_id>/update-stock/', views.UpdateStockView.as_view(), name='update-stock'),
    path('inventory/stats/', views.InventoryStatsView.as_view(), name='inventory-stats'),
    path('low-stock/', views.LowStockProductsView.as_view(), name='low-stock'),
    
    # Search and Filter
    path('search/', views.SearchProductsView.as_view(), name='search-products'),
    path('by-restaurant/<uuid:restaurant_id>/', views.ProductsByRestaurantView.as_view(), name='products-by-restaurant'),
    path('by-category/<uuid:category_id>/', views.ProductsByCategoryView.as_view(), name='products-by-category'),
    
    # Bulk Operations
    path('bulk-update-stock/', views.BulkUpdateStockView.as_view(), name='bulk-update-stock'),
    path('bulk-delete/', views.BulkDeleteProductsView.as_view(), name='bulk-delete'),
]