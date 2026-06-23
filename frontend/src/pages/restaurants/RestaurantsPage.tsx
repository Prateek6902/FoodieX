import { useState, useEffect, useRef} from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  RefreshCw,
  ShoppingBag,
  Store,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Phone,
  Mail,
  TrendingUp,
  Award,
  Package,
  Upload,
  Camera,
  Utensils,
  ChefHat,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'

// Import restaurant logos
import pizzaPalaceLogo from '../../assets/restaurants/pizza-palace.png'
import burgerHouseLogo from '../../assets/restaurants/burger-house.png'
import sushiWorldLogo from '../../assets/restaurants/sushi-world.png'
import subwayLogo from '../../assets/restaurants/subway.png'
import biryaniByKilo from '../../assets/restaurants/biryani.by.kilo.png'
import BehrozLogo from '../../assets/restaurants/behroz-biryani.png'
import tacoFiestaLogo from '../../assets/restaurants/taco-fiesta.png'
import veerjiLogo from '../../assets/restaurants/veer-ji.png'
import chhatHouseLogo from '../../assets/restaurants/chaat-house.png'
import tandoorStoryLogo from '../../assets/restaurants/tandoor-story.png'
import shushiWorldLogo from '../../assets/restaurants/shushi-world.png'
import curryCornerLogo from '../../assets/restaurants/curry-corner.png'
import defaultLogo from '../../assets/restaurants/default.png'
import KFCLogo from '../../assets/restaurants/kfc.png'
import StarBucksLogo from '../../assets/restaurants/starbucks.png'
import DominosLogo from '../../assets/restaurants/dominos.png'
import MCdonaldLogo from '../../assets/restaurants/mcdonald.png'

interface Restaurant {
  id: string
  name: string
  cuisine_type: string
  city: string
  address_line1?: string
  phone_number?: string
  email?: string
  rating: number | string
  delivery_charge: number | string
  minimum_order_amount: number | string
  is_active: boolean
  total_orders?: number
  total_revenue?: number
  description?: string
  logo_url?: string
  opening_time?: string
  closing_time?: string
  status?: string
}

interface MenuItem {
  id: string
  name: string
  price: number | string
  category: string
  description: string
  is_available: boolean
  preparation_time: number
}

// Helper function to convert to number
const toNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

// Restaurant images mapping
const restaurantImages: Record<string, string> = {
  'Pizza Palace': pizzaPalaceLogo,
  'Burger House': burgerHouseLogo,
  'Sushi World': sushiWorldLogo,
  'Shushi World': shushiWorldLogo,
  'Subway': subwayLogo,
  'Biryani By Kilo': biryaniByKilo,
  'Behroz Biryani': BehrozLogo,
  'Taco Fiesta': tacoFiestaLogo,
  'Veerji': veerjiLogo,
  'Chhat House': chhatHouseLogo,
  'Tandoor Story': tandoorStoryLogo,
  'Curry Corner': curryCornerLogo,
  'KFC': KFCLogo, 
  'MCDonald': MCdonaldLogo,
  'Rolls & Bowls': defaultLogo,
  'Dominos': DominosLogo,
  'StarBucks': StarBucksLogo
}

const defaultImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&h=120&fit=crop'

const getRestaurantImage = (restaurant: Restaurant): string => {
  if (restaurant.logo_url) {
    return restaurant.logo_url.startsWith('http') 
      ? restaurant.logo_url 
      : `http://localhost:8000${restaurant.logo_url}`
  }
  return restaurantImages[restaurant.name] || defaultImage
}

const fetchRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const response = await api.get('/restaurants/')
    console.log('Restaurants API response:', response.data)
    
    let restaurants: Restaurant[] = []
    
    if (Array.isArray(response.data)) {
      restaurants = response.data
    } else if (response.data?.results && Array.isArray(response.data.results)) {
      restaurants = response.data.results
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      restaurants = response.data.data
    }
    
    // Filter out duplicate restaurants - keep only one Sushi World (prefer ACTIVE status)
    const sushiWorldRestaurants = restaurants.filter(r => 
      r.name.toLowerCase() === 'sushi world' || r.name.toLowerCase() === 'shushi world'
    )
    
    if (sushiWorldRestaurants.length > 1) {
      const activeSushi = sushiWorldRestaurants.find(r => r.status === 'ACTIVE')
      if (activeSushi) {
        restaurants = restaurants.filter(r => {
          if (r.name.toLowerCase() === 'sushi world' || r.name.toLowerCase() === 'shushi world') {
            return r.id === activeSushi.id
          }
          return true
        })
      }
    }
    
    return restaurants
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }
}

