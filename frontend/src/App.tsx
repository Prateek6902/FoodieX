import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './stores/authStore'
import { DashboardLayout } from './layouts/DashboardLayout'
import { CustomerLayout } from './layouts/CustomerLayout'
import { GuestLayout } from './layouts/GuestLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'

// Guest Pages
import { GuestHomePage } from './pages/guest/GuestHomePage'
import { GuestRestaurantsPage } from './pages/guest/GuestRestaurantsPage'
import { GuestHowItWorksPage } from './pages/guest/GuestHowItWorksPage'
import { GuestAboutPage } from './pages/guest/GuestAboutPage'
import { GuestContactPage } from './pages/guest/GuestContactPage'

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import { VendorDashboard } from './pages/vendor/VendorDashboard'
import { CustomersPage } from './pages/customer/CustomersPage'
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard'
import { VendorsPage } from './pages/vendor/VendorsPage'
import { VendorRestaurantsPage } from './pages/vendor/VendorRestaurantsPage'
import { VendorAnalyticsPage } from './pages/vendor/VendorAnalyticsPage'
import { VendorOrdersPage } from './pages/vendor/VendorOrdersPage'

// Feature Pages
import { RestaurantsPage } from './pages/restaurants/RestaurantsPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { OrderTrackingPage } from './pages/orders/OrderTrackingPage'
import { ChatPage } from './pages/chat/ChatPage'
import { AnalyticsPage } from './pages/analytics/AnalyticsPage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { SupportPage } from './pages/support/SupportPage'

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard'
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage'
import { CustomerWishlistPage } from './pages/customer/CustomerWishlistPage'
import { CustomerAddressesPage } from './pages/customer/CustomerAddressesPage'
import { CustomerReviewsPage } from './pages/customer/CustomerReviewsPage'
import { CustomerRestaurantsPage } from './pages/customer/CustomerRestaurantsPage'
import { CustomerCartPage } from './pages/customer/CustomerCartPage'
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage'
import { CustomerWalletPage } from './pages/customer/CustomerWalletPage'
import { CustomerCouponsPage } from './pages/customer/CustomerCouponsPage'
import { CustomerAnalyticsPage } from './pages/customer/CustomerAnalyticsPage'
import { CustomerSearchPage } from './pages/customer/CustomerSearchPage'
import { CustomerRestaurantDetailPage } from './pages/customer/CustomerRestaurantDetailPage'
import { SubscriptionPlansPage } from './pages/customer/SubscriptionPlansPage'
import { CustomerDiningPage } from './pages/customer/CustomerDiningPage'
// Vendor Registration
import { VendorRegisterPage } from './pages/vendor/VendorRegisterPage'
import { DeliveryRegisterPage } from './pages/delivery/DeliveryRegisterPage'

function App() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    setIsReady(true)
  }, [])
  
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  const token = localStorage.getItem('access_token')
  const userStr = localStorage.getItem('user')
  const isLoggedIn = isAuthenticated || (token && userStr)
  
  let userRole = 'CUSTOMER'
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      userRole = user.role?.toUpperCase() || 'CUSTOMER'
    } catch (e) {}
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* ==================== AUTH ROUTES ==================== */}
        <Route path="/login" element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        } />

        {/* ==================== BUSINESS REGISTRATION - PUBLIC ==================== */}
        <Route path="/vendor/register" element={<VendorRegisterPage />} />
        <Route path="/delivery/register" element={<DeliveryRegisterPage />} />
        <Route path="/vendor/login" element={<LoginPage />} />
        <Route path="/delivery/login" element={<LoginPage />} />

        {/* ==================== GUEST ROUTES - PUBLIC ==================== */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<GuestHomePage />} />
          <Route path="/restaurants" element={<GuestRestaurantsPage />} />
          <Route path="/how-it-works" element={<GuestHowItWorksPage />} />
          <Route path="/about" element={<GuestAboutPage />} />
          <Route path="/contact" element={<GuestContactPage />} />
        </Route>

        {/* ==================== PROTECTED DASHBOARD ROUTES ==================== */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Dashboard - Role Based */}
            <Route path="/dashboard" element={
              userRole === 'VENDOR' ? <VendorDashboard /> :
              userRole === 'DELIVERY_PARTNER' ? <DeliveryDashboard /> :
              userRole === 'CUSTOMER' ? <Navigate to="/customer/dashboard" replace /> :
              <AdminDashboard />
            } />
            
            {/* Common Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/support" element={<SupportPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/restaurants" element={<RestaurantsPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/restaurants" element={<RestaurantsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            
            {/* Vendor Routes */}
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/restaurants" element={<VendorRestaurantsPage />} />
            <Route path="/vendor/analytics" element={<VendorAnalyticsPage />} />
            <Route path="/vendor/orders" element={<VendorOrdersPage />} />
            
            {/* Delivery Routes */}
            <Route path="/delivery" element={<DeliveryDashboard />} />
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery/orders" element={<OrdersPage />} />
            
            {/* Order Tracking */}
            <Route path="/orders/:orderId/track" element={<OrderTrackingPage />} />
          </Route>
        </Route>

        {/* ==================== CUSTOMER ROUTES - NO SIDEBAR ==================== */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/restaurants" element={<CustomerRestaurantsPage />} />
            <Route path="/customer/restaurants/:restaurantId" element={<CustomerRestaurantDetailPage />} />
            <Route path="/customer/search" element={<CustomerSearchPage />} />
            <Route path="/customer/subscription" element={<SubscriptionPlansPage />} />
            <Route path="/customer/orders" element={<CustomerOrdersPage />} />
            <Route path="/customer/orders/:orderId" element={<CustomerOrdersPage />} />
            <Route path="/customer/wishlist" element={<CustomerWishlistPage />} />
            <Route path="/customer/dining" element={<CustomerDiningPage />} />
            <Route path="/customer/addresses" element={<CustomerAddressesPage />} />
            <Route path="/customer/reviews" element={<CustomerReviewsPage />} />
            <Route path="/customer/cart" element={<CustomerCartPage />} />
            <Route path="/customer/profile" element={<CustomerProfilePage />} />
            <Route path="/customer/wallet" element={<CustomerWalletPage />} />
            <Route path="/customer/coupons" element={<CustomerCouponsPage />} />
            <Route path="/customer/analytics" element={<CustomerAnalyticsPage />} />
          </Route>
        </Route>
        
        {/* ==================== DEFAULT REDIRECT ==================== */}
        <Route path="*" element={
          <Navigate to={isLoggedIn ? "/dashboard" : "/"} replace />
        } />
      </Routes>
    </AnimatePresence>
  )
}

export default App