import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Star, MapPin, Clock, DollarSign, RefreshCw,
  ShoppingBag, Store, Plus, Eye, Edit, Trash2, X,
  Phone, Mail, TrendingUp, Award, Package, Upload, Camera,
  UtensilsCrossed, CheckCircle, AlertCircle, Image as ImageIcon,
  ChevronRight, Calendar, Users, BarChart3
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'

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
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
  is_available: boolean
  preparation_time: number
}

const toNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

const formatPrice = (price: any): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
}

// Menu Modal Component
const MenuModal = ({ restaurant, onClose, onUpdate }: { restaurant: Restaurant; onClose: () => void; onUpdate: () => void }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    preparation_time: '15'
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  useEffect(() => {
    fetchMenuItems()
  }, [restaurant.id])

  const fetchMenuItems = async (): Promise<void> => {
    setLoading(true)
    try {
      let items: MenuItem[] = []
      
      // Try multiple endpoints to find menu items
      try {
        const response = await api.get(`/restaurants/${restaurant.id}/`)
        if (response.data.menu_items) {
          items = response.data.menu_items
        } else if (response.data.data?.menu_items) {
          items = response.data.data.menu_items
        } else if (response.data.items) {
          items = response.data.items
        }
      } catch (e) {
        console.log('Could not fetch from detail endpoint')
      }
      
      // If no items found, try the menu endpoint
      if (items.length === 0) {
        try {
          const menuResponse = await api.get(`/restaurants/${restaurant.id}/menu/`)
          if (menuResponse.data.success) {
            items = menuResponse.data.data || []
          } else if (Array.isArray(menuResponse.data)) {
            items = menuResponse.data
          }
        } catch (e) {
          console.log('Menu endpoint not found')
        }
      }
      
      // Try categories endpoint as last resort
      if (items.length === 0) {
        try {
          const catResponse = await api.get(`/restaurants/${restaurant.id}/categories/`)
          if (catResponse.data.success) {
            const categories = catResponse.data.data || []
            categories.forEach((cat: any) => {
              if (cat.items) {
                items = [...items, ...cat.items]
              }
            })
          }
        } catch (e) {
          console.log('Categories endpoint not found')
        }
      }
      
      setMenuItems(items)
    } catch (error) {
      console.error('Error fetching menu:', error)
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddMenuItem = async (): Promise<void> => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error('Please fill all required fields')
      return
    }

    setAdding(true)
    try {
      const response = await api.post(`/restaurants/${restaurant.id}/menu/create/`, {
        name: newItem.name,
        price: parseFloat(newItem.price),
        category: newItem.category,
        description: newItem.description || '',
        preparation_time: parseInt(newItem.preparation_time) || 15,
        is_available: true,
        is_veg: false,
        is_recommended: false
      })

      if (response.data.success) {
        toast.success('Menu item added successfully')
        setNewItem({ name: '', price: '', category: '', description: '', preparation_time: '15' })
        setShowAddForm(false)
        fetchMenuItems()
        onUpdate()
      } else {
        toast.error(response.data.message || 'Failed to add menu item')
      }
    } catch (error: any) {
      console.error('Error adding menu item:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.errors || 'Failed to add menu item'
      toast.error(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage)
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteMenuItem = async (itemId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this menu item?')) return
    
    try {
      const response = await api.delete(`/restaurants/${restaurant.id}/menu/${itemId}/delete/`)
      if (response.data.success) {
        toast.success('Menu item deleted')
        fetchMenuItems()
        onUpdate()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete menu item')
    }
  }

  const categories: string[] = ['All', ...new Set(menuItems.map(item => item.category))].filter(Boolean)
  const filteredItems: MenuItem[] = selectedCategory === 'All' 
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
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              <img src={restaurant.logo_url} alt={restaurant.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <UtensilsCrossed className="w-6 h-6" />
            )}
            <div>
              <h2 className="text-xl font-bold">{restaurant.name}</h2>
              <p className="text-white/70 text-sm">{restaurant.cuisine_type} • {restaurant.city}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-[#E63946]" />
              <h3 className="font-semibold text-gray-800">Menu Items</h3>
              <span className="text-sm text-gray-400">({filteredItems.length})</span>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white rounded-lg text-sm hover:bg-[#C62828] transition shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <h4 className="font-medium text-gray-800 mb-3">New Menu Item</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Item name *"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price *"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                />
                <input
                  type="text"
                  placeholder="Category *"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                />
                <input
                  type="number"
                  placeholder="Prep time (min)"
                  value={newItem.preparation_time}
                  onChange={(e) => setNewItem({ ...newItem, preparation_time: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                />
                <textarea
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMenuItem}
                  disabled={adding}
                  className="px-4 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
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

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No menu items available</p>
              <p className="text-sm text-gray-400">Click "Add Item" to create your first menu item</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-600">{item.category || 'Uncategorized'}</span>
                      {item.is_available ? (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Available</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Unavailable</span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Prep: {item.preparation_time || 15} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#E63946]">₹{formatPrice(item.price)}</p>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition hover:underline"
                    >
                      Delete
                    </button>
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

// Manage Restaurant Modal with Logo Upload
const ManageRestaurantModal = ({ restaurant, onClose, onUpdate }: { restaurant: Restaurant; onClose: () => void; onUpdate: () => void }) => {
  const [formData, setFormData] = useState({
    name: restaurant.name,
    cuisine_type: restaurant.cuisine_type,
    city: restaurant.city,
    delivery_charge: toNumber(restaurant.delivery_charge).toString(),
    minimum_order_amount: toNumber(restaurant.minimum_order_amount).toString(),
    phone_number: restaurant.phone_number || '',
    email: restaurant.email || '',
    address_line1: restaurant.address_line1 || '',
    opening_time: restaurant.opening_time || '10:00',
    closing_time: restaurant.closing_time || '23:00',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(restaurant.logo_url || null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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

  const handleDelete = async (): Promise<void> => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) return
    
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
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-xl font-bold">Manage Restaurant</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Logo Upload Section */}
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
                <p className="text-sm text-gray-600">Upload a logo for your restaurant</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG</p>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-xs text-red-500 mt-1 hover:underline"
                  >
                    Remove logo
                  </button>
                )}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (₹)</label>
              <input
                type="number"
                step="1"
                value={formData.delivery_charge}
                onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (₹)</label>
              <input
                type="number"
                step="1"
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
              Delete Restaurant
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

// Add Restaurant Modal with Logo Upload
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
    opening_time: '10:00',
    closing_time: '23:00',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-xl font-bold">Add New Restaurant</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Logo Upload Section */}
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
                <p className="text-sm text-gray-600">Upload a logo for your restaurant</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG</p>
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
              placeholder="e.g., Spice Garden"
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
                placeholder="e.g., Indian"
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
                placeholder="e.g., Mumbai"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (₹)</label>
              <input
                type="number"
                step="1"
                value={formData.delivery_charge}
                onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
                placeholder="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (₹)</label>
              <input
                type="number"
                step="1"
                value={formData.minimum_order_amount}
                onChange={(e) => setFormData({ ...formData, minimum_order_amount: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition"
                placeholder="199"
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
              placeholder="+91 98765 43210"
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

// Main Component
export const VendorRestaurantsPage = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [showMenuModal, setShowMenuModal] = useState<boolean>(false)
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  
  const { data: restaurants = [], isLoading, refetch } = useQuery<Restaurant[]>({
    queryKey: ['vendor-restaurants'],
    queryFn: async (): Promise<Restaurant[]> => {
      const response = await api.get('/restaurants/')
      let restaurantsList: Restaurant[] = []
      if (Array.isArray(response.data)) {
        restaurantsList = response.data
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        restaurantsList = response.data.results
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        restaurantsList = response.data.data
      }
      return restaurantsList
    },
  })

  const totalOrders: number = restaurants.reduce((sum: number, r: Restaurant) => sum + (r.total_orders || 0), 0)
  const totalRevenue: number = restaurants.reduce((sum: number, r: Restaurant) => sum + (r.total_revenue || 0), 0)
  const totalRating: number = restaurants.reduce((sum: number, r: Restaurant) => sum + toNumber(r.rating), 0)
  const averageRating: string = restaurants.length > 0 ? (totalRating / restaurants.length).toFixed(1) : '0'
  const activeCount: number = restaurants.filter((r: Restaurant) => r.is_active).length

  const filteredRestaurants: Restaurant[] = restaurants.filter((restaurant: Restaurant) => {
    const matchesSearch: boolean = 
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleViewMenu = (restaurant: Restaurant): void => {
    setSelectedRestaurant(restaurant)
    setShowMenuModal(true)
  }

  const handleManage = (restaurant: Restaurant): void => {
    setSelectedRestaurant(restaurant)
    setShowManageModal(true)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const renderStars = (rating: number | string): JSX.Element => {
    const ratingNum: number = toNumber(rating)
    const fullStars: number = Math.floor(ratingNum)
    
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

  const getLogoUrl = (restaurant: Restaurant): string | null => {
    if (restaurant.logo_url) {
      if (restaurant.logo_url.startsWith('http')) {
        return restaurant.logo_url
      }
      if (restaurant.logo_url.startsWith('/media/')) {
        return `http://localhost:8000${restaurant.logo_url}`
      }
      return `http://localhost:8000/media/${restaurant.logo_url}`
    }
    return null
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Restaurants</h1>
              <p className="text-white/80">Manage your restaurant locations and track performance</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#E63946] rounded-lg hover:bg-[#C62828] transition shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Restaurant
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-800">{restaurants.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#1D3557]/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-[#1D3557]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-purple-600">{totalOrders.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-2xl font-bold text-amber-500">{averageRating}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants by name, cuisine, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
            />
          </div>
        </div>

        {/* Restaurants List */}
        {filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 text-center py-16">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Add your first restaurant to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Your First Restaurant
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant: Restaurant, index: number) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    {/* Restaurant Logo */}
                    <div className="flex-shrink-0 relative">
                      {getLogoUrl(restaurant) ? (
                        <img
                          src={getLogoUrl(restaurant)!}
                          alt={restaurant.name}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="32" fill="%239ca3af"%3E🏪%3C/text%3E%3C/svg%3E'
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#1D3557]/10 to-[#457B9D]/10 flex items-center justify-center border border-gray-200">
                          <Store className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
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
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            {renderStars(restaurant.rating)}
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                              <span>₹{toNumber(restaurant.delivery_charge).toFixed(2)} delivery</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{restaurant.opening_time || '10:00'} - {restaurant.closing_time || '23:00'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
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
                            {formatCurrency(restaurant.total_revenue || 0)} revenue
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

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddRestaurantModal onClose={() => setShowAddModal(false)} onSuccess={() => refetch()} />
        )}
        {showMenuModal && selectedRestaurant && (
          <MenuModal 
            restaurant={selectedRestaurant} 
            onClose={() => setShowMenuModal(false)} 
            onUpdate={() => refetch()}
          />
        )}
        {showManageModal && selectedRestaurant && (
          <ManageRestaurantModal 
            restaurant={selectedRestaurant} 
            onClose={() => setShowManageModal(false)} 
            onUpdate={() => refetch()}
          />
        )}
      </AnimatePresence>
    </div>
  )
}