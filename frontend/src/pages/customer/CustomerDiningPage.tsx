// pages/customer/CustomerDiningPage.tsx

import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, Star, MapPin, Clock, DollarSign,
  UtensilsCrossed, Coffee, Pizza, Cake, IceCream,
  Beef, Leaf, Wine, Music, Users, PartyPopper,
  Crown, Sparkles, Award, Zap, Heart, Share2,
  Phone, Mail, Globe, Instagram, Facebook,
  Twitter, Youtube, ExternalLink, ChevronLeft,
  X, Menu as MenuIcon, Plus, Minus, ShoppingBag,
  Calendar, Gift, Tag, Percent, BadgePercent,
  CheckCircle, AlertCircle, ArrowRight, ChevronRight,
  BookOpen, Utensils, Maximize2, Image, Info,
  Flame, Sun, Moon, Cloud, Wind, Snowflake,
  Coffee as CoffeeIcon, Sandwich, Salad, Soup,
  ChefHat, Timer, DollarSign as DollarIcon,
  TrendingUp, ThumbsUp, Smile, Home, Building2,
  Trees, ParkingCircle, Wifi, Music2, Dog,
  GlassWater, Beer, UtensilsCrossed as DiningIcon
} from 'lucide-react'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface DiningRestaurant {
  id: string
  name: string
  cuisine_type: string
  city: string
  rating: number | string
  is_active: boolean
  logo_url?: string
  cover_image?: string
  cover_image_url?: string
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
  has_delivery?: boolean
  has_takeaway?: boolean
  has_dining?: boolean
  seating_capacity?: number
  outdoor_seating?: boolean
  parking_available?: boolean
  wifi_available?: boolean
  music_available?: boolean
  pet_friendly?: boolean
  serves_alcohol?: boolean
  dining_type?: string
  dining_type_display?: string
  gallery_images?: string[]
  offers?: Array<{
    id: string
    title: string
    description: string
    discount: string
    valid_until: string
  }>
  ambiance?: string[]
  special_diets?: string[]
  dress_code?: string
  has_live_music?: boolean
  has_private_dining?: boolean
  accepts_reservations?: boolean
  total_reviews?: number
  is_open_now?: boolean
  opening_time_display?: string
  closing_time_display?: string
}

interface DiningOffer {
  id: string
  title: string
  description: string
  discount: string
  valid_until: string
  restaurant_id: string
  restaurant_name: string
  type: 'WEEKDAY' | 'WEEKEND' | 'SPECIAL' | 'FESTIVE' | 'HAPPY_HOUR' | 'BIRTHDAY'
  terms_conditions?: string
  minimum_spend?: number
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  is_available: boolean
  is_veg: boolean
  is_recommended: boolean
  preparation_time: number
  image?: string
  calories?: number
  dietary_info?: string[]
  ingredients?: string[]
}

// Images
const diningImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559339352-11d036aa6de9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
]

const menuFoodImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop',
]

// Dining Offers Data
const diningOffers: DiningOffer[] = [
  {
    id: '1',
    title: 'Weekday Special',
    description: '20% off on all dining orders',
    discount: '20% OFF',
    valid_until: 'Valid Mon-Fri',
    restaurant_id: '',
    restaurant_name: 'All Dining',
    type: 'WEEKDAY',
    terms_conditions: 'Minimum order ₹299',
    minimum_spend: 299
  },
  {
    id: '2',
    title: 'Weekend Brunch',
    description: 'Free dessert with every meal',
    discount: 'Free Dessert',
    valid_until: 'Valid Sat-Sun',
    restaurant_id: '',
    restaurant_name: 'All Dining',
    type: 'WEEKEND',
    terms_conditions: 'For orders above ₹499',
    minimum_spend: 499
  },
  {
    id: '3',
    title: 'Happy Hours',
    description: 'Buy 1 Get 1 Free on selected drinks',
    discount: 'BOGO',
    valid_until: '3 PM - 7 PM',
    restaurant_id: '',
    restaurant_name: 'All Dining',
    type: 'HAPPY_HOUR',
    terms_conditions: 'Valid on selected beverages only',
    minimum_spend: 0
  },
  {
    id: '4',
    title: 'Festive Feast',
    description: '15% off on family dining',
    discount: '15% OFF',
    valid_until: 'Valid during festive season',
    restaurant_id: '',
    restaurant_name: 'All Dining',
    type: 'FESTIVE',
    terms_conditions: 'For groups of 4 or more',
    minimum_spend: 599
  },
]

