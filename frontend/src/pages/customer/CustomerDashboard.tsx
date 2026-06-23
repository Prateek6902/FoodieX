// pages/customer/CustomerDashboard.tsx

import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, Heart, MapPin, Star, Clock, 
  CheckCircle, Package, DollarSign, 
  Wallet, Gift, CreditCard, TrendingUp,
  Store, Truck, MessageCircle, BarChart3,
  Search, Filter, ChevronRight, RefreshCw,
  Pizza, Coffee, UtensilsCrossed, Cake,
  IceCream, Beef, Fish, Leaf, Egg,
  Flame, Crown, Zap, Award, Sparkles,
  Users, PartyPopper, Clock as ClockIcon,
  Percent, Tag, BadgePercent, Quote,
  ChevronLeft, ChevronRight as ChevronRightIcon,
  User, LogOut, Settings, HelpCircle,
  Bell, Menu, X, Plus, Minus,
  Utensils
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'

interface DashboardStats {
  total_orders: number
  total_spent: number
  pending_orders: number
  completed_orders: number
  wishlist_count: number
  address_count: number
  recent_orders: Array<{
    id: string
    order_number: string
    total_amount: number
    status: string
    created_at: string
  }>
}

interface CustomerProfile {
  id: string
  email: string
  full_name: string
  mobile_number: string
  profile_picture?: string
}

interface Restaurant {
  id: string
  name: string
  cuisine_type: string
  city: string
  rating: number | string
  delivery_charge: number | string
  minimum_order_amount: number | string
  is_active: boolean
  logo_url?: string
  cover_image?: string
  has_delivery?: boolean
  has_takeaway?: boolean
  has_dining?: boolean
  is_veg?: boolean
  is_featured?: boolean
  is_offering?: boolean
  discount?: string
  eta?: string
}

// Food Quotes
const foodQuotes = [
  { text: "Good food is the foundation of genuine happiness.", author: "Auguste Escoffier" },
  { text: "Food is our common ground, a universal experience.", author: "James Beard" },
  { text: "One cannot think well, love well, sleep well, if one has not dined well.", author: "Virginia Woolf" },
  { text: "The only thing I like better than talking about food is eating.", author: "John Walters" },
]

// Offer Slides
const offerSlides = [
  {
    id: 1,
    title: "50% OFF on First Order",
    description: "Use code: FIRST50",
    bg: "bg-gradient-to-r from-red-500 to-orange-500",
    emoji: "🎁",
    discount: "50%",
    valid: "Limited time offer"
  },
  {
    id: 2,
    title: "Free Delivery on Orders Above ₹299",
    description: "No minimum order value",
    bg: "bg-gradient-to-r from-purple-500 to-pink-500",
    emoji: "🚚",
    discount: "Free Delivery",
    valid: "All restaurants"
  },
  {
    id: 3,
    title: "20% OFF on Pure Veg Restaurants",
    description: "Healthy eating starts here",
    bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
    emoji: "🥗",
    discount: "20%",
    valid: "Pure Veg only"
  },
  {
    id: 4,
    title: "30% OFF on Premium Picks",
    description: "Featured restaurants only",
    bg: "bg-gradient-to-r from-amber-500 to-yellow-500",
    emoji: "👑",
    discount: "30%",
    valid: "Premium selection"
  },
]

// Food images for restaurant covers
const foodImages = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1564757025389-9b5dd7c24d2d?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1555949258-eb67b1ef0ce4?w=400&h=250&fit=crop',
]

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

const toNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

const renderStars = (rating: number | string): JSX.Element => {
  const ratingNum = toNumber(rating)
  const fullStars = Math.floor(ratingNum)
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-600">{ratingNum.toFixed(1)}</span>
    </div>
  )
}

// Offer Carousel Component
const OfferCarousel = ({ slides }: { slides: typeof offerSlides }) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className={`${slides[currentSlide].bg} p-4 text-white min-h-[120px] cursor-pointer`}
          onClick={() => toast.success(`Offer applied!`)}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">{slides[currentSlide].emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{slides[currentSlide].title}</h3>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{slides[currentSlide].valid}</span>
              </div>
              <p className="text-white/80 text-sm">{slides[currentSlide].description}</p>
              <span className="inline-block mt-1 text-2xl font-bold bg-white/20 px-3 py-0.5 rounded-lg">
                {slides[currentSlide].discount}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Typewriter Quote Component
