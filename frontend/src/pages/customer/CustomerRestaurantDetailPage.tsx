// pages/customer/CustomerRestaurantDetailPage.tsx

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Store, Star, MapPin, Clock, DollarSign, 
  ChevronLeft, Heart, Share2, Phone, Mail,
  Search, ShoppingBag, Plus, Minus,
  Truck, Package, UtensilsCrossed, ChefHat,
  Award, Zap, Beef, Coffee, Pizza,
  Cake, IceCream, TrendingUp, 
  Users, PartyPopper, 
  CreditCard, Wallet, ChevronRight,
  CheckCircle, AlertCircle, Menu as MenuIcon,
  Bell, User, LogOut, Settings, HelpCircle
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { useCart } from '../../contexts/CartContext'

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
  description?: string
  address_line1?: string
  phone_number?: string
  email?: string
  opening_time?: string
  closing_time?: string
  is_veg?: boolean
  is_featured?: boolean
  is_offering?: boolean
  discount?: string
  eta?: string
  total_orders?: number
  total_revenue?: number
}

interface MenuItem {
  id: string
  name: string
  price: number | string
  category: string
  description: string
  is_available: boolean
  preparation_time: number
  is_veg?: boolean
  is_recommended?: boolean
  is_bestseller?: boolean
  is_new?: boolean
  image?: string
}

interface Offer {
  id: string
  title: string
  description: string
  code: string
  discount: string
  valid_until: string
}

const toNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

const renderStars = (rating: number | string): JSX.Element => {
  const ratingNum = toNumber(rating)
  const fullStars = Math.floor(ratingNum)
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-700">{ratingNum.toFixed(1)}</span>
    </div>
  )
}

