# 🍔 FoodieX - Multi-Vendor Food Delivery Platform

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [User Roles & Permissions](#user-roles--permissions)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Architecture](#api-architecture)
- [Installation Guide](#installation-guide)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**FoodieX** is a comprehensive, multi-vendor food delivery platform built with Django (backend) and React (frontend). It connects customers with restaurants, vendors, and delivery partners in a seamless ecosystem. The platform supports multiple user roles with granular permissions, real-time order tracking, and a modern dining experience.

### 🌟 Key Highlights
- **Multi-Role System**: Admin, Vendor, Delivery Partner, Customer
- **Restaurant Management**: Vendors can manage multiple restaurants, menus, and offers
- **Dining Experience**: Table booking, dine-in offers, ambiance galleries
- **Real-Time Tracking**: Live order tracking with delivery partner assignment
- **Smart Analytics**: Role-specific dashboards with actionable insights
- **Secure Payments**: Integrated payment gateway with wallet system
- **Veg Mode**: Pure vegetarian restaurant filtering for customers
- **Mobile-Responsive**: Fully responsive design for all devices

---

## 👥 User Roles & Permissions

### 1. 👑 Super Admin
**Full Platform Control**

| Feature | Access |
|---------|--------|
| User Management | ✅ Full CRUD on all users |
| Restaurant Management | ✅ Approve/Reject/Suspend restaurants |
| Order Management | ✅ View all orders, update status |
| Vendor Management | ✅ Approve vendor registrations |
| Delivery Partner Management | ✅ Approve/Manage delivery partners |
| Analytics | ✅ Platform-wide analytics dashboard |
| Content Management | ✅ Manage offers, promotions, banners |
| Settings | ✅ Platform settings & configurations |
| Payout Management | ✅ Process vendor/delivery payouts |

### 2. 🏪 Vendor
**Restaurant Owner/Manager**

| Feature | Access |
|---------|--------|
| Restaurant Management | ✅ Create/Update/Delete own restaurants |
| Menu Management | ✅ Add/Update/Delete menu items |
| Order Management | ✅ View own restaurant orders |
| Offer Management | ✅ Create dining & delivery offers |
| Booking Management | ✅ View/Confirm/Cancel table bookings |
| Analytics Dashboard | ✅ Revenue, orders, ratings insights |
| Restaurant Profile | ✅ Manage restaurant details, images, gallery |
| Payout History | ✅ View earnings and payment history |
| Customer Reviews | ✅ View and respond to reviews |
| Staff Management | ✅ Add staff members (future) |

### 3. 🚚 Delivery Partner
**Delivery Personnel**

| Feature | Access |
|---------|--------|
| Order Assignment | ✅ Accept/reject delivery orders |
| Live Tracking | ✅ Update order status (picked up, delivered) |
| Earnings Dashboard | ✅ View daily/weekly earnings |
| Delivery History | ✅ View completed deliveries |
| Profile Management | ✅ Update availability, vehicle details |
| Performance Metrics | ✅ View delivery statistics and ratings |
| Payout History | ✅ View payment history |

### 4. 👤 Customer
**Food Ordering & Dining Experience**

| Feature | Access |
|---------|--------|
| Restaurant Browsing | ✅ Search, filter, explore restaurants |
| Order Management | ✅ Place, track, cancel orders |
| Dining Experience | ✅ Table booking, dine-in offers |
| Wishlist | ✅ Save favorite restaurants |
| Reviews & Ratings | ✅ Rate restaurants and write reviews |
| Cart Management | ✅ Add/remove items, apply coupons |
| Wallet System | ✅ Add money, view transaction history |
| Order History | ✅ View past orders and reorder |
| Profile Management | ✅ Manage addresses, preferences |
| Veg Mode | ✅ Toggle pure vegetarian restaurants |
| Subscription Plans | ✅ Subscribe for premium benefits |

---

## 🛠️ Tech Stack

### Backend
```
┌─────────────────────────────────────────────────────┐
│                    BACKEND STACK                    │
├─────────────────────────────────────────────────────┤
│  🐍 Python 3.12+                                   │
│  🏗️ Django 5.0+                                    │
│  🔄 Django REST Framework 3.15+                    │
│  🔐 JWT Authentication                             │
│  📊 PostgreSQL 15+                                 │
│  🗄️ Redis (Caching & Sessions)                     │
│  📨 Celery (Async Tasks)                           │
│  📦 Django CORS Headers                            │
│  🔍 Django Filter                                 │
│  📷 Pillow (Image Processing)                      │
│  📝 Django Debug Toolbar                          │
└─────────────────────────────────────────────────────┘
```

### Frontend
```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND STACK                    │
├─────────────────────────────────────────────────────┤
│  ⚛️ React 18+                                      │
│  🏗️ TypeScript 5+                                  │
│  🎨 TailwindCSS 3+                                 │
│  🎭 Framer Motion (Animations)                     │
│  📡 React Query (Data Fetching)                    │
│  🗺️ React Router DOM 6+                           │
│  🔄 Zustand (State Management)                     │
│  🎯 Axios (HTTP Client)                           │
│  🍞 React Hot Toast (Notifications)               │
│  📊 Recharts (Charts & Analytics)                  │
│  📷 React Dropzone (File Upload)                   │
│  🗓️ React DatePicker                               │
│  🌍 Google Maps API                                │
└─────────────────────────────────────────────────────┘
```

### DevOps & Deployment
```
┌─────────────────────────────────────────────────────┐
│                  DEVOPS STACK                      │
├─────────────────────────────────────────────────────┤
│  🐳 Docker & Docker Compose                        │
│  ☁️ AWS EC2 / DigitalOcean                         │
│  🚀 Nginx (Reverse Proxy)                         │
│  🔒 SSL/HTTPS (Let's Encrypt)                     │
│  🔄 CI/CD (GitHub Actions)                        │
│  📊 Monitoring (Sentry, New Relic)                │
│  📝 Logging (ELK Stack)                           │
│  📦 Package Managers: pip, npm/yarn               │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Core Tables

```sql
-- Users & Authentication
users_user
  - id (UUID, PK)
  - email (unique)
  - full_name
  - role (ADMIN, VENDOR, DELIVERY, CUSTOMER)
  - mobile_number
  - profile_picture
  - is_active
  - created_at
  - updated_at

-- Vendors
vendors_vendor
  - id (UUID, PK)
  - user_id (FK -> users_user)
  - business_name
  - business_registration_number
  - tax_id
  - business_address
  - city, state, country
  - postal_code
  - phone_number
  - status (PENDING, APPROVED, REJECTED, SUSPENDED)
  - rating
  - total_revenue
  - created_at
  - updated_at

-- Restaurants
restaurants_restaurant
  - id (UUID, PK)
  - vendor_id (FK -> vendors_vendor)
  - name
  - description
  - cuisine_type
  - phone_number, email
  - address_line1, address_line2
  - city, state, postal_code, country
  - latitude, longitude
  - logo, logo_url
  - cover_image, cover_image_url
  - gallery_images (JSON)
  - status (PENDING, APPROVED, REJECTED, SUSPENDED)
  - is_active, is_featured
  - rating, total_reviews
  - opening_time, closing_time, is_open_24_7
  - minimum_order_amount
  - delivery_radius_km, delivery_charge
  - has_dining, dining_type
  - seating_capacity, is_veg
  - outdoor_seating, parking_available
  - wifi_available, music_available
  - pet_friendly, serves_alcohol
  - has_live_music, has_private_dining
  - accepts_reservations
  - special_diets (JSON), ambiance (JSON)
  - total_orders, total_revenue
  - created_at, updated_at

-- Menu Items
restaurants_menuitem
  - id (UUID, PK)
  - restaurant_id (FK -> restaurants_restaurant)
  - name, description
  - price
  - category, sub_category
  - is_available, is_veg
  - is_recommended, is_spicy
  - preparation_time
  - image, calories
  - dietary_info (JSON), ingredients (JSON)
  - allergens (JSON)
  - total_sold
  - discount_price, discount_percentage
  - created_at, updated_at

-- Restaurant Categories
restaurants_restaurantcategory
  - id (UUID, PK)
  - restaurant_id (FK -> restaurants_restaurant)
  - name, description
  - image, display_order
  - is_active
  - created_at

-- Restaurant Offers
restaurants_restaurantoffer
  - id (UUID, PK)
  - restaurant_id (FK -> restaurants_restaurant)
  - title, description
  - discount_type (PERCENTAGE, FIXED, BOGO, COMBO)
  - discount_value
  - minimum_order, max_discount
  - target_type (ALL, CATEGORY, ITEM, DINING, DELIVERY)
  - target_id (UUID, nullable)
  - valid_from, valid_to
  - is_active
  - days_of_week (JSON), time_slots (JSON)
  - created_at, updated_at

-- Dining Offers
restaurants_diningoffer
  - id (UUID, PK)
  - restaurant_id (FK -> restaurants_restaurant)
  - title, description
  - discount
  - type (WEEKDAY, WEEKEND, SPECIAL, FESTIVE, HAPPY_HOUR, BIRTHDAY)
  - valid_from, valid_to
  - is_active
  - terms_conditions
  - minimum_spend, max_discount_amount
  - created_at, updated_at

-- Restaurant Bookings
restaurants_restaurantbooking
  - id (UUID, PK)
  - restaurant_id (FK -> restaurants_restaurant)
  - customer_id (FK -> users_user)
  - date, time
  - party_size
  - special_requests
  - table_number
  - status (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
  - customer_name, customer_phone, customer_email
  - booking_reference (unique)
  - created_at, updated_at

-- Restaurant Reviews
restaurants_restaurantreview
  - id (UUID, PK)
  - restaurant_id (FK -> restaurants_restaurant)
  - customer_id (FK -> users_user)
  - order_id (nullable)
  - rating (1-5)
  - comment, response
  - response_at
  - images (JSON)
  - dining_experience (JSON)
  - is_verified, is_public
  - created_at, updated_at

-- Orders
orders_order
  - id (UUID, PK)
  - order_number (unique)
  - customer_id (FK -> users_user)
  - restaurant_id (FK -> restaurants_restaurant)
  - delivery_partner_id (FK -> users_user, nullable)
  - status (PENDING, CONFIRMED, PREPARING, READY, PICKED_UP, DELIVERED, CANCELLED)
  - total_amount
  - delivery_charge
  - tax_amount
  - discount_amount
  - payment_method (CASH, CARD, WALLET, UPI)
  - payment_status (PENDING, PAID, FAILED)
  - delivery_address
  - delivery_latitude, delivery_longitude
  - special_instructions
  - estimated_delivery_time
  - actual_delivery_time
  - created_at, updated_at

-- Order Items
orders_orderitem
  - id (UUID, PK)
  - order_id (FK -> orders_order)
  - menu_item_id (FK -> restaurants_menuitem)
  - quantity
  - price_per_unit
  - total_price
  - special_instructions

-- Cart
orders_cart
  - id (UUID, PK)
  - customer_id (FK -> users_user)
  - restaurant_id (FK -> restaurants_restaurant)
  - created_at, updated_at

-- Cart Items
orders_cartitem
  - id (UUID, PK)
  - cart_id (FK -> orders_cart)
  - menu_item_id (FK -> restaurants_menuitem)
  - quantity
  - price_per_unit
  - total_price
  - special_instructions

-- Wallet
wallet_wallet
  - id (UUID, PK)
  - user_id (FK -> users_user)
  - balance
  - created_at, updated_at

-- Wallet Transactions
wallet_transaction
  - id (UUID, PK)
  - wallet_id (FK -> wallet_wallet)
  - amount
  - transaction_type (CREDIT, DEBIT)
  - description
  - reference_id (nullable)
  - status (PENDING, COMPLETED, FAILED)
  - created_at

-- Payments
payments_payment
  - id (UUID, PK)
  - order_id (FK -> orders_order)
  - amount
  - payment_method
  - payment_id (gateway reference)
  - status (PENDING, SUCCESS, FAILED)
  - created_at, updated_at

-- Delivery Tracking
delivery_tracking
  - id (UUID, PK)
  - order_id (FK -> orders_order)
  - delivery_partner_id (FK -> users_user)
  - latitude, longitude
  - status (PENDING, PICKED_UP, IN_TRANSIT, DELIVERED)
  - timestamp
  - created_at
```

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────▶│   vendors   │────▶│ restaurants │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │                                       ▼
       │                                ┌─────────────┐
       │                                │  menu_items │
       │                                └─────────────┘
       │                                       │
       │                                       ▼
       │                                ┌─────────────┐
       │                                │  categories │
       │                                └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    orders   │────▶│  order_items│     │  bookings   │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   payments  │     │    wallet   │     │   reviews   │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  delivery   │     │    carts    │
│   tracking  │     └─────────────┘
└─────────────┘
```

---

## 🏗️ Project Structure

```
FoodieX/
├── backend/
│   ├── apps/
│   │   ├── restaurants/
│   │   │   ├── models.py          # Restaurant, Menu, Booking models
│   │   │   ├── views.py           # API views
│   │   │   ├── serializers.py     # REST serializers
│   │   │   ├── urls.py            # API endpoints
│   │   │   ├── admin.py           # Admin interface
│   │   │   ├── apps.py            # App config
│   │   │   └── __init__.py
│   │   ├── orders/
│   │   │   ├── models.py          # Order, Cart, Payment models
│   │   │   ├── views.py           # Order API views
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   ├── users/
│   │   │   ├── models.py          # Custom User model
│   │   │   ├── views.py           # Authentication, Profile
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   ├── vendors/
│   │   │   ├── models.py          # Vendor registration
│   │   │   ├── views.py           # Vendor APIs
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   ├── delivery/
│   │   │   ├── models.py          # Delivery partner models
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   ├── payments/
│   │   │   ├── models.py          # Payment gateway integration
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   └── analytics/
│   │       ├── models.py          # Analytics models
│   │       ├── views.py           # Dashboard data
│   │       └── urls.py
│   ├── core/
│   │   ├── settings/
│   │   │   ├── base.py            # Base settings
│   │   │   ├── development.py     # Dev settings
│   │   │   └── production.py      # Production settings
│   │   ├── urls.py                # Main URL routing
│   │   ├── wsgi.py               # WSGI config
│   │   └── asgi.py               # ASGI config
│   ├── manage.py
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AdminUsers.tsx
│   │   │   │   └── AdminRestaurants.tsx
│   │   │   ├── vendor/
│   │   │   │   ├── VendorDashboard.tsx
│   │   │   │   ├── VendorRestaurants.tsx
│   │   │   │   ├── VendorOrders.tsx
│   │   │   │   ├── VendorAnalytics.tsx
│   │   │   │   └── VendorRegister.tsx
│   │   │   ├── delivery/
│   │   │   │   ├── DeliveryDashboard.tsx
│   │   │   │   ├── DeliveryOrders.tsx
│   │   │   │   └── DeliveryEarnings.tsx
│   │   │   ├── customer/
│   │   │   │   ├── CustomerDashboard.tsx
│   │   │   │   ├── CustomerDiningPage.tsx
│   │   │   │   ├── CustomerRestaurants.tsx
│   │   │   │   ├── CustomerOrders.tsx
│   │   │   │   ├── CustomerCart.tsx
│   │   │   │   ├── CustomerWishlist.tsx
│   │   │   │   ├── CustomerWallet.tsx
│   │   │   │   └── CustomerProfile.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   └── guest/
│   │   │       ├── GuestHomePage.tsx
│   │   │       ├── GuestRestaurants.tsx
│   │   │       └── GuestAbout.tsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── layouts/
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   └── CustomerLayout.tsx
│   │   │   └── ui/
│   │   │       ├── Card.tsx
│   │   │       ├── Button.tsx
│   │   │       └── Modal.tsx
│   │   ├── services/
│   │   │   ├── api.ts             # Axios config
│   │   │   ├── auth.ts            # Auth services
│   │   │   ├── restaurants.ts     # Restaurant APIs
│   │   │   ├── orders.ts          # Order APIs
│   │   │   └── payments.ts        # Payment APIs
│   │   ├── stores/
│   │   │   ├── authStore.ts       # Auth state
│   │   │   ├── cartStore.ts       # Cart state
│   │   │   └── restaurantStore.ts # Restaurant state
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useCart.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── validators.ts
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
│
├── docker-compose.yml
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🔧 Installation Guide

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/Prateek6902/FoodieX.git
cd FoodieX
```

### Step 2: Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements/base.txt

# Setup environment variables
cp backend/.env.example backend/.env
# Edit .env with your database credentials

# Run migrations
python backend/manage.py makemigrations
python backend/manage.py migrate

# Create superuser
python backend/manage.py createsuperuser

# Seed sample data (optional)
python backend/manage.py seed_data

# Run development server
python backend/manage.py runserver
```

### Step 3: Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API URL

# Run development server
npm run dev
```

### Step 4: Docker Setup (Optional)
```bash
# Build and run with Docker
docker-compose up --build

# Run migrations in Docker
docker-compose exec web python manage.py migrate

# Create superuser in Docker
docker-compose exec web python manage.py createsuperuser
```

### Step 5: Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/
- API Documentation: http://localhost:8000/api/docs/

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=foodiex_db
DB_USER=foodiex_user
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_LIFETIME=3600
JWT_REFRESH_TOKEN_LIFETIME=86400

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Payment Gateway (Razorpay/Stripe)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# AWS S3 (for media storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

---

## 📡 API Endpoints

### Authentication
```
POST /api/auth/login/          # Login user
POST /api/auth/register/       # Register user
POST /api/auth/refresh/        # Refresh JWT token
POST /api/auth/logout/         # Logout user
GET  /api/auth/profile/        # Get user profile
PUT  /api/auth/profile/        # Update user profile
```

### Restaurants
```
GET    /api/restaurants/                    # List restaurants
GET    /api/restaurants/<id>/              # Restaurant detail
POST   /api/restaurants/                    # Create restaurant (Vendor)
PUT    /api/restaurants/<id>/              # Update restaurant (Vendor)
DELETE /api/restaurants/<id>/              # Delete restaurant (Vendor)
GET    /api/restaurants/<id>/menu/         # Get restaurant menu
POST   /api/restaurants/<id>/menu/         # Add menu item (Vendor)
GET    /api/restaurants/<id>/reviews/      # Get reviews
POST   /api/restaurants/reviews/           # Add review (Customer)
GET    /api/restaurants/search/            # Search restaurants
GET    /api/restaurants/nearby/            # Nearby restaurants
GET    /api/restaurants/dining/            # Dining restaurants
```

### Orders
```
GET    /api/orders/                        # List orders
GET    /api/orders/<id>/                   # Order detail
POST   /api/orders/                        # Create order
PUT    /api/orders/<id>/                   # Update order
DELETE /api/orders/<id>/                   # Cancel order
GET    /api/orders/track/<id>/             # Track order
POST   /api/orders/<id>/assign/            # Assign delivery partner
```

### Bookings
```
GET    /api/bookings/                      # List bookings
POST   /api/bookings/                      # Create booking
PUT    /api/bookings/<id>/                 # Update booking
DELETE /api/bookings/<id>/                 # Cancel booking
GET    /api/bookings/restaurant/<id>/      # Restaurant bookings
```

### Vendors
```
GET    /api/vendors/                       # List vendors
GET    /api/vendors/<id>/                  # Vendor detail
POST   /api/vendors/register/              # Register as vendor
GET    /api/vendors/restaurants/           # Vendor's restaurants
GET    /api/vendors/analytics/             # Vendor analytics
```

### Delivery
```
GET    /api/delivery/orders/               # Assigned orders
PUT    /api/delivery/orders/<id>/          # Update delivery status
GET    /api/delivery/earnings/             # Delivery earnings
GET    /api/delivery/stats/                # Delivery statistics
```

### Payments
```
POST   /api/payments/create/               # Create payment
POST   /api/payments/verify/               # Verify payment
GET    /api/payments/history/              # Payment history
```

### Wallet
```
GET    /api/wallet/                        # Get wallet balance
POST   /api/wallet/add/                    # Add money
POST   /api/wallet/withdraw/               # Withdraw money
GET    /api/wallet/transactions/           # Transaction history
```

---

## 🚀 Deployment

### Deploy on AWS EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3-pip python3-venv nginx postgresql redis

# Clone repository
git clone https://github.com/Prateek6902/FoodieX.git
cd FoodieX

# Setup backend
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements/production.txt

# Setup frontend
cd frontend
npm install
npm run build

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/foodiex
sudo ln -s /etc/nginx/sites-available/foodiex /etc/nginx/sites-enabled/

# Setup Gunicorn
sudo cp gunicorn.service /etc/systemd/system/
sudo systemctl enable gunicorn
sudo systemctl start gunicorn

# Restart services
sudo systemctl restart nginx
```

---

## 📊 Analytics & Monitoring

### Admin Dashboard Metrics
- Total Users, Vendors, Restaurants
- Monthly Revenue & Growth
- Order Volume & Trends
- Popular Cuisines & Restaurants
- User Engagement Metrics

### Vendor Dashboard Metrics
- Restaurant Performance
- Daily/Weekly/Monthly Revenue
- Order Analytics
- Customer Reviews & Ratings
- Booking Analytics

### Delivery Partner Dashboard
- Earnings & Payouts
- Delivery Completion Rate
- Average Delivery Time
- Customer Ratings

### Customer Dashboard
- Order History
- Spending Analytics
- Favorite Restaurants
- Review Activity

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Workflow
```
main (production)
  └── develop (development)
        ├── feature/feature-name
        ├── bugfix/bug-name
        └── hotfix/critical-fix
```

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Django REST Framework
- React Community
- TailwindCSS
- All open-source contributors

---

## 📞 Contact & Support

- **Developer**: Prateek
- **Email**: prateek@foodiex.com
- **GitHub**: [Prateek6902](https://github.com/Prateek6902)
- **Website**: https://foodiex.com

---

## 🌟 Star us on GitHub

If you find this project useful, please give it a star ⭐ on GitHub!

---

**Built with ❤️ by the FoodieX Team**
