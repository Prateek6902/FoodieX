import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Heart,
  User,
  ShoppingBag,
  Home
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const mobileMenuItems = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: ShoppingBag, label: "Orders", href: "/orders" },
  { icon: Store, label: "Restaurants", href: "/restaurants" },
  { icon: Heart, label: "Favorites", href: "/favorites" },
  { icon: User, label: "Profile", href: "/profile" },
]

export const MobileNav = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-40">
      <div className="flex justify-around items-center py-2">
        {mobileMenuItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.href}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 group"
            >
              <Icon 
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive 
                    ? 'text-[#FF9F1C] scale-110' 
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-[#FF9F1C]'
                }`} 
              />
              <span className={`text-[10px] transition-all duration-200 ${
                isActive 
                  ? 'text-[#FF9F1C] font-medium' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute -top-2 w-6 h-0.5 bg-[#FF9F1C] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}