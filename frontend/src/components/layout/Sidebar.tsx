// components/layout/Sidebar.tsx

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Truck, 
  Users, 
  Receipt, 
  Settings, 
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Star,
  Calendar,
  MessageSquare,
  Bell,
  Shield,
  Wallet,
  Phone,
  Menu,
  X,
  UtensilsCrossed,
  BarChart3,
  Home,
  ShoppingBag,
  Heart,
  MapPin,
  MessageCircle,
  Gift,
  CreditCard,
  PieChart,
  ClipboardList,
  UserCheck,
  Award
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import logoPng from '../../assets/logo.png'
import { useState, useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  isMobile?: boolean
}

const menuItems = [
  {
    section: 'Main',
    icon: LayoutDashboard,
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ['super_admin', 'admin', 'vendor', 'delivery_partner', 'customer'] },
    ]
  },
  {
    section: 'Business',
    icon: BarChart3,
    items: [
      { icon: BarChart3, label: "Analytics", href: "/analytics", roles: ['super_admin', 'admin'] },
      { icon: Store, label: "Restaurants", href: "/restaurants", roles: ['super_admin', 'admin'] },
      { icon: Package, label: "Orders", href: "/orders", roles: ['super_admin', 'admin'] },
      { icon: Truck, label: "Delivery", href: "/delivery", roles: ['super_admin', 'admin'] },
    ]
  },
  {
    section: 'Management',
    icon: Users,
    items: [
      { icon: Users, label: "Customers", href: "/customers", roles: ['super_admin', 'admin'] },
      { icon: Store, label: "Vendors", href: "/vendors", roles: ['super_admin', 'admin'] },
      { icon: Receipt, label: "Invoices", href: "/invoices", roles: ['super_admin', 'admin', 'vendor', 'customer'] },
      { icon: Shield, label: "Security", href: "/security", roles: ['super_admin', 'admin'] },
    ]
  },
  {
    section: 'Vendor',
    icon: UtensilsCrossed,
    items: [
      { icon: UtensilsCrossed, label: "My Restaurants", href: "/vendor/restaurants", roles: ['vendor'] },
      { icon: Package, label: "Orders", href: "/vendor/orders", roles: ['vendor'] },
      { icon: BarChart3, label: "Analytics", href: "/vendor/analytics", roles: ['vendor'] },
      { icon: Award, label: "Performance", href: "/vendor/performance", roles: ['vendor'] },
    ]
  },
  {
    section: 'Customer',
    icon: ShoppingBag,
    items: [
      { icon: Store, label: "Restaurants", href: "/customer/restaurants", roles: ['customer'] },
      { icon: ShoppingBag, label: "My Orders", href: "/customer/orders", roles: ['customer'] },
      { icon: Heart, label: "Wishlist", href: "/customer/wishlist", roles: ['customer'] },
      { icon: MapPin, label: "Addresses", href: "/customer/addresses", roles: ['customer'] },
      { icon: MessageCircle, label: "Reviews", href: "/customer/reviews", roles: ['customer'] },
      { icon: Wallet, label: "Wallet", href: "/customer/wallet", roles: ['customer', 'vendor', 'delivery_partner'] },
      { icon: Gift, label: "Coupons", href: "/customer/coupons", roles: ['customer'] },
      { icon: CreditCard, label: "Payments", href: "/customer/payments", roles: ['customer'] },
    ]
  },
  {
    section: 'General',
    icon: Settings,
    items: [
      { icon: MessageSquare, label: "Messages", href: "/messages", roles: ['*'] },
      { icon: Bell, label: "Notifications", href: "/notifications", roles: ['*'] },
      { icon: Settings, label: "Settings", href: "/settings", roles: ['*'] },
      { icon: HelpCircle, label: "Support", href: "/support", roles: ['*'] },
      { icon: Star, label: "Reviews", href: "/reviews", roles: ['super_admin', 'admin', 'vendor'] },
      { icon: Calendar, label: "Calendar", href: "/calendar", roles: ['super_admin', 'admin', 'vendor'] },
    ]
  },
]

