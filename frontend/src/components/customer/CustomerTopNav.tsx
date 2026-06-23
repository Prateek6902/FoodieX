// components/customer/CustomerTopNav.tsx

import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Mic, X, MapPin, ChevronDown,
  Leaf, Beef, User, Bell, ShoppingBag,
  Menu, Grid3x3, Home, Heart, Crown
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCart } from '../../contexts/CartContext'
import { useAuthStore } from '../../stores/authStore'
import logoPng from '../../assets/logo.png'

interface CustomerTopNavProps {
  isSearchOpen: boolean
  setIsSearchOpen: (value: boolean) => void
  isVegMode: boolean
  setIsVegMode: (value: boolean) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
  onCartClick?: () => void
}

export const CustomerTopNav = ({
  isSearchOpen,
  setIsSearchOpen,
  isVegMode,
  setIsVegMode,
  searchQuery,
  setSearchQuery,
  onCartClick
}: CustomerTopNavProps) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { getItemCount } = useCart()
  const [isListening, setIsListening] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const itemCount = getItemCount()

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Voice search simulation
  const handleVoiceSearch = () => {
    setIsListening(true)
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false)
      setSearchQuery('pizza near me')
      setIsSearchOpen(true)
    }, 2000)
  }

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/customer/dashboard" className="flex items-center gap-2 group flex-shrink-0">
              <img 
                src={logoPng} 
                alt="FoodieX" 
                className="h-9 w-auto object-contain"
              />
              <span className="text-xl font-bold text-[#1D3557] group-hover:text-[#E63946] transition hidden sm:inline">
                FoodieX
              </span>
            </Link>

            {/* Location - Moved to Bottom Nav */}

            {/* Right Icons */}
            <div className="flex items-center gap-1">
              {/* Veg/Non-Veg Toggle */}
              <button
                onClick={() => setIsVegMode(!isVegMode)}
                className={`relative w-10 h-5 rounded-full transition flex-shrink-0 ${
                  isVegMode ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition transform ${
                    isVegMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                >
                  {isVegMode ? (
                    <Leaf className="w-3.5 h-3.5 text-green-500 m-0.25" />
                  ) : (
                    <Beef className="w-3.5 h-3.5 text-red-500 m-0.25" />
                  )}
                </div>
              </button>

              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition relative"
              >
                <Search className="w-5 h-5 text-gray-600" />
                {isSearchOpen && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#E63946] rounded-full"></span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => {
                  if (onCartClick) {
                    onCartClick()
                  } else {
                    navigate('/customer/cart')
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition relative"
              >
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#E63946] text-white text-[10px] rounded-full flex items-center justify-center px-1">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => navigate('/customer/profile')}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar - Expanded */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 bg-white"
            >
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search for restaurants, dishes, or cuisines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleVoiceSearch}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition ${
                        isListening ? 'bg-[#E63946] text-white animate-pulse' : 'text-gray-400 hover:text-[#E63946]'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {isListening && (
                  <p className="text-sm text-[#E63946] mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#E63946] rounded-full animate-pulse"></span>
                    Listening... Speak now
                  </p>
                )}
                {/* Search Suggestions */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {['Pizza', 'Burger', 'Sushi', 'Tacos', 'Pasta', 'Biryani'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setSearchQuery(item)}
                      className="px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition whitespace-nowrap"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}