// Offers Carousel Component
const OffersCarousel = ({ offers }: { offers: Offer[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || offers.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % offers.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, offers.length])

  if (offers.length === 0) return null

  const offerColors = [
    'bg-gradient-to-r from-red-500 to-orange-500',
    'bg-gradient-to-r from-purple-500 to-pink-500',
    'bg-gradient-to-r from-emerald-500 to-teal-500',
    'bg-gradient-to-r from-amber-500 to-yellow-500',
    'bg-gradient-to-r from-blue-500 to-cyan-500',
  ]

  return (
    <div className="relative overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className={`${offerColors[currentSlide % offerColors.length]} p-4 text-white rounded-xl cursor-pointer`}
          onClick={() => {
            toast.success(`Offer applied: ${offers[currentSlide].code}`)
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  {offers[currentSlide].valid_until}
                </span>
              </div>
              <h3 className="text-lg font-bold mt-1">{offers[currentSlide].title}</h3>
              <p className="text-white/80 text-sm">{offers[currentSlide].description}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xl font-bold bg-white/20 px-3 py-1 rounded-lg">
                  {offers[currentSlide].discount}
                </span>
                <span className="text-xs text-white/70">Code: {offers[currentSlide].code}</span>
              </div>
            </div>
            <div className="text-5xl opacity-20">🏷️</div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {offers.map((_, idx) => (
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

// Category Navigation Component (Fixed bottom)
const CategoryNav = ({ 
  categories, 
  onCategoryClick,
  activeCategory 
}: { 
  categories: string[]; 
  onCategoryClick: (category: string) => void;
  activeCategory: string;
}) => {
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

  if (categories.length === 0) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-2 py-2">
      <div className="relative max-w-7xl mx-auto">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow-lg border border-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryClick(category)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                activeCategory === category
                  ? 'bg-[#E63946] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white rounded-full shadow-lg border border-gray-200"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Menu Item Card Component
const MenuItemCard = ({ 
  item, 
  isInCart, 
  quantity, 
  onAdd, 
  onUpdateQuantity,
  showCategory = true
}: { 
  item: MenuItem
  isInCart: boolean
  quantity: number
  onAdd: () => void
  onUpdateQuantity: (change: number) => void
  showCategory?: boolean
}) => {
  // Convert price to number safely
  const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
  const formattedPrice = isNaN(price) ? 0 : price

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 bg-white rounded-xl border ${item.is_available ? 'border-gray-100' : 'border-gray-200 bg-gray-50'} hover:shadow-md transition`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-gray-800">{item.name}</h4>
            {item.is_veg && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Leaf className="w-3 h-3" />
                Veg
              </span>
            )}
            {item.is_recommended && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" />
                Recommended
              </span>
            )}
            {item.is_bestseller && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Crown className="w-3 h-3" />
                Bestseller
              </span>
            )}
            {!item.is_available && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Unavailable</span>
            )}
          </div>
          {showCategory && (
            <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
          )}
          {item.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="font-bold text-[#E63946]">₹{formattedPrice.toFixed(2)}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{item.preparation_time || 15} min</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {item.is_available ? (
            isInCart ? (
              <div className="flex items-center gap-2 bg-[#E63946] text-white rounded-lg px-2 py-1">
                <button 
                  onClick={() => onUpdateQuantity(-1)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                <button 
                  onClick={() => onUpdateQuantity(1)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAdd}
                className="px-3 py-1.5 bg-[#E63946] text-white rounded-lg text-sm hover:bg-[#C62828] transition"
              >
                Add
              </button>
            )
          ) : (
            <span className="text-xs text-gray-400">N/A</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export const CustomerRestaurantDetailPage = () => {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const { addToCart, cartItems, updateQuantity, getItemCount, getCartTotal } = useCart()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showCategoryNav, setShowCategoryNav] = useState(true)
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Fetch restaurant details
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['restaurant-detail', restaurantId],
    queryFn: async () => {
      const response = await api.get(`/restaurants/${restaurantId}/`)
      return response.data.data || response.data
    },
  })

  // Fetch menu items
  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ['restaurant-menu', restaurantId],
    queryFn: async () => {
      const response = await api.get(`/restaurants/${restaurantId}/menu/`)
      return response.data.data || []
    },
  })

  // Mock offers
  const offers: Offer[] = [
    {
      id: '1',
      title: '50% OFF on First Order',
      description: 'Use code FIRST50',
      code: 'FIRST50',
      discount: '50% OFF',
      valid_until: 'Valid until Dec 31'
    },
    {
      id: '2',
      title: 'Free Delivery',
      description: 'On orders above ₹299',
      code: 'FREEDEL',
      discount: 'FREE DELIVERY',
      valid_until: 'Valid today'
    },
    {
      id: '3',
      title: '20% OFF on Combo',
      description: 'Order any combo meal',
      code: 'COMBO20',
      discount: '20% OFF',
      valid_until: 'Limited time'
    }
  ]

  // Get categories from menu items
  const categories = ['All', ...new Set(menuItems.map(item => item.category))].filter(Boolean)

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get recommended items
  const recommendedItems = menuItems.filter(item => item.is_recommended || item.is_bestseller)

  // Get item quantity in cart
  const getItemQuantity = (itemId: string) => {
    const cartItem = cartItems.find(c => c.product_id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  // Check if item is in cart
  const isInCart = (itemId: string) => {
    return cartItems.some(c => c.product_id === itemId)
  }

  const handleAddToCart = (item: MenuItem) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
    addToCart({
      product_id: item.id,
      product_name: item.name,
      unit_price: price,
      quantity: 1,
      restaurant_id: restaurant?.id || '',
      restaurant_name: restaurant?.name || '',
      total_price: price,
      is_veg: item.is_veg
    })
  }

  const handleUpdateQuantity = (itemId: string, change: number) => {
    updateQuantity(itemId, change)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    if (category !== 'All') {
      setTimeout(() => {
        const element = menuRefs.current[category]
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  const itemCount = getItemCount()
  const cartTotal = getCartTotal()

  if (restaurantLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading restaurant...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Restaurant not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-56 bg-gray-200">
          <img 
            src={restaurant.cover_image || restaurant.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop'
            }}
          />
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-t-3xl -mt-8 relative z-10 p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden border-4 border-white shadow-lg flex-shrink-0 -mt-12">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center">
                  <Store className="w-8 h-8 text-white/50" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{restaurant.name}</h1>
              <p className="text-sm text-gray-500">{restaurant.cuisine_type}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {renderStars(restaurant.rating)}
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{restaurant.eta || '30-40 min'}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">₹{toNumber(restaurant.delivery_charge).toFixed(2)} delivery</span>
                {restaurant.is_veg && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Pure Veg
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#E63946] text-[#E63946]' : 'text-gray-600'}`} />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {restaurant.address_line1 && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-4 h-4 text-[#E63946]" />
                <span>{restaurant.address_line1}, {restaurant.city}</span>
              </div>
            )}
            {restaurant.phone_number && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-4 h-4 text-[#E63946]" />
                <span>{restaurant.phone_number}</span>
              </div>
            )}
            {restaurant.opening_time && restaurant.closing_time && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-4 h-4 text-[#E63946]" />
                <span>{restaurant.opening_time} - {restaurant.closing_time}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Truck className="w-4 h-4 text-[#E63946]" />
              <span>{restaurant.total_orders || 0} orders delivered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="relative max-w-7xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Offers Carousel */}
        <OffersCarousel offers={offers} />

        {/* Delivery Info */}
        <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Truck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Delivery</p>
                <p className="text-xs text-gray-500">₹{toNumber(restaurant.delivery_charge).toFixed(2)} • {restaurant.eta || '30-40 min'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Min Order</p>
                <p className="text-xs text-gray-500">₹{toNumber(restaurant.minimum_order_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Items */}
        {recommendedItems.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#E63946]" />
              Recommended for you
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendedItems.map((item) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  isInCart={isInCart(item.id)}
                  quantity={getItemQuantity(item.id)}
                  onAdd={() => handleAddToCart(item)}
                  onUpdateQuantity={(change) => handleUpdateQuantity(item.id, change)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Menu by Category */}
        <div className="mt-6">
          {categories.filter(c => c !== 'All').map((category) => {
            const items = menuItems.filter(item => item.category === category)
            if (items.length === 0) return null
            
            return (
              <div 
                key={category} 
                ref={(el) => menuRefs.current[category] = el}
                className="mb-6 scroll-mt-24"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-[#E63946]" />
                  {category}
                  <span className="text-sm font-normal text-gray-400">({items.length})</span>
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      isInCart={isInCart(item.id)}
                      quantity={getItemQuantity(item.id)}
                      onAdd={() => handleAddToCart(item)}
                      onUpdateQuantity={(change) => handleUpdateQuantity(item.id, change)}
                      showCategory={false}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category Navigation (Fixed Bottom) */}
      {categories.length > 1 && (
        <CategoryNav 
          categories={categories} 
          onCategoryClick={handleCategoryClick}
          activeCategory={selectedCategory}
        />
      )}

      {/* Cart Bottom Bar */}
      {cartItems.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {itemCount} items • {formatCurrency(cartTotal)}
              </p>
              <p className="text-xs text-gray-500">Tap to view cart</p>
            </div>
            <button
              onClick={() => navigate('/customer/cart')}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#E63946] text-white rounded-xl hover:bg-[#C62828] transition shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              View Cart
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Missing icon components
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const Crown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const Leaf = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 0a8 8 0 00-8 8h4m4-4a8 8 0 018 8h-4m-4-4v8m0 0a8 8 0 01-8-8h4m4 4a8 8 0 008-8h-4" />
  </svg>
)

const Gift = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
)

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)