export const Sidebar = ({ isOpen, setIsOpen, isMobile = false }: SidebarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isHovered, setIsHovered] = useState(false)

  const rawUserRole = user?.role || 'customer'
  const userRole = rawUserRole.toLowerCase()
  const userRoles = [userRole, rawUserRole, userRole.toUpperCase()]

  // Filter menu items based on user role
  const filteredSections = menuItems
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (item.roles.includes('*')) return true
        if (!userRoles.length) return false
        return item.roles.some(role => {
          const roleLower = role.toLowerCase()
          return userRoles.some(r => r?.toLowerCase() === roleLower)
        })
      })
    }))
    .filter(section => section.items.length > 0)

  const userDisplayName = user?.full_name || user?.username || user?.email?.split('@')[0] || 'Guest'
  const userRoleDisplay = userRole === 'super_admin' ? 'SUPER ADMIN' : userRole.toUpperCase().replace('_', ' ')

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const getSidebarWidth = () => {
    if (isMobile) return 280
    if (!isOpen && !isHovered) return 80
    return 280
  }

  const sidebarGradient = "bg-gradient-to-b from-[#1D3557] via-[#1a2a4a] to-[#457B9D]"
  const hoverBgClass = "hover:bg-white/10"
  const activeBgClass = "bg-gradient-to-r from-[#E63946]/20 to-[#E63946]/10 text-[#E63946] border-r-2 border-[#E63946]"

  // Determine if sidebar is collapsed
  const isCollapsed = !isOpen && !isHovered

  if (isMobile) {
    return (
      <div className={`${sidebarGradient} shadow-2xl h-full overflow-y-auto flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-center p-4 border-b border-white/10">
          <Link to="/dashboard">
            <img 
              src={logoPng} 
              alt="Logo" 
              className="w-50 h-20 object-contain rounded-xl"
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="px-3 space-y-4">
            {filteredSections.map((section) => (
              <div key={section.section}>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-2">
                  {section.section}
                </p>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                        ${isActive ? activeBgClass : `text-white/60 ${hoverBgClass}`}
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
        </nav>

        {/* Version */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/20">© 2024 FoodieX v2.0</p>
        </div>
      </div>
    )
  }

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ width: getSidebarWidth() }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed left-0 top-0 bottom-0 ${sidebarGradient} shadow-2xl z-40 overflow-hidden flex flex-col`}
    >
      {/* Logo Section - Removed toggle button */}
      <div className="flex items-center justify-center p-4 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <img 
            src={logoPng} 
            alt="Logo" 
            className="w-12 h-12 object-contain rounded-xl flex-shrink-0"
          />
          <motion.span
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -20 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white font-bold text-lg tracking-tight whitespace-nowrap"
          >
            FoodieX
          </motion.span>
        </Link>
      </div>

      {/* User Profile */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-3 my-3 p-3 bg-gradient-to-r from-[#E63946]/10 to-[#457B9D]/10 rounded-xl border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E63946] to-[#457B9D] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {userDisplayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-white text-sm truncate">{userDisplayName}</p>
                <p className="text-xs text-[#FF9F1C]">{userRoleDisplay}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className="px-3 space-y-4">
          {filteredSections.map((section) => (
            <div key={section.section}>
              <motion.p
                initial={false}
                animate={{ opacity: isCollapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-3 mb-2"
              >
                {section.section}
              </motion.p>
              {section.items.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${isActive ? activeBgClass : `text-white/60 ${hoverBgClass}`}
                      relative
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <motion.span
                      initial={false}
                      animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -20 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-8 bg-[#E63946] rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all duration-200
            text-white/60 hover:bg-white/10 hover:text-[#E63946]
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <motion.span
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -20 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium whitespace-nowrap"
          >
            Logout
          </motion.span>
        </button>
      </div>

      {/* Version */}
      <motion.div
        initial={false}
        animate={{ opacity: isCollapsed ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="p-2 text-center border-t border-white/5"
      >
        <p className="text-[10px] text-white/20">© 2024 FoodieX v2.0</p>
      </motion.div>
    </motion.aside>
  )
}