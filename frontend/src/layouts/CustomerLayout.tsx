// layouts/CustomerLayout.tsx

import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, Search, ShoppingBag, Heart, User,
  UtensilsCrossed, Coffee, Pizza, Cake,
  Leaf, Beef, Mic, X, ChevronDown,
  Store, Truck, Clock, Star, MapPin,
  Filter, Grid3x3, List, Crown
} from 'lucide-react'
import { CustomerBottomNav } from '../components/customer/CustomerBottomNav'
import { CustomerTopNav } from '../components/customer/CustomerTopNav'
import { AISupportChat } from '../components/ai/AISupportChat'
import { useCart } from '../contexts/CartContext'

export const CustomerLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { getItemCount } = useCart()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isVegMode, setIsVegMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('delivery')

  const tabs = [
    { id: 'delivery', label: 'Delivery', icon: <Truck className="w-4 h-4" /> },
    { id: 'takeaway', label: 'Takeaway', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'dining', label: 'Dining', icon: <UtensilsCrossed className="w-4 h-4" /> },
  ]

  const handleCartClick = () => {
    navigate('/customer/cart')
  }

  // Provide veg mode to all child routes
  const outletContext = {
    selectedTab,
    isVegMode,
    searchQuery,
    setIsVegMode // Allow child components to update veg mode
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <CustomerTopNav 
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        isVegMode={isVegMode}
        setIsVegMode={setIsVegMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCartClick={handleCartClick}
      />

      {/* Tab Bar - Only show on restaurants page */}
      {location.pathname.includes('/customer/restaurants') && (
        <div className="sticky top-[56px] z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    selectedTab === tab.id
                      ? 'border-[#E63946] text-[#E63946]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname + selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet context={outletContext} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <CustomerBottomNav />

      {/* AI Support Chat */}
      <AISupportChat />
    </div>
  )
}