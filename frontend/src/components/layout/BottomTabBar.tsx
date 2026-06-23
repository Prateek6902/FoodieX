import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Store, ShoppingBag, MessageSquare, User } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/restaurants', icon: Store, label: 'Restaurants' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export const BottomTabBar = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-white/10 px-4 py-2">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="relative flex flex-col items-center gap-1 py-2 px-3"
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all",
                    isActive ? "text-primary" : "text-white/40"
                  )}
                />
                <span
                  className={cn(
                    "text-xs transition-all",
                    isActive ? "text-primary" : "text-white/40"
                  )}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottomTabIndicator"
                    className="absolute -top-2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}