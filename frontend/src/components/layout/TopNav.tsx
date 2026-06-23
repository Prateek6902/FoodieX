import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu,
  ShoppingBag,
  DollarSign,
  Truck, 
  Search, 
  Bell, 
  User, 
  ChevronDown,
  Sun,
  Moon,
  Settings,
  LogOut,
  HelpCircle,
  Shield,
  X,
  CheckCircle,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import toast from 'react-hot-toast'

interface TopNavProps {
  onMenuClick: () => void
  onMobileMenuClick: () => void
}

interface Notification {
  id: number
  title: string
  message: string
  time: string
  read: boolean
  type: 'order' | 'payment' | 'delivery' | 'system'
}

export const TopNav = ({ onMenuClick, onMobileMenuClick }: TopNavProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme, isDarkMode } = useThemeStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const notifications: Notification[] = [
    { id: 1, title: "New Order", message: "Order #ORD-00124 has been placed", time: "5 min ago", read: false, type: 'order' },
    { id: 2, title: "Payment Received", message: "Payment of ₹45.50 received", time: "10 min ago", read: false, type: 'payment' },
    { id: 3, title: "Delivery Completed", message: "Order #ORD-00123 delivered", time: "1 hour ago", read: true, type: 'delivery' },
    { id: 4, title: "System Update", message: "New features available", time: "2 hours ago", read: true, type: 'system' },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const userDisplayName = user?.full_name || user?.username || user?.email?.split('@')[0] || 'Guest'
  const userRole = user?.role || 'customer'

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length > 2) {
      setIsSearching(true)
      // Simulate search
      const results = [
        { type: 'Restaurant', name: 'Spice Garden', city: 'Mumbai' },
        { type: 'Restaurant', name: 'Pizza Central', city: 'Delhi' },
        { type: 'Order', name: 'ORD-00124', status: 'Delivered' },
        { type: 'Customer', name: 'Rahul Sharma', email: 'rahul@example.com' },
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.city && item.city.toLowerCase().includes(query.toLowerCase()))
      )
      setSearchResults(results)
    } else {
      setIsSearching(false)
      setSearchResults([])
    }
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setIsSearching(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-[#E63946]" />
      case 'payment': return <DollarSign className="w-4 h-4 text-[#2EC4B6]" />
      case 'delivery': return <Truck className="w-4 h-4 text-[#FF9F1C]" />
      default: return <Bell className="w-4 h-4 text-[#457B9D]" />
    }
  }

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-200 dark:border-white/10">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-white/60" />
          </button>
          <button
            onClick={onMobileMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
            aria-label="Mobile Menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-white/60" />
          </button>
          
          {/* Search Bar */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, orders, customers..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-80 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-[#FF9F1C]" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-white/60" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E63946] rounded-full animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                      <button className="text-xs text-[#E63946] hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer ${!notif.read ? 'bg-[#E63946]/5' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-800 dark:text-white">{notif.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-400">{notif.time}</p>
                              </div>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-[#E63946]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100 dark:border-white/10 text-center">
                      <button className="text-sm text-[#E63946] hover:underline">View all notifications</button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200"
              aria-label="Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E63946] to-[#457B9D] flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {userDisplayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-white/60" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-white/10">
                      <p className="font-semibold text-gray-800 dark:text-white">{userDisplayName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E63946]/10">
                        <Shield className="w-3 h-3 text-[#E63946]" />
                        <span className="text-xs text-[#E63946] font-medium">{userRole}</span>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
                      </Link>
                      <Link
                        to="/support"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <HelpCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Help & Support</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/10 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] text-sm"
          />
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isSearching && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full mx-4 md:mx-0 md:left-auto md:right-auto md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden mt-1"
          >
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0"
                onClick={() => {
                  setSearchQuery('')
                  setIsSearching(false)
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">{result.name}</span>
                  <span className="text-xs text-gray-400">{result.type}</span>
                </div>
                {result.city && (
                  <p className="text-xs text-gray-500 mt-1">{result.city}</p>
                )}
                {result.status && (
                  <p className="text-xs text-gray-500 mt-1">Status: {result.status}</p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}