const TypewriterQuote = ({ quotes }: { quotes: typeof foodQuotes }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const currentQuote = quotes[currentIndex]
    const fullText = currentQuote.text
    
    let timer: NodeJS.Timeout
    
    if (isPaused) {
      timer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, 3000)
      return () => clearTimeout(timer)
    }

    if (!isDeleting) {
      if (displayText.length < fullText.length) {
        timer = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1))
        }, 50)
      } else {
        setIsPaused(true)
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, 30)
      } else {
        setIsDeleting(false)
        setCurrentIndex((prev) => (prev + 1) % quotes.length)
      }
    }
    
    return () => clearTimeout(timer)
  }, [displayText, isDeleting, isPaused, currentIndex, quotes])

  const currentQuote = quotes[currentIndex]

  return (
    <div>
      <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed min-h-[3rem]">
        <span className="text-[#E63946]">"</span>
        {displayText}
        <span className="animate-pulse text-[#E63946]">|</span>
        <span className="text-[#E63946]">"</span>
      </p>
      <p className="text-sm text-gray-400 mt-1 text-right">— {currentQuote.author}</p>
      <div className="flex justify-center gap-1.5 mt-2">
        {quotes.map((_, idx) => (
          <span
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-[#E63946]' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Profile Dropdown Component
const ProfileDropdown = ({ 
  isOpen, 
  onClose, 
  user, 
  onLogout,
  dashboardStats
}: { 
  isOpen: boolean
  onClose: () => void
  user: any
  onLogout: () => void
  dashboardStats?: DashboardStats
}) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const menuItems = [
    { icon: User, label: 'Profile', path: '/customer/profile' },
    { icon: ShoppingBag, label: 'My Orders', path: '/customer/orders', badge: dashboardStats?.total_orders },
    { icon: Heart, label: 'Wishlist', path: '/customer/wishlist', badge: dashboardStats?.wishlist_count },
    { icon: MessageCircle, label: 'Reviews', path: '/customer/reviews' },
    { icon: Wallet, label: 'Wallet', path: '/customer/wallet' },
    { icon: MapPin, label: 'Addresses', path: '/customer/addresses' },
    { icon: Gift, label: 'Coupons', path: '/customer/coupons' },
    { icon: BarChart3, label: 'Analytics', path: '/customer/analytics' },
    { icon: Settings, label: 'Settings', path: '/customer/profile' },
    { icon: HelpCircle, label: 'Help & Support', path: '/support' },
  ]

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 max-h-[80vh] overflow-y-auto">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center text-white font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{user?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-b border-gray-100 grid grid-cols-2 gap-2">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{dashboardStats?.total_orders ?? 0}</p>
          <p className="text-xs text-gray-500">Orders</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(dashboardStats?.total_spent ?? 0)}</p>
          <p className="text-xs text-gray-500">Spent</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-yellow-600">{dashboardStats?.pending_orders ?? 0}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-500">{dashboardStats?.wishlist_count ?? 0}</p>
          <p className="text-xs text-gray-500">Favorites</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path)
                onClose()
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
            >
              <Icon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto text-xs bg-[#E63946] text-white px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 pt-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-left text-red-500"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

// Category Navigation with Scroll
const CategoryNav = ({ categories, onSelect }: { categories: string[]; onSelect: (category: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 20)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20)
    }
  }

  const categoryIcons: Record<string, string> = {
    'All': '🏠',
    'Pizza': '🍕',
    'Burgers': '🍔',
    'Sushi': '🍣',
    'Tacos': '🌮',
    'Pasta': '🍝',
    'North Indian': '🍛',
    'South Indian': '🍛',
    'Chinese': '🥢',
    'Italian': '🍝',
    'Mexican': '🌯',
    'Thai': '🍜',
    'Japanese': '🍱',
    'Fast Food': '🍟',
    'Desserts': '🍰',
    'Beverages': '🥤',
  }

  return (
    <div className="relative">
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white rounded-full shadow-lg border border-gray-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-[#E63946] hover:shadow-md transition group"
          >
            <span className="text-lg">{categoryIcons[category] || '🍽️'}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#E63946] transition">
              {category}
            </span>
          </button>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white rounded-full shadow-lg border border-gray-200"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export const CustomerDashboard = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const outletContext = useOutletContext<{
    isVegMode?: boolean
    setIsVegMode?: (value: boolean) => void
  }>()
  
  const isVegMode = outletContext?.isVegMode || false
  const setIsVegMode = outletContext?.setIsVegMode

  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Fetch customer profile
  const { data: profile } = useQuery<CustomerProfile>({
    queryKey: ['customer-profile'],
    queryFn: async () => {
      const response = await api.get('/customers/profile/')
      return response.data.data
    },
  })

  // Fetch dashboard stats
  const { data: dashboardStats, refetch } = useQuery<DashboardStats>({
    queryKey: ['customer-dashboard'],
    queryFn: async () => {
      const response = await api.get('/customers/dashboard/')
      return response.data.data
    },
  })

  // Fetch restaurants - with veg mode filter
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ['customer-restaurants', isVegMode],
    queryFn: async () => {
      const response = await api.get('/restaurants/')
      let restaurantsData: Restaurant[] = []
      if (Array.isArray(response.data)) {
        restaurantsData = response.data
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        restaurantsData = response.data.results
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        restaurantsData = response.data.data
      }
      return restaurantsData.map((r, index) => ({
        ...r,
        cover_image: foodImages[index % foodImages.length],
        is_featured: index % 3 === 0,
        is_offering: index % 2 === 0,
        discount: index % 2 === 0 ? `${10 + (index % 20)}% OFF` : undefined,
        eta: `${15 + (index % 30)}-${25 + (index % 20)} min`,
        has_delivery: true,
        has_takeaway: index % 2 === 0,
        has_dining: index % 3 === 0,
        is_veg: index % 4 === 0,
      }))
    },
  })

  // Apply veg mode filter
  const vegFilteredRestaurants = isVegMode 
    ? restaurants.filter(r => r.is_veg === true)
    : restaurants

  // Category types
  const categories = ['All', 'Pizza', 'Burgers', 'Sushi', 'Tacos', 'Pasta', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Fast Food', 'Desserts', 'Beverages']

  const filteredRestaurants = vegFilteredRestaurants.filter((restaurant) => {
    const matchesSearch = 
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || 
      restaurant.cuisine_type?.toLowerCase().includes(selectedCategory.toLowerCase())
    
    return matchesSearch && matchesCategory
  })

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍔</span>
              <h1 className="text-xl font-bold text-[#1D3557]">FoodieX</h1>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hidden sm:inline">
                {profile.full_name?.split(' ')[0]}
              </span>
              {isVegMode && (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  Veg Mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              <button
                onClick={() => navigate('/customer/restaurants')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
              >
                <Store className="w-4 h-4" />
                Browse
              </button>

              {/* Dining Button - NEW */}
              <button
                onClick={() => navigate('/customer/dining')}
                className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white rounded-lg text-sm font-medium hover:bg-[#C62828] transition shadow-md hover:shadow-lg"
              >
                <Utensils className="w-4 h-4" />
                <span className="hidden sm:inline">Dining</span>
                <span className="hidden md:inline">Experience</span>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center text-white font-bold text-sm">
                    {profile.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {profile.full_name?.split(' ')[0]}
                  </span>
                </button>
                <ProfileDropdown 
                  isOpen={showProfileDropdown}
                  onClose={() => setShowProfileDropdown(false)}
                  user={profile}
                  onLogout={handleLogout}
                  dashboardStats={dashboardStats}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Hello, {profile.full_name?.split(' ')[0]}! 👋</h2>
              <p className="text-white/80 text-sm mt-1">What would you like to eat today?</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/70">
                <span>🍽️ {vegFilteredRestaurants.length} restaurants</span>
                <span>•</span>
                <span>⭐ 4.8 avg rating</span>
                <span>•</span>
                <span>🏷️ {vegFilteredRestaurants.filter(r => r.is_offering).length} offers</span>
                {isVegMode && <span className="text-emerald-300">🌿 Pure Veg</span>}
              </div>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => navigate('/customer/dining')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition border border-white/20"
              >
                <Utensils className="w-4 h-4" />
                <span className="text-sm font-medium">Dine In</span>
              </button>
              {setIsVegMode && (
                <button
                  onClick={() => setIsVegMode(!isVegMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                    isVegMode 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20'
                  }`}
                >
                  <Leaf className="w-4 h-4" />
                  <span className="text-sm font-medium">Veg Mode</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Offer Carousel */}
        <OfferCarousel slides={offerSlides} />

        {/* Quote Section */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🍽️</span>
            <span className="text-xs font-semibold text-[#E63946]">Daily Food Inspiration</span>
          </div>
          <TypewriterQuote quotes={foodQuotes} />
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/customer/restaurants')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#E63946] transition group"
          >
            <div className="p-2 bg-[#E63946]/10 rounded-lg group-hover:bg-[#E63946]/20 transition">
              <Store className="w-5 h-5 text-[#E63946]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">Browse</p>
              <p className="text-xs text-gray-400">All restaurants</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer/dining')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#E63946] transition group"
          >
            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition">
              <Utensils className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">Dining</p>
              <p className="text-xs text-gray-400">Book a table</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer/orders')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#E63946] transition group"
          >
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">Orders</p>
              <p className="text-xs text-gray-400">{dashboardStats?.pending_orders || 0} pending</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/customer/wishlist')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#E63946] transition group"
          >
            <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">Wishlist</p>
              <p className="text-xs text-gray-400">{dashboardStats?.wishlist_count || 0} items</p>
            </div>
          </button>
        </div>

        {/* Category Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <CategoryNav categories={categories} onSelect={setSelectedCategory} />
        </div>

        {/* Restaurants Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {selectedCategory === 'All' ? '🍽️ All Restaurants' : `${selectedCategory} Restaurants`}
              {isVegMode && <span className="text-sm font-normal text-green-600 ml-2">🌿 Veg Only</span>}
            </h3>
            <button 
              onClick={() => navigate('/customer/restaurants')}
              className="text-sm text-[#E63946] hover:underline font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {restaurantsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                {isVegMode ? 'No pure veg restaurants found' : 'No restaurants found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredRestaurants.slice(0, 8).map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer group"
                  onClick={() => navigate(`/customer/restaurants/${restaurant.id}`)}
                >
                  <div className="relative h-40 bg-gray-200">
                    <img 
                      src={restaurant.cover_image || foodImages[index % foodImages.length]} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = foodImages[0]
                      }}
                    />
                    
                    <div className="absolute top-3 left-3 z-10">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-lg border-2 border-white overflow-hidden">
                        {restaurant.logo_url ? (
                          <img 
                            src={restaurant.logo_url} 
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect width="48" height="48" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="24" fill="%239ca3af"%3E🏪%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1D3557]/10 to-[#457B9D]/10 flex items-center justify-center">
                            <Store className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {restaurant.is_offering && restaurant.discount && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg z-10">
                        <Zap className="w-3 h-3" />
                        {restaurant.discount}
                      </div>
                    )}
                    {restaurant.is_featured && (
                      <div className="absolute bottom-3 left-3 bg-yellow-500 text-white px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg z-10">
                        <Award className="w-3 h-3" />
                        Featured
                      </div>
                    )}
                    
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1 z-10">
                      {renderStars(restaurant.rating)}
                    </div>

                    {restaurant.is_veg && (
                      <div className="absolute top-3 left-16 bg-green-500 text-white px-1.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5 shadow-lg z-10">
                        <Leaf className="w-3 h-3" />
                        Veg
                      </div>
                    )}

                    {restaurant.has_dining && (
                      <div className="absolute bottom-3 left-16 bg-purple-500 text-white px-1.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5 shadow-lg z-10">
                        <Utensils className="w-3 h-3" />
                        Dine
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-[#E63946] transition">
                      {restaurant.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{restaurant.cuisine_type}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{restaurant.eta || '30-40 min'}</span>
                      <span>•</span>
                      <span>₹{toNumber(restaurant.delivery_charge).toFixed(0)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Dining Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 cursor-pointer"
          onClick={() => navigate('/customer/dining')}
        >
          <div className="absolute top-0 right-0 text-8xl opacity-10 -translate-y-4 translate-x-4">
            🍽️
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍷</span>
              <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full text-white">
                New
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Dining Experience</h3>
            <p className="text-white/80 text-sm">Book a table at premium restaurants. Explore fine dining, rooftop cafes & more.</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm text-white/90 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Table booking
              </span>
              <span className="text-sm text-white/90 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Exclusive offers
              </span>
              <button className="ml-auto px-4 py-2 bg-white text-purple-600 rounded-xl text-sm font-medium hover:bg-white/90 transition">
                Explore Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}