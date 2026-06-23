// components/customer/CustomerBottomNav.tsx

import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, Search, ShoppingBag, Heart, User,
  Crown, Zap, Sparkles
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export const CustomerBottomNav = () => {
  const location = useLocation()
  const { user } = useAuthStore()

  const navItems = [
    { icon: Home, label: 'Home', path: '/customer/dashboard' },
    { icon: Search, label: 'Search', path: '/customer/search' },
    { icon: ShoppingBag, label: 'Orders', path: '/customer/orders' },
    { icon: Heart, label: 'Wishlist', path: '/customer/wishlist' },
    { icon: Crown, label: 'Premium', path: '/customer/subscription' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            const Icon = item.icon
            
            // Check if user has active subscription for Crown icon
            const hasSubscription = false // Replace with actual subscription check
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition group"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative p-2 rounded-xl transition ${
                    isActive ? 'text-[#E63946]' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                >
                  {item.label === 'Premium' && hasSubscription && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#E63946] rounded-full border-2 border-white"></span>
                  )}
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#E63946] rounded-full"
                    />
                  )}
                </motion.div>
                <span className={`text-[10px] font-medium ${
                  isActive ? 'text-[#E63946]' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}