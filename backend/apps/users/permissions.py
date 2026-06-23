"""
Role-Based Access Control (RBAC) Permissions Matrix
"""

ROLE_PERMISSIONS = {
    'super_admin': [
        '*',  # All permissions
    ],
    
    'admin': [
        'view_dashboard',
        'manage_users',
        'manage_vendors',
        'manage_restaurants',
        'manage_delivery_partners',
        'view_analytics',
        'view_reports',
        'manage_settings',
        'manage_invoices',
        'manage_support_tickets',
        'view_audit_logs',
    ],
    
    'vendor': [
        'view_dashboard',
        'manage_products',
        'view_orders',
        'manage_inventory',
        'view_revenue',
        'view_reports',
        'manage_payouts',
        'view_reviews',
        'manage_offers',
    ],
    
    'restaurant_owner': [
        'view_dashboard',
        'manage_menu',
        'manage_categories',
        'view_orders',
        'manage_reservations',
        'manage_inventory',
        'manage_offers',
        'manage_coupons',
        'view_reviews',
        'view_analytics',
    ],
    
    'customer': [
        'view_dashboard',
        'view_orders',
        'place_orders',
        'manage_profile',
        'view_wallet',
        'view_rewards',
        'manage_addresses',
        'create_support_ticket',
    ],
    
    'delivery_partner': [
        'view_dashboard',
        'view_assigned_orders',
        'update_order_status',
        'view_earnings',
        'manage_availability',
        'view_tracking',
        'view_route',
    ],
    
    'manager': [
        'view_dashboard',
        'view_team',
        'assign_tasks',
        'view_analytics',
        'view_reports',
        'manage_schedule',
        'approve_requests',
    ],
    
    'support_agent': [
        'view_dashboard',
        'manage_tickets',
        'view_customers',
        'view_vendors',
        'send_messages',
        'view_orders',
        'escalate_issues',
    ],
}

def has_permission(user, permission):
    """Check if user has specific permission"""
    if user.role == 'super_admin':
        return True
    
    user_permissions = ROLE_PERMISSIONS.get(user.role, [])
    return permission in user_permissions or '*' in user_permissions