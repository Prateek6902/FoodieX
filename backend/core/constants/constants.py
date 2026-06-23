# Restaurant Status
RESTAURANT_STATUS = [
    ('PENDING', 'Pending Approval'),
    ('APPROVED', 'Approved'),
    ('REJECTED', 'Rejected'),
    ('SUSPENDED', 'Suspended'),
    ('ACTIVE', 'Active'),
    ('INACTIVE', 'Inactive'),
]

# Order Status
ORDER_STATUS = [
    ('PENDING', 'Pending'),
    ('ACCEPTED', 'Accepted'),
    ('PREPARING', 'Preparing'),
    ('READY', 'Ready'),
    ('PICKED_UP', 'Picked Up'),
    ('OUT_FOR_DELIVERY', 'Out For Delivery'),
    ('DELIVERED', 'Delivered'),
    ('CANCELLED', 'Cancelled'),
    ('REFUNDED', 'Refunded'),
]

# Payment Status
PAYMENT_STATUS = [
    ('PENDING', 'Pending'),
    ('COMPLETED', 'Completed'),
    ('FAILED', 'Failed'),
    ('REFUNDED', 'Refunded'),
]

# Payment Methods
PAYMENT_METHODS = [
    ('COD', 'Cash on Delivery'),
    ('CARD', 'Credit/Debit Card'),
    ('WALLET', 'Digital Wallet'),
    ('UPI', 'UPI'),
]

# Vendor Status
VENDOR_STATUS = [
    ('PENDING', 'Pending Approval'),
    ('APPROVED', 'Approved'),
    ('REJECTED', 'Rejected'),
    ('SUSPENDED', 'Suspended'),
    ('ACTIVE', 'Active'),
    ('INACTIVE', 'Inactive'),
]

# Document Types
DOCUMENT_TYPES = [
    ('PAN_CARD', 'PAN Card'),
    ('GST_CERTIFICATE', 'GST Certificate'),
    ('FSSAI_LICENSE', 'FSSAI License'),
    ('BANK_STATEMENT', 'Bank Statement'),
    ('ADDRESS_PROOF', 'Address Proof'),
    ('BUSINESS_REGISTRATION', 'Business Registration'),
]

# Notification Types
NOTIFICATION_TYPES = [
    ('ORDER_UPDATE', 'Order Update'),
    ('PROMOTION', 'Promotion'),
    ('SYSTEM', 'System Alert'),
    ('DELIVERY', 'Delivery Update'),
    ('PAYMENT', 'Payment Update'),
    ('SUPPORT', 'Support Message'),
]

# OTP Types
OTP_TYPES = [
    ('EMAIL_VERIFICATION', 'Email Verification'),
    ('PASSWORD_RESET', 'Password Reset'),
    ('MOBILE_VERIFICATION', 'Mobile Verification'),
]

# Task Priority
TASK_PRIORITY = [
    ('HIGH', 'High'),
    ('MEDIUM', 'Medium'),
    ('LOW', 'Low'),
]

# Task Status
TASK_STATUS = [
    ('PENDING', 'Pending'),
    ('IN_PROGRESS', 'In Progress'),
    ('COMPLETED', 'Completed'),
    ('BLOCKED', 'Blocked'),
    ('CANCELLED', 'Cancelled'),
]