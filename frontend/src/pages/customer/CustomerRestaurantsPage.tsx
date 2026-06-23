// pages/customer/CustomerRestaurantsPage.tsx

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Store, Star, MapPin, Clock, DollarSign,
  Filter, Grid3x3, List, ChevronRight,
  Beef, Award, Zap, UtensilsCrossed,
  Users, Heart, Share2, Phone, Mail, Coffee, Pizza, Cake, TrendingUp,
  Utensils, ShoppingBag, Package, Leaf, X, ChefHat
} from 'lucide-react'
import { api } from '../../services/api'
import { useNavigate, useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'

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
  has_delivery?: boolean
  has_takeaway?: boolean
  has_dining?: boolean
  is_veg?: boolean
  is_featured?: boolean
  is_offering?: boolean
  discount?: string
  eta?: string
  total_orders?: number
  total_revenue?: number
  seating_capacity?: number
  outdoor_seating?: boolean
  parking_available?: boolean
  wifi_available?: boolean
  music_available?: boolean
  images?: string[]
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
      <span className="ml-1 text-xs font-medium text-gray-600">{ratingNum.toFixed(1)}</span>
    </div>
  )
}

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

// Dish images for menu items
const dishImages = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1564757025389-9b5dd7c24d2d?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1555949258-eb67b1ef0ce4?w=100&h=100&fit=crop',
]