// Mood Categories
const moodCategories = [
  { id: 'drink_dine', label: 'Drink & Dine', icon: Wine, color: 'purple', bg: 'bg-purple-50' },
  { id: 'premium', label: 'Premium Dining', icon: Crown, color: 'amber', bg: 'bg-amber-50' },
  { id: 'cozy', label: 'Cozy Cafes', icon: CoffeeIcon, color: 'brown', bg: 'bg-amber-50' },
  { id: 'family', label: 'Family Dining', icon: Users, color: 'green', bg: 'bg-green-50' },
  { id: 'rooftop', label: 'Rooftops', icon: PartyPopper, color: 'blue', bg: 'bg-blue-50' },
  { id: 'pureveg', label: 'Pure Veg', icon: Leaf, color: 'green', bg: 'bg-emerald-50' },
  { id: 'live_music', label: 'Live Music', icon: Music2, color: 'indigo', bg: 'bg-indigo-50' },
  { id: 'private', label: 'Private Dining', icon: Building2, color: 'slate', bg: 'bg-slate-50' },
]

// Filter Options
const filterOptions = {
  sort: ['Recommended', 'Top Rated', 'Open Now', 'Near Me'],
  features: ['Pure Veg', 'Pet Friendly', 'Serves Alcohol', 'Outdoor Seating', 'WiFi', 'Live Music', 'Parking'],
  diningTypes: ['Cafes', 'Fine Dining', 'Rooftop', 'Family Dining', 'Fast Casual', 'Buffet', 'Bar & Grill']
}