// Menu Modal Component
const MenuModal = ({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  useEffect(() => {
    fetchMenuItems()
  }, [restaurant.id])

  const fetchMenuItems = async () => {
    setLoading(true)
    try {
      let response
      try {
        response = await api.get(`/restaurants/${restaurant.id}/menu-items/`)
      } catch {
        try {
          response = await api.get(`/restaurants/${restaurant.id}/menu/`)
        } catch {
          response = await api.get(`/restaurants/${restaurant.id}/items/`)
        }
      }
      
      console.log('Menu items response:', response.data)
      
      let items = []
      if (response.data.success) {
        items = response.data.data || response.data.items || []
      } else if (Array.isArray(response.data)) {
        items = response.data
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        items = response.data.results
      }
      
      setMenuItems(items)
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...new Set(menuItems.map(item => item.category))].filter(Boolean)
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <img
                src={getRestaurantImage(restaurant)}
                alt={restaurant.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{restaurant.name}</h2>
              <p className="text-white/70 text-sm">{restaurant.cuisine_type} • {restaurant.city}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Restaurant Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-3 text-center border border-yellow-100">
              <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">{toNumber(restaurant.rating).toFixed(1)}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 text-center border border-blue-100">
              <DollarSign className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">${toNumber(restaurant.delivery_charge).toFixed(2)}</p>
              <p className="text-xs text-gray-500">Delivery Fee</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-100">
              <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">30-45 min</p>
              <p className="text-xs text-gray-500">Delivery Time</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 text-center border border-emerald-100">
              <ShoppingBag className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-800">${toNumber(restaurant.minimum_order_amount).toFixed(2)}</p>
              <p className="text-xs text-gray-500">Min Order</p>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-[#E63946] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Menu Items */}
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#E63946]" />
            Menu Items
            <span className="text-sm font-normal text-gray-400 ml-2">({filteredItems.length})</span>
          </h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading menu items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No menu items available</p>
              <p className="text-sm text-gray-400">This restaurant hasn't added any items yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item, idx) => {
                const price = toNumber(item.price)
                const isAvailable = item.is_available !== false
                
                return (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`group p-4 rounded-xl border transition-all ${
                      isAvailable 
                        ? 'bg-white border-gray-100 hover:border-[#E63946] hover:shadow-md' 
                        : 'bg-gray-50 border-gray-100 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800 group-hover:text-[#E63946] transition">
                            {item.name}
                          </h4>
                          {!isAvailable && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-lg font-bold text-[#E63946]">${price.toFixed(2)}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {item.preparation_time || 15} min
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Manage Modal Component
const ManageModal = ({ restaurant, onClose, onUpdate }: { restaurant: Restaurant; onClose: () => void; onUpdate: () => void }) => {
  const [formData, setFormData] = useState({
    name: restaurant.name,
    cuisine_type: restaurant.cuisine_type,
    city: restaurant.city,
    delivery_charge: toNumber(restaurant.delivery_charge).toString(),
    minimum_order_amount: toNumber(restaurant.minimum_order_amount).toString(),
    phone_number: restaurant.phone_number || '',
    email: restaurant.email || '',
    address_line1: restaurant.address_line1 || '',
    opening_time: restaurant.opening_time || '09:00',
    closing_time: restaurant.closing_time || '22:00',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(restaurant.logo_url || null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('cuisine_type', formData.cuisine_type)
      formDataToSend.append('city', formData.city)
      formDataToSend.append('delivery_charge', formData.delivery_charge)
      formDataToSend.append('minimum_order_amount', formData.minimum_order_amount)
      formDataToSend.append('phone_number', formData.phone_number)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('address_line1', formData.address_line1)
      formDataToSend.append('opening_time', formData.opening_time)
      formDataToSend.append('closing_time', formData.closing_time)
      
      if (logoFile) {
        formDataToSend.append('logo', logoFile)
      }
      
      const response = await api.put(`/restaurants/${restaurant.id}/update/`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        toast.success('Restaurant updated successfully!')
        onUpdate()
        onClose()
      } else {
        toast.error(response.data.message || 'Update failed')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return
    
    setLoading(true)
    try {
      const response = await api.delete(`/restaurants/${restaurant.id}/delete/`)
      if (response.data.success) {
        toast.success('Restaurant deleted successfully!')
        onUpdate()
        onClose()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed')
    } finally {
      setLoading(false)
    }
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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-white">Manage Restaurant</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Logo</label>
            <div className="flex items-center gap-4">
              <div 
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#E63946] transition group overflow-hidden bg-gray-50 hover:bg-red-50"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1 group-hover:text-[#E63946] transition" />
                    <span className="text-xs text-gray-500">Upload Logo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Upload a logo for your restaurant</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine *</label>
              <input
                type="text"
                required
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.delivery_charge}
                onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.minimum_order_amount}
                onChange={(e) => setFormData({ ...formData, minimum_order_amount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
              <input
                type="time"
                value={formData.opening_time}
                onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
              <input
                type="time"
                value={formData.closing_time}
                onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium"
            >
              Delete
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#E63946] to-[#C62828] text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Add Restaurant Modal Component
const AddRestaurantModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    cuisine_type: '',
    city: '',
    delivery_charge: '',
    minimum_order_amount: '',
    phone_number: '',
    email: '',
    address_line1: '',
    opening_time: '09:00',
    closing_time: '22:00',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('cuisine_type', formData.cuisine_type)
      formDataToSend.append('city', formData.city)
      formDataToSend.append('delivery_charge', formData.delivery_charge)
      formDataToSend.append('minimum_order_amount', formData.minimum_order_amount)
      formDataToSend.append('phone_number', formData.phone_number)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('address_line1', formData.address_line1)
      formDataToSend.append('opening_time', formData.opening_time)
      formDataToSend.append('closing_time', formData.closing_time)
      
      if (logoFile) {
        formDataToSend.append('logo', logoFile)
      }
      
      const response = await api.post('/restaurants/create/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        toast.success('Restaurant added successfully!')
        onSuccess()
        onClose()
      } else {
        toast.error(response.data.message || 'Failed to add restaurant')
      }
    } catch (error: any) {
      console.error('Error adding restaurant:', error)
      toast.error(error.response?.data?.message || 'Failed to add restaurant')
    } finally {
      setLoading(false)
    }
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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-white">Add New Restaurant</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Logo</label>
            <div className="flex items-center gap-4">
              <div 
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#E63946] transition group overflow-hidden bg-gray-50 hover:bg-red-50"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1 group-hover:text-[#E63946] transition" />
                    <span className="text-xs text-gray-500">Upload Logo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Upload a logo for your restaurant</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              placeholder="e.g., Pizza Palace"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type *</label>
              <input
                type="text"
                required
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
                placeholder="e.g., Italian"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
                placeholder="e.g., New York"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.delivery_charge}
                onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
                placeholder="2.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.minimum_order_amount}
                onChange={(e) => setFormData({ ...formData, minimum_order_amount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
                placeholder="10.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
              <input
                type="time"
                value={formData.opening_time}
                onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
              <input
                type="time"
                value={formData.closing_time}
                onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              placeholder="restaurant@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              rows={2}
              placeholder="Enter full address"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#E63946] to-[#C62828] text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Restaurant'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export const RestaurantsPage = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  
  const { data: restaurants = [], isLoading, error, refetch } = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
    initialData: [],
    staleTime: 30000,
  })

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isVendor = user?.role === 'VENDOR'
  const canManage = isAdmin || isVendor

  const handleViewMenu = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setShowMenuModal(true)
  }

  const handleManage = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setShowManageModal(true)
  }

  const handleRefresh = () => {
    refetch()
    toast.success('Restaurant list refreshed')
  }

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = 
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Restaurant statistics
  const restaurantStats = {
    total: restaurants.length,
    active: restaurants.filter(r => r.is_active).length,
    avgRating: restaurants.reduce((acc, r) => acc + toNumber(r.rating), 0) / (restaurants.length || 1),
    cities: new Set(restaurants.map(r => r.city)).size,
  }

  const renderStars = (rating: number | string) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading restaurants...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center m-6">
        <p className="text-red-600 mb-4">Failed to load restaurants</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition">
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Restaurants</h1>
                <p className="text-white/80">Browse and manage all partner restaurants</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                {canManage && (
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E63946] rounded-lg hover:bg-[#C62828] transition shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Restaurant
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Total Restaurants</p>
              <p className="text-2xl font-bold text-gray-800">{restaurantStats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-emerald-600">{restaurantStats.active}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-amber-500">{restaurantStats.avgRating.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Cities</p>
              <p className="text-2xl font-bold text-blue-600">{restaurantStats.cities}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, cuisine, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
              />
            </div>
          </div>

          {/* Restaurants Grid */}
          {filteredRestaurants.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Store className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search' : 'Click "Add Restaurant" to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      {/* Restaurant Image */}
                      <div className="flex-shrink-0 relative">
                        <img
                          src={getRestaurantImage(restaurant)}
                          alt={restaurant.name}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultImage
                          }}
                        />
                        {restaurant.is_active && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-lg">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Restaurant Info */}
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-sm px-3 py-1 bg-red-50 text-[#E63946] rounded-full font-medium">
                                {restaurant.cuisine_type}
                              </span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></span>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{restaurant.city}</span>
                              </div>
                              {restaurant.status && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  restaurant.status === 'ACTIVE' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {restaurant.status}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              {renderStars(restaurant.rating)}
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                                <span>${toNumber(restaurant.delivery_charge).toFixed(2)} delivery</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>30-45 min</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {canManage && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleViewMenu(restaurant)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                              >
                                <Eye className="w-4 h-4" />
                                Menu
                              </button>
                              <button
                                onClick={() => handleManage(restaurant)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                              >
                                <Edit className="w-4 h-4" />
                                Manage
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm text-gray-600">
                              {restaurant.total_orders || 0} orders
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-gray-600">
                              ${(restaurant.total_revenue || 0).toLocaleString()} revenue
                            </span>
                          </div>
                          {restaurant.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{restaurant.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddRestaurantModal 
            onClose={() => setShowAddModal(false)} 
            onSuccess={() => refetch()} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenuModal && selectedRestaurant && (
          <MenuModal 
            restaurant={selectedRestaurant} 
            onClose={() => setShowMenuModal(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showManageModal && selectedRestaurant && (
          <ManageModal 
            restaurant={selectedRestaurant} 
            onClose={() => setShowManageModal(false)} 
            onUpdate={() => refetch()}
          />
        )}
      </AnimatePresence>
    </>
  )
}