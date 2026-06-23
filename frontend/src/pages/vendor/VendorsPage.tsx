import { useState,useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Eye, Mail, Phone, Star, Clock, RefreshCw, UserPlus, Calendar, 
  DollarSign, ShoppingBag, Store, Activity, CheckCircle, 
  Edit, MoreVertical, Filter, TrendingUp, X, Trash2,
  MapPin, Building, Award, AlertCircle, UserCheck, UserX,
  UtensilsCrossed, Package, ChevronLeft, ChevronRight
} from 'lucide-react'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'

interface Vendor {
  id: string
  business_name: string
  user_details?: {
    full_name: string
    email: string
    mobile_number?: string
  }
  email?: string
  phone_number?: string
  city: string
  state: string
  status: string
  rating: number | string
  total_revenue: number
  total_orders: number
  joined_date: string
  is_active?: boolean
  is_verified?: boolean
  restaurants?: Array<{
    id: string
    name: string
    cuisine_type: string
    is_active: boolean
  }>
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

// Restaurant Menu Modal
const RestaurantMenuModal = ({ 
  restaurant, 
  onClose 
}: { 
  restaurant: { id: string; name: string; cuisine_type: string } | null; 
  onClose: () => void 
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

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
        setMenuItems(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...new Set(menuItems.map(item => item.category))].filter(Boolean)
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  const formatPrice = (price: number | string) => {
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
          <div>
            <h2 className="text-xl font-bold">{restaurant.name}</h2>
            <p className="text-white/70 text-sm">{restaurant.cuisine_type}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Categories */}
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
              <p className="text-gray-500 mt-2">Loading menu...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No menu items available</p>
              <p className="text-sm text-gray-400">This restaurant hasn't added any items yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
                const isAvailable = item.is_available !== false
                
                return (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          {!isAvailable && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Unavailable</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="font-bold text-[#E63946]">₹{formatPrice(price)}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{item.preparation_time || 15} min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {isAvailable ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Available</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Unavailable</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">No items in this category</div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Vendor Details Modal
const VendorDetailsModal = ({ vendor, onClose, onViewMenu }: { vendor: Vendor | null; onClose: () => void; onViewMenu?: (restaurant: { id: string; name: string; cuisine_type: string }) => void }) => {
  if (!vendor) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatRating = (rating: any) => {
    if (!rating) return '0'
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating
    return isNaN(numRating) ? '0' : numRating.toFixed(1)
  }

  const getStatusBadge = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED':
        return { text: 'Active', className: 'bg-green-100 text-green-700' }
      case 'PENDING':
        return { text: 'Pending', className: 'bg-yellow-100 text-yellow-700' }
      case 'REJECTED':
        return { text: 'Rejected', className: 'bg-red-100 text-red-700' }
      case 'SUSPENDED':
        return { text: 'Suspended', className: 'bg-orange-100 text-orange-700' }
      default:
        return { text: status || 'Unknown', className: 'bg-gray-100 text-gray-700' }
    }
  }

  const statusInfo = getStatusBadge(vendor.status)

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
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {vendor.business_name?.charAt(0) || 'V'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{vendor.business_name}</h2>
              <p className="text-white/70 text-sm">{vendor.city}, {vendor.state}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">{vendor.total_orders || 0}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border border-emerald-200">
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(vendor.total_revenue || 0)}</p>
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-200">
              <p className="text-2xl font-bold text-amber-600">
                <Star className="w-5 h-5 inline fill-current text-amber-500" />
                {formatRating(vendor.rating)}
              </p>
              <p className="text-xs text-gray-500">Average Rating</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">
                {vendor.is_verified ? '✓' : '⏳'}
              </p>
              <p className="text-xs text-gray-500">{vendor.is_verified ? 'Verified' : 'Unverified'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#E63946]" />
                Business Information
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Business Name:</span> <span className="font-medium">{vendor.business_name}</span></p>
                <p><span className="text-gray-500">Location:</span> <span className="font-medium">{vendor.city}, {vendor.state}</span></p>
                <p><span className="text-gray-500">Joined:</span> <span className="font-medium">{formatDate(vendor.joined_date)}</span></p>
                <p><span className="text-gray-500">Status:</span> 
                  <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#E63946]" />
                Contact Information
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Email:</span> <span className="font-medium">{vendor.email || vendor.user_details?.email || 'N/A'}</span></p>
                <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{vendor.phone_number || vendor.user_details?.mobile_number || 'N/A'}</span></p>
              </div>
            </div>
          </div>

          {/* Restaurants List */}
          {vendor.restaurants && vendor.restaurants.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Store className="w-4 h-4 text-[#E63946]" />
                Restaurants ({vendor.restaurants.length})
              </h4>
              <div className="space-y-2">
                {vendor.restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition">
                    <div>
                      <p className="font-medium text-gray-700">{restaurant.name}</p>
                      <p className="text-xs text-gray-500">{restaurant.cuisine_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${restaurant.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {restaurant.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => onViewMenu?.(restaurant)}
                        className="px-3 py-1 bg-[#E63946] text-white rounded-lg text-xs hover:bg-[#C62828] transition flex items-center gap-1"
                      >
                        <UtensilsCrossed className="w-3 h-3" />
                        View Menu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Manage Vendor Modal
const ManageVendorModal = ({ vendor, onClose, onUpdate }: { vendor: Vendor | null; onClose: () => void; onUpdate: () => void }) => {
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'approve' | 'suspend' | 'reject' | 'delete' | null>(null)

  const handleAction = async () => {
    if (!vendor) return
    setLoading(true)
    
    try {
      let response
      if (action === 'delete') {
        response = await api.delete(`/vendors/${vendor.id}/`)
      } else {
        const statusMap = {
          approve: 'APPROVED',
          suspend: 'SUSPENDED',
          reject: 'REJECTED'
        }
        response = await api.patch(`/vendors/${vendor.id}/`, {
          status: statusMap[action as keyof typeof statusMap]
        })
      }
      
      if (response.data.success || response.status === 200) {
        toast.success(action === 'delete' ? 'Vendor deleted successfully!' : `Vendor ${action}d successfully!`)
        onUpdate()
        onClose()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  if (!vendor) return null

  const isPending = vendor.status?.toUpperCase() === 'PENDING'
  const isApproved = vendor.status?.toUpperCase() === 'APPROVED'
  const isSuspended = vendor.status?.toUpperCase() === 'SUSPENDED'

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
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-white">Manage Vendor</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center text-white font-bold text-xl">
              {vendor.business_name?.charAt(0) || 'V'}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{vendor.business_name}</p>
              <p className="text-sm text-gray-500">{vendor.city}, {vendor.state}</p>
            </div>
          </div>

          <div className="space-y-3">
            {isPending && (
              <>
                <button
                  onClick={() => { setAction('approve'); handleAction() }}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Vendor
                </button>
                <button
                  onClick={() => { setAction('reject'); handleAction() }}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject Vendor
                </button>
              </>
            )}
            
            {isApproved && (
              <button
                onClick={() => { setAction('suspend'); handleAction() }}
                disabled={loading}
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Suspend Vendor
              </button>
            )}
            
            {isSuspended && (
              <button
                onClick={() => { setAction('approve'); handleAction() }}
                disabled={loading}
                className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Reactivate Vendor
              </button>
            )}

            <button
              onClick={() => { setAction('delete'); handleAction() }}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Vendor
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Current Status: <span className="font-medium">{vendor.status || 'Unknown'}</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export const VendorsPage = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string; cuisine_type: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const navigate = useNavigate()

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  
  const { data: vendorsData = [], isLoading, refetch } = useQuery({
    queryKey: ['vendors', statusFilter],
    queryFn: async () => {
      try {
        let url = '/vendors/'
        if (statusFilter !== 'all') {
          url += `?status=${statusFilter.toUpperCase()}`
        }
        const response = await api.get(url)
        console.log('Vendors API response:', response.data)
        
        if (response.data?.results?.data) {
          return response.data.results.data
        }
        if (response.data?.results && Array.isArray(response.data.results)) {
          return response.data.results
        }
        if (response.data?.data && Array.isArray(response.data.data)) {
          return response.data.data
        }
        if (Array.isArray(response.data)) {
          return response.data
        }
        return []
      } catch (error) {
        console.error('Error fetching vendors:', error)
        return []
      }
    },
  })

  const vendors = Array.isArray(vendorsData) ? vendorsData : []

  const { data: stats } = useQuery({
    queryKey: ['vendor-stats'],
    queryFn: async () => {
      try {
        const response = await api.get('/vendors/stats/')
        console.log('Vendor stats response:', response.data)
        return response.data?.data || {}
      } catch (error) {
        console.error('Error fetching vendor stats:', error)
        return {}
      }
    },
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const getStatusBadge = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED':
        return { text: 'Active', className: 'bg-green-100 text-green-700' }
      case 'PENDING':
        return { text: 'Pending', className: 'bg-yellow-100 text-yellow-700' }
      case 'REJECTED':
        return { text: 'Rejected', className: 'bg-red-100 text-red-700' }
      case 'SUSPENDED':
        return { text: 'Suspended', className: 'bg-orange-100 text-orange-700' }
      default:
        return { text: status || 'Unknown', className: 'bg-gray-100 text-gray-700' }
    }
  }

  const formatRating = (rating: any) => {
    if (!rating) return '0'
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating
    return isNaN(numRating) ? '0' : numRating.toFixed(1)
  }

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setShowDetailsModal(true)
  }

  const handleViewMenu = (restaurant: { id: string; name: string; cuisine_type: string }) => {
    setSelectedRestaurant(restaurant)
    setShowMenuModal(true)
  }

  const handleManage = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setShowManageModal(true)
  }

  const filteredVendors = vendors.filter((vendor: Vendor) => {
    const matchesSearch = 
      vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.user_details?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.city?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage)
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate stats from vendors if API fails
  const calculatedStats = {
    total_vendors: vendors.length,
    active_vendors: vendors.filter(v => v.status === 'APPROVED').length,
    pending_vendors: vendors.filter(v => v.status === 'PENDING').length,
    total_revenue: vendors.reduce((sum, v) => sum + (v.total_revenue || 0), 0),
    total_orders: vendors.reduce((sum, v) => sum + (v.total_orders || 0), 0),
    average_rating: vendors.reduce((sum, v) => {
      const rating = typeof v.rating === 'string' ? parseFloat(v.rating) : (v.rating || 0)
      return sum + rating
    }, 0) / (vendors.length || 1),
  }

  const displayStats = stats?.total_vendors ? stats : calculatedStats

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading vendors...</p>
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
              <h1 className="text-3xl font-bold mb-2">Vendors</h1>
              <p className="text-white/80">Manage and analyze all registered vendors and partners</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              {isAdmin && (
                <button className="flex items-center gap-2 px-4 py-2 bg-[#E63946] rounded-lg hover:bg-[#C62828] transition shadow-lg">
                  <UserPlus className="w-4 h-4" />
                  Add Vendor
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-800">{displayStats.total_vendors}</p>
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
                <p className="text-2xl font-bold text-emerald-600">{displayStats.active_vendors}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{displayStats.pending_vendors}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Orders</p>
                <p className="text-2xl font-bold text-purple-600">{displayStats.total_orders?.toLocaleString() || '0'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(displayStats.total_revenue || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Rating</p>
                <p className="text-2xl font-bold text-amber-600">{displayStats.average_rating?.toFixed(1) || '0'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by business name, email or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
            >
              <option value="all">All Vendors</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedVendors.map((vendor: Vendor, index: number) => {
                  const statusInfo = getStatusBadge(vendor.status)
                  const contactEmail = vendor.email || vendor.user_details?.email || 'N/A'
                  const contactPhone = vendor.phone_number || vendor.user_details?.mobile_number || 'N/A'
                  const ratingValue = formatRating(vendor.rating)
                  
                  return (
                    <motion.tr
                      key={vendor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {vendor.business_name?.charAt(0) || 'V'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{vendor.business_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">ID: {vendor.id?.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3 text-[#E63946]" />
                            <span className="text-xs">{contactEmail}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3 text-[#E63946]" />
                            <span className="text-xs">{contactPhone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{vendor.city}, {vendor.state}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{vendor.total_orders || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-emerald-600">{formatCurrency(vendor.total_revenue || 0)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="font-medium">{ratingValue}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewDetails(vendor)}
                            className="p-1.5 text-[#1D3557] hover:bg-[#1D3557]/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => handleManage(vendor)}
                              className="p-1.5 text-[#E63946] hover:bg-[#E63946]/10 rounded-lg transition-colors"
                              title="Manage"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredVendors.length === 0 && (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No vendors found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVendors.length)} of {filteredVendors.length} vendors
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentPage === pageNum
                          ? 'bg-[#E63946] text-white shadow-md'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetailsModal && selectedVendor && (
          <VendorDetailsModal 
            vendor={selectedVendor} 
            onClose={() => setShowDetailsModal(false)} 
            onViewMenu={handleViewMenu}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenuModal && selectedRestaurant && (
          <RestaurantMenuModal 
            restaurant={selectedRestaurant} 
            onClose={() => setShowMenuModal(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showManageModal && selectedVendor && (
          <ManageVendorModal 
            vendor={selectedVendor} 
            onClose={() => setShowManageModal(false)} 
            onUpdate={() => refetch()}
          />
        )}
      </AnimatePresence>
    </div>
  )
}