// Helper function
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
          className={`w-3.5 h-3.5 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-gray-600">{ratingNum.toFixed(1)}</span>
    </div>
  )
}

// ===================== MENU MODAL =====================
const DiningMenuModal = ({ 
  restaurant, 
  onClose 
}: { 
  restaurant: DiningRestaurant | null
  onClose: () => void 
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (restaurant) {
      fetchMenuItems()
    }
  }, [restaurant])

  const fetchMenuItems = async () => {
    if (!restaurant) return
    setLoading(true)
    try {
      const response = await api.get(`/restaurants/${restaurant.id}/menu/`)
      if (response.data.success) {
        const items = (response.data.data || []).map((item: any, index: number) => ({
          ...item,
          image: menuFoodImages[index % menuFoodImages.length],
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
        }))
        setMenuItems(items)
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...new Set(menuItems.map((item) => item.category))].filter(Boolean)
  
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const recommendedItems = menuItems.filter(item => item.is_recommended)

  const formatPrice = (price: any) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  if (!restaurant) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                {restaurant.logo_url ? (
                  <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
                ) : (
                  <UtensilsCrossed className="w-6 h-6 text-white/70" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{restaurant.name}</h2>
                <p className="text-white/70 text-sm flex items-center gap-2">
                  <span>{restaurant.cuisine_type}</span>
                  {restaurant.is_veg && (
                    <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> Veg
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
          </div>
        </div>

        <div className="p-6">
          {/* Recommended Section */}
          {recommendedItems.length > 0 && selectedCategory === 'All' && !searchTerm && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[#E63946]" />
                Chef's Recommendations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <img 
                      src={item.image || menuFoodImages[0]} 
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-[#E63946]">₹{formatPrice(item.price)}</span>
                        {item.is_veg && <Leaf className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === category
                      ? 'bg-[#E63946] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Menu Items Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 mt-2 text-sm">Loading menu...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No menu items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition group"
                >
                  <div className="relative h-40 bg-gray-200">
                    <img 
                      src={item.image || menuFoodImages[index % menuFoodImages.length]} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold">Unavailable</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {item.is_veg && (
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          Veg
                        </span>
                      )}
                      {item.is_recommended && (
                        <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ChefHat className="w-3 h-3" />
                          Chef's Pick
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg text-white text-xs flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {item.preparation_time || 15} min
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-[#E63946]">₹{formatPrice(item.price)}</span>
                      <button 
                        className={`text-xs px-3 py-1 rounded-lg transition ${
                          item.is_available 
                            ? 'bg-[#E63946] text-white hover:bg-[#C62828]' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!item.is_available}
                        onClick={() => toast.success(`Added ${item.name} to cart!`)}
                      >
                        {item.is_available ? 'Add' : 'Unavailable'}
                      </button>
                    </div>
                    {item.dietary_info && item.dietary_info.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {item.dietary_info.slice(0, 2).map((diet) => (
                          <span key={diet} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                            {diet}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===================== RESTAURANT DETAIL MODAL =====================
const DiningRestaurantDetailModal = ({ 
  restaurant, 
  onClose,
  onViewMenu,
  onBookTable
}: { 
  restaurant: DiningRestaurant | null
  onClose: () => void
  onViewMenu: () => void
  onBookTable: () => void
}) => {
  const [activeImage, setActiveImage] = useState(0)

  if (!restaurant) return null

  const galleryImages = restaurant.gallery_images || diningImages.slice(0, 6)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gallery */}
        <div className="relative h-64 md:h-80 bg-gray-200">
          <img 
            src={galleryImages[activeImage] || restaurant.cover_image || diningImages[0]} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          
          {/* Gallery Navigation */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveImage((prev) => (prev + 1) % galleryImages.length)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImage(idx)
                    }}
                    className={`h-1.5 rounded-full transition ${
                      idx === activeImage ? 'w-6 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Rating Badge on Image */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-bold">{toNumber(restaurant.rating).toFixed(1)}</span>
            </div>
            <span className="text-xs text-white/60">•</span>
            <span className="text-xs text-white/80">{restaurant.total_reviews || 0} reviews</span>
          </div>

          {/* Offer Badge */}
          {restaurant.is_offering && restaurant.discount && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg flex items-center gap-1">
              <Zap className="w-4 h-4" />
              {restaurant.discount}
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Restaurant Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-white/50" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{restaurant.name}</h2>
                  <p className="text-sm text-gray-500">{restaurant.cuisine_type}</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-[#E63946] transition">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{toNumber(restaurant.rating).toFixed(1)}</span>
                </div>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{restaurant.total_reviews || 0} reviews</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{restaurant.city}</span>
                {restaurant.is_veg && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Pure Veg
                  </span>
                )}
                {restaurant.is_open_now && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Open Now
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white rounded-lg text-sm font-medium hover:bg-[#C62828] transition">
              <Phone className="w-4 h-4" />
              Call
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              <MapPin className="w-4 h-4" />
              Direction
            </button>
            <button 
              onClick={onViewMenu}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              <MenuIcon className="w-4 h-4" />
              View Menu
            </button>
            {restaurant.accepts_reservations && (
              <button 
                onClick={() => {
                  onBookTable()
                  onClose()
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#1D3557] text-white rounded-lg text-sm font-medium hover:bg-[#15273f] transition"
              >
                <Calendar className="w-4 h-4" />
                Book Table
              </button>
            )}
          </div>

          {/* Dining Type & Amenities */}
          <div className="flex flex-wrap gap-2">
            {restaurant.dining_type_display && (
              <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <DiningIcon className="w-3 h-3" />
                {restaurant.dining_type_display}
              </span>
            )}
            {restaurant.outdoor_seating && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Trees className="w-3 h-3" />
                Outdoor
              </span>
            )}
            {restaurant.parking_available && (
              <span className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ParkingCircle className="w-3 h-3" />
                Parking
              </span>
            )}
            {restaurant.wifi_available && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                WiFi
              </span>
            )}
            {restaurant.music_available && (
              <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Music2 className="w-3 h-3" />
                Music
              </span>
            )}
            {restaurant.pet_friendly && (
              <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Dog className="w-3 h-3" />
                Pet Friendly
              </span>
            )}
            {restaurant.serves_alcohol && (
              <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <GlassWater className="w-3 h-3" />
                Serves Alcohol
              </span>
            )}
            {restaurant.has_live_music && (
              <span className="text-xs bg-pink-50 text-pink-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Music2 className="w-3 h-3" />
                Live Music
              </span>
            )}
            {restaurant.has_private_dining && (
              <span className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Private Dining
              </span>
            )}
            {restaurant.dress_code && (
              <span className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full">
                👔 {restaurant.dress_code}
              </span>
            )}
          </div>

          {/* Description */}
          {restaurant.description && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{restaurant.description}</p>
            </div>
          )}

          {/* Special Diets */}
          {restaurant.special_diets && restaurant.special_diets.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Special Diets</h3>
              <div className="flex flex-wrap gap-1">
                {restaurant.special_diets.map((diet) => (
                  <span key={diet} className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                    {diet}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Offers */}
          {restaurant.offers && restaurant.offers.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#E63946]" />
                Offers
              </h3>
              <div className="space-y-2">
                {restaurant.offers.map((offer) => (
                  <div key={offer.id} className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{offer.title}</p>
                        <p className="text-sm text-gray-500">{offer.description}</p>
                      </div>
                      <span className="text-lg font-bold text-[#E63946]">{offer.discount}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Valid: {offer.valid_until}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Restaurants */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Similar Restaurants</h3>
            <p className="text-sm text-gray-500">More restaurants matching your taste coming soon...</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===================== BOOKING MODAL =====================
const BookingModal = ({ 
  restaurant, 
  onClose,
  onBook
}: { 
  restaurant: DiningRestaurant
  onClose: () => void
  onBook: (data: any) => void
}) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!date || !time) {
      toast.error('Please select date and time')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await api.post('/restaurants/bookings/create/', {
        restaurant_id: restaurant.id,
        date,
        time,
        party_size: partySize,
        special_requests: specialRequests
      })
      if (response.data.success) {
        toast.success('Table booked successfully!')
        onBook(response.data.data)
        onClose()
      }
    } catch (error) {
      toast.error('Failed to book table')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate time slots
  const timeSlots = []
  for (let h = 10; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0')
      const minute = m.toString().padStart(2, '0')
      timeSlots.push(`${hour}:${minute}`)
    }
  }

  // Generate next 14 days
  const dateOptions = []
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    const display = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    dateOptions.push({ value: `${year}-${month}-${day}`, display })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E63946]" />
              Book a Table
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Restaurant Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img src={restaurant.logo_url || diningImages[0]} alt={restaurant.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{restaurant.name}</p>
                <p className="text-xs text-gray-500">{restaurant.cuisine_type}</p>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Select Date</label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              >
                <option value="">Select a date</option>
                {dateOptions.map((d) => (
                  <option key={d.value} value={d.value}>{d.display}</option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Select Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              >
                <option value="">Select a time</option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Party Size */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Party Size</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold w-12 text-center">{partySize}</span>
                <button
                  onClick={() => setPartySize(Math.min(20, partySize + 1))}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">guests</span>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Special Requests</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requests (dietary, seating, etc.)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] resize-none"
                rows={2}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !date || !time}
              className="w-full py-3 bg-[#E63946] text-white rounded-xl font-medium hover:bg-[#C62828] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Booking...
                </div>
              ) : (
                'Book Table'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ===================== OFFER CARD =====================
const OfferCard = ({ offer, onClick }: { offer: DiningOffer; onClick: () => void }) => {
  const getGradient = () => {
    switch (offer.type) {
      case 'WEEKDAY':
        return 'from-blue-500 to-cyan-500'
      case 'WEEKEND':
        return 'from-purple-500 to-pink-500'
      case 'SPECIAL':
        return 'from-amber-500 to-orange-500'
      case 'FESTIVE':
        return 'from-red-500 to-rose-500'
      case 'HAPPY_HOUR':
        return 'from-yellow-500 to-orange-500'
      case 'BIRTHDAY':
        return 'from-pink-500 to-rose-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getEmoji = () => {
    switch (offer.type) {
      case 'WEEKDAY':
        return '📅'
      case 'WEEKEND':
        return '🎉'
      case 'SPECIAL':
        return '✨'
      case 'FESTIVE':
        return '🎊'
      case 'HAPPY_HOUR':
        return '🍻'
      case 'BIRTHDAY':
        return '🎂'
      default:
        return '🏷️'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl cursor-pointer bg-gradient-to-r ${getGradient()} p-5 text-white shadow-lg hover:shadow-xl transition`}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 text-6xl opacity-10 -translate-y-2 translate-x-2">
        {getEmoji()}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{getEmoji()}</span>
          <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
            {offer.type.replace('_', ' ')}
          </span>
        </div>
        <h3 className="text-lg font-bold">{offer.title}</h3>
        <p className="text-white/80 text-sm">{offer.description}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-2xl font-bold bg-white/20 px-3 py-0.5 rounded-lg">
            {offer.discount}
          </span>
          {offer.minimum_spend && offer.minimum_spend > 0 && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Min ₹{offer.minimum_spend}
            </span>
          )}
        </div>
        <p className="text-xs text-white/60 mt-2">{offer.valid_until}</p>
        <div className="mt-2 text-xs text-white/70 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Tap to apply
        </div>
      </div>
    </motion.div>
  )
}

// ===================== MAIN PAGE =====================
export const CustomerDiningPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('Recommended')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedDiningType, setSelectedDiningType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<DiningRestaurant | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<DiningOffer | null>(null)
  const [showOfferDetail, setShowOfferDetail] = useState(false)

  // Fetch dining restaurants
  const { data: restaurants = [], isLoading, refetch } = useQuery<DiningRestaurant[]>({
    queryKey: ['dining-restaurants'],
    queryFn: async () => {
      const response = await api.get('/restaurants/?dining=true')
      let restaurantsData: DiningRestaurant[] = []
      if (Array.isArray(response.data)) {
        restaurantsData = response.data
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        restaurantsData = response.data.results
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        restaurantsData = response.data.data
      }
      return restaurantsData.map((r, index) => ({
        ...r,
        cover_image: diningImages[index % diningImages.length],
        gallery_images: diningImages.slice(index % 6, (index % 6) + 6),
        has_dining: true,
        is_veg: index % 3 === 0,
        is_featured: index % 3 === 0,
        is_offering: index % 2 === 0,
        discount: index % 2 === 0 ? `${10 + (index % 20)}% OFF` : undefined,
        dining_type: ['CASUAL', 'FINE', 'ROOFTOP', 'CAFE', 'FAMILY', 'BUFFET'][index % 6],
        dining_type_display: ['Casual Dining', 'Fine Dining', 'Rooftop', 'Cafe', 'Family Dining', 'Buffet'][index % 6],
        pet_friendly: index % 3 === 0,
        serves_alcohol: index % 2 === 0,
        outdoor_seating: index % 2 === 0,
        wifi_available: index % 2 === 0,
        music_available: index % 3 === 0,
        parking_available: index % 4 === 0,
        has_live_music: index % 4 === 0,
        has_private_dining: index % 5 === 0,
        accepts_reservations: true,
        is_open_now: index % 3 !== 1,
        total_reviews: 50 + index * 10,
        special_diets: index % 2 === 0 ? ['Vegetarian', 'Vegan'] : ['Vegetarian', 'Gluten-Free'],
        ambiance: ['Romantic', 'Family', 'Business', 'Casual'].slice(0, 1 + (index % 3)),
        dress_code: index % 3 === 0 ? 'Smart Casual' : 'Casual',
        offers: [
          {
            id: '1',
            title: 'Weekday Special',
            description: '20% off on all dining orders',
            discount: '20% OFF',
            valid_until: 'Valid Mon-Fri'
          }
        ]
      }))
    },
  })

  // Apply filters - FIXED TypeScript issues
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = 
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMood = !selectedMood || 
      (selectedMood === 'pureveg' && restaurant.is_veg) ||
      (selectedMood === 'rooftop' && restaurant.dining_type === 'ROOFTOP') ||
      (selectedMood === 'premium' && restaurant.dining_type === 'FINE') ||
      (selectedMood === 'cozy' && restaurant.dining_type === 'CAFE') ||
      (selectedMood === 'family' && restaurant.dining_type === 'FAMILY') ||
      (selectedMood === 'drink_dine' && restaurant.serves_alcohol) ||
      (selectedMood === 'live_music' && restaurant.has_live_music) ||
      (selectedMood === 'private' && restaurant.has_private_dining)
    
    const matchesFeatures = selectedFeatures.length === 0 || 
      selectedFeatures.every(feature => {
        if (feature === 'Pure Veg') return restaurant.is_veg
        if (feature === 'Pet Friendly') return restaurant.pet_friendly
        if (feature === 'Serves Alcohol') return restaurant.serves_alcohol
        if (feature === 'Outdoor Seating') return restaurant.outdoor_seating
        if (feature === 'WiFi') return restaurant.wifi_available
        if (feature === 'Live Music') return restaurant.has_live_music
        if (feature === 'Parking') return restaurant.parking_available
        return true
      })
    
    const matchesDiningType = !selectedDiningType || 
      restaurant.dining_type_display?.toLowerCase().includes(selectedDiningType.toLowerCase())
    
    // Handle Open Now filter - FIXED: properly assign boolean
    if (selectedFilter === 'Open Now') {
      return matchesSearch && matchesMood && matchesFeatures && matchesDiningType && restaurant.is_open_now === true
    }
    
    return matchesSearch && matchesMood && matchesFeatures && matchesDiningType
  })

  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (selectedFilter === 'Top Rated') {
      return toNumber(b.rating) - toNumber(a.rating)
    }
    if (selectedFilter === 'Recommended') {
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
    }
    return 0
  })

  const handleRestaurantClick = (restaurant: DiningRestaurant) => {
    setSelectedRestaurant(restaurant)
    setShowDetailModal(true)
  }

  const handleViewMenu = () => {
    setShowDetailModal(false)
    setTimeout(() => {
      setShowMenuModal(true)
    }, 300)
  }

  const handleBookTable = () => {
    if (selectedRestaurant) {
      setShowBookingModal(true)
    }
  }

  const handleOfferClick = (offer: DiningOffer) => {
    setSelectedOffer(offer)
    setShowOfferDetail(true)
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Search Bar */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition ${
              showFilters ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              {/* Sort */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Sort By</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.sort.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedFilter(option)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                        selectedFilter === option
                          ? 'bg-[#E63946] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Features</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.features.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => toggleFeature(feature)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                        selectedFeatures.includes(feature)
                          ? 'bg-[#E63946] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dining Types */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Dining Types</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.diningTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedDiningType(selectedDiningType === type ? null : type)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                        selectedDiningType === type
                          ? 'bg-[#E63946] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedFeatures.length > 0 || selectedDiningType || selectedMood) && (
                <button
                  onClick={() => {
                    setSelectedFeatures([])
                    setSelectedDiningType(null)
                    setSelectedMood(null)
                    setSelectedFilter('Recommended')
                  }}
                  className="text-xs text-[#E63946] font-medium hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offers Carousel */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#E63946]" />
            Dining Offers
          </h3>
          <span className="text-xs text-gray-400">{diningOffers.length} offers available</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {diningOffers.map((offer, index) => (
            <OfferCard 
              key={offer.id} 
              offer={offer} 
              onClick={() => handleOfferClick(offer)}
            />
          ))}
        </div>
      </div>

      {/* Offer Detail Modal */}
      <AnimatePresence>
        {showOfferDetail && selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowOfferDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">{selectedOffer.title}</h2>
                <button onClick={() => setShowOfferDetail(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                  <p className="text-3xl font-bold text-[#E63946]">{selectedOffer.discount}</p>
                  <p className="text-gray-600">{selectedOffer.description}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-600">Valid:</span> {selectedOffer.valid_until}</p>
                  {selectedOffer.minimum_spend && selectedOffer.minimum_spend > 0 && (
                    <p><span className="font-medium text-gray-600">Minimum Order:</span> ₹{selectedOffer.minimum_spend}</p>
                  )}
                  {selectedOffer.terms_conditions && (
                    <p><span className="font-medium text-gray-600">Terms:</span> {selectedOffer.terms_conditions}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    toast.success(`Offer ${selectedOffer.title} applied!`)
                    setShowOfferDetail(false)
                  }}
                  className="w-full py-3 bg-[#E63946] text-white rounded-xl font-medium hover:bg-[#C62828] transition"
                >
                  Apply Offer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Categories */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E63946]" />
          What's the mood?
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {moodCategories.map((mood) => {
            const Icon = mood.icon
            const isActive = selectedMood === mood.id
            return (
              <motion.button
                key={mood.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMood(isActive ? null : mood.id)}
                className={`p-3 rounded-xl border-2 text-center transition ${
                  isActive
                    ? 'border-[#E63946] bg-red-50 shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-1 ${
                  isActive ? 'text-[#E63946]' : 'text-gray-400'
                }`} />
                <p className={`text-xs font-medium ${
                  isActive ? 'text-[#E63946]' : 'text-gray-600'
                }`}>
                  {mood.label}
                </p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedMood ? moodCategories.find(m => m.id === selectedMood)?.label : 'All Dining'}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({sortedRestaurants.length} restaurants)
            </span>
          </h3>
          {selectedMood && (
            <button
              onClick={() => setSelectedMood(null)}
              className="text-xs text-[#E63946] hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sortedRestaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No dining restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer group"
                onClick={() => handleRestaurantClick(restaurant)}
              >
                <div className="relative h-40 bg-gray-200">
                  <img 
                    src={restaurant.cover_image || diningImages[index % diningImages.length]} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = diningImages[0]
                    }}
                  />
                  {/* Rating Badge - Green */}
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {toNumber(restaurant.rating).toFixed(1)}
                  </div>
                  {/* Logo Overlay - Bottom Right */}
                  <div className="absolute bottom-2 right-2">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-lg border-2 border-white overflow-hidden">
                      {restaurant.logo_url ? (
                        <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center">
                          <UtensilsCrossed className="w-4 h-4 text-white/50" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Offer Badge - Top Right */}
                  {restaurant.is_offering && restaurant.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {restaurant.discount}
                    </div>
                  )}
                  {/* Veg Badge */}
                  {restaurant.is_veg && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-1.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5 shadow-lg">
                      <Leaf className="w-3 h-3" />
                      Veg
                    </div>
                  )}
                  {/* Open Now */}
                  {restaurant.is_open_now && (
                    <div className="absolute top-2 left-16 bg-emerald-500 text-white px-1.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5 shadow-lg">
                      <CheckCircle className="w-3 h-3" />
                      Open
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-[#E63946] transition">
                    {restaurant.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">{restaurant.cuisine_type}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{restaurant.city}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {restaurant.dining_type_display && (
                      <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <DiningIcon className="w-3 h-3" />
                        {restaurant.dining_type_display.split(' ')[0]}
                      </span>
                    )}
                    {restaurant.serves_alcohol && (
                      <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <GlassWater className="w-3 h-3" />
                        Bar
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetailModal && selectedRestaurant && (
          <DiningRestaurantDetailModal 
            restaurant={selectedRestaurant}
            onClose={() => setShowDetailModal(false)}
            onViewMenu={handleViewMenu}
            onBookTable={handleBookTable}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenuModal && selectedRestaurant && (
          <DiningMenuModal 
            restaurant={selectedRestaurant}
            onClose={() => setShowMenuModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBookingModal && selectedRestaurant && (
          <BookingModal 
            restaurant={selectedRestaurant}
            onClose={() => setShowBookingModal(false)}
            onBook={() => {
              toast.success('Table booked successfully!')
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Menu Button */}
      <AnimatePresence>
        {!showDetailModal && !showMenuModal && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-4 z-40 p-4 bg-[#E63946] text-white rounded-full shadow-lg hover:bg-[#C62828] transition group"
            onClick={() => {
              if (selectedRestaurant) {
                setShowMenuModal(true)
              } else if (restaurants.length > 0) {
                setSelectedRestaurant(restaurants[0])
                setTimeout(() => setShowMenuModal(true), 300)
              } else {
                toast.error('No restaurant selected')
              }
            }}
          >
            <MenuIcon className="w-6 h-6 group-hover:scale-110 transition" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}