// Menu Modal Component with Dish Images
const MenuModal = ({ restaurant, onClose }: { restaurant: Restaurant | null; onClose: () => void }) => {
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

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
          image: dishImages[index % dishImages.length],
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

  const categories = ['All', ...new Set(menuItems.map((item: any) => item.category))].filter(Boolean)
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter((item: any) => item.category === selectedCategory)

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
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-8 h-8 rounded object-cover" />
              ) : (
                <Store className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{restaurant.name}</h2>
              <p className="text-white/70 text-sm">{restaurant.cuisine_type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {categories.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
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

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No menu items available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item: any) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1D3557]/10 to-[#457B9D]/10 flex items-center justify-center">
                          <UtensilsCrossed className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
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
                          <TrendingUp className="w-3 h-3" />
                          Recommended
                        </span>
                      )}
                      {!item.is_available && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Unavailable</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-bold text-[#E63946]">₹{formatPrice(item.price)}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{item.preparation_time || 15} min</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {item.is_available ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Available</span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Unavailable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Tab Navigation Component
const TabNavigation = ({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: string
  onTabChange: (tab: string) => void 
}) => {
  const tabs = [
    { id: 'delivery', label: 'Delivery', icon: Package },
    { id: 'takeaway', label: 'Takeaway', icon: ShoppingBag },
    { id: 'dining', label: 'Dining', icon: Utensils },
  ]

  return (
    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              isActive
                ? 'bg-white text-[#E63946] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export const CustomerRestaurantsPage = () => {
  const navigate = useNavigate()
  const outletContext = useOutletContext<{
    selectedTab?: string
    isVegMode?: boolean
    searchQuery?: string
    onTabChange?: (tab: string) => void
  }>()
  
  const selectedTab = outletContext?.selectedTab || 'delivery'
  const isVegMode = outletContext?.isVegMode || false
  const searchQuery = outletContext?.searchQuery || ''
  const onTabChange = outletContext?.onTabChange

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [showMenuModal, setShowMenuModal] = useState(false)

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['customer-restaurants', selectedTab, isVegMode],
    queryFn: async (): Promise<Restaurant[]> => {
      const response = await api.get('/restaurants/')
      let restaurantsData: Restaurant[] = []
      
      if (Array.isArray(response.data)) {
        restaurantsData = response.data
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        restaurantsData = response.data.results
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        restaurantsData = response.data.data
      }
      
      return restaurantsData.map((r: Restaurant, index: number) => ({
        ...r,
        cover_image: foodImages[index % foodImages.length],
        has_delivery: true,
        has_takeaway: index % 2 === 0,
        has_dining: index % 3 === 0,
        is_veg: index % 4 === 0,
        is_featured: index % 3 === 0,
        is_offering: index % 2 === 0,
        discount: index % 2 === 0 ? `${10 + (index % 20)}% OFF` : undefined,
        eta: `${15 + (index % 30)}-${25 + (index % 20)} min`,
        seating_capacity: 20 + (index % 80),
        outdoor_seating: index % 2 === 0,
        parking_available: index % 3 === 0,
        wifi_available: index % 2 === 0,
        music_available: index % 3 === 0,
      }))
    },
  })

  // Handle tab change - redirect to dining page if dining tab is selected
  const handleTabChange = (tab: string) => {
    if (tab === 'dining') {
      // Navigate to dining page
      navigate('/customer/dining')
      return
    }
    
    // For other tabs, update the context
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant: Restaurant) => {
    const matchesSearch = 
      restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesVeg = !isVegMode || restaurant.is_veg
    
    let matchesTab = true
    if (selectedTab === 'takeaway') {
      matchesTab = restaurant.has_takeaway === true
    } else {
      matchesTab = restaurant.has_delivery === true
    }
    
    return matchesSearch && matchesVeg && matchesTab
  })

  // Featured restaurants first, then sorted by rating
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return toNumber(b.rating) - toNumber(a.rating)
  })

  const handleRestaurantClick = (restaurant: Restaurant) => {
    navigate(`/customer/restaurants/${restaurant.id}`)
  }

  const handleViewMenu = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setShowMenuModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Tab Navigation */}
      <TabNavigation activeTab={selectedTab} onTabChange={handleTabChange} />

      {/* View Toggle */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          {sortedRestaurants.length} restaurants found
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'grid' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'list' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-400'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {sortedRestaurants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No restaurants found</p>
        </div>
      ) : viewMode === 'list' ? (
        // List View
        <div className="space-y-4">
          {sortedRestaurants.map((restaurant) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition cursor-pointer"
              onClick={() => handleRestaurantClick(restaurant)}
            >
              <div className="flex gap-4 p-4">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden">
                    {restaurant.logo_url ? (
                      <img 
                        src={restaurant.logo_url} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center">
                        <Store className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{restaurant.name}</h3>
                      <p className="text-sm text-gray-500">{restaurant.cuisine_type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(restaurant.rating)}
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{restaurant.eta || '30-40 min'}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">₹{toNumber(restaurant.delivery_charge).toFixed(2)} delivery</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewMenu(restaurant)
                        }}
                        className="px-4 py-2 bg-[#E63946] text-white rounded-lg text-sm font-medium hover:bg-[#C62828] transition"
                      >
                        View Menu
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestaurantClick(restaurant)
                        }}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {restaurant.is_featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    {restaurant.is_offering && restaurant.discount && (
                      <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {restaurant.discount}
                      </span>
                    )}
                    {restaurant.is_veg && (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        Pure Veg
                      </span>
                    )}
                    {restaurant.has_delivery && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full">Delivery</span>
                    )}
                    {restaurant.has_takeaway && (
                      <span className="text-xs bg-green-100 text-green-600 px-2.5 py-1 rounded-full">Takeaway</span>
                    )}
                    {restaurant.has_dining && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full">Dining</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sortedRestaurants.map((restaurant) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer group"
              onClick={() => handleRestaurantClick(restaurant)}
            >
              <div className="relative h-40 bg-gray-200">
                <img 
                  src={restaurant.cover_image || foodImages[0]} 
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

                {restaurant.has_dining && (
                  <div className="absolute top-3 left-16 bg-purple-500 text-white px-1.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5 shadow-lg z-10">
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
                {restaurant.is_veg && (
                  <span className="mt-1 inline-block text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Leaf className="w-3 h-3" />
                    Veg
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewMenu(restaurant)
                  }}
                  className="mt-2 w-full py-1.5 bg-[#E63946] text-white rounded-lg text-xs font-medium hover:bg-[#C62828] transition"
                >
                  View Menu
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dining Promo Banner - Only show when not on dining tab */}
      {selectedTab !== 'dining' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 cursor-pointer"
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
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="text-sm text-white/90 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Table booking
              </span>
              <span className="text-sm text-white/90 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Exclusive offers
              </span>
              <button className="ml-auto px-4 py-2 bg-white text-purple-600 rounded-xl text-sm font-medium hover:bg-white/90 transition">
                Explore Now →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Menu Modal */}
      <AnimatePresence>
        {showMenuModal && selectedRestaurant && (
          <MenuModal restaurant={selectedRestaurant} onClose={() => setShowMenuModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Custom icons that were missing
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)