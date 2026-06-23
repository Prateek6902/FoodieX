import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Eye, Mail, Phone, Star, RefreshCw, UserPlus, Calendar, 
  DollarSign, ShoppingBag, Users, Activity, CheckCircle, 
  Edit, Filter, TrendingUp, X, Trash2,
  UserCheck, UserX, AlertCircle, Clock, Shield, Lock,
  ChevronLeft, ChevronRight, MapPin, Award
} from 'lucide-react'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'

interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  mobile_number: string
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  total_orders: number
  total_spent: number
  addresses?: Array<{
    id: string
    address_line1: string
    city: string
    state: string
    postal_code: string
    is_default: boolean
  }>
  last_order_date?: string
  favorite_restaurant?: string
}

interface CustomerStats {
  total_customers: number
  active_customers: number
  verified_customers: number
  total_orders: number
  total_revenue: number
  new_customers_30d: number
}

// Customer Details Modal
const CustomerDetailsModal = ({ customer, onClose, onUpdate }: { customer: Customer | null; onClose: () => void; onUpdate?: () => void }) => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (!customer) return null

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

  const handleViewOrders = () => {
    navigate(`/orders?customer=${customer.id}`)
    onClose()
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
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {customer.full_name?.charAt(0) || customer.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{customer.full_name}</h2>
              <p className="text-white/70 text-sm">{customer.email}</p>
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
              <p className="text-2xl font-bold text-purple-600">{customer.total_orders || 0}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border border-emerald-200">
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(customer.total_spent || 0)}</p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{customer.is_verified ? '✓' : '⏳'}</p>
              <p className="text-xs text-gray-500">{customer.is_verified ? 'Verified' : 'Unverified'}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-200">
              <p className="text-2xl font-bold text-amber-600">{customer.is_active ? 'Active' : 'Inactive'}</p>
              <p className="text-xs text-gray-500">Status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#E63946]" />
                Personal Information
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Full Name:</span> <span className="font-medium">{customer.full_name || 'N/A'}</span></p>
                <p><span className="text-gray-500">Email:</span> <span className="font-medium">{customer.email}</span></p>
                <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{customer.mobile_number || 'N/A'}</span></p>
                <p><span className="text-gray-500">Role:</span> <span className="font-medium capitalize">{customer.role}</span></p>
                <p><span className="text-gray-500">Joined:</span> <span className="font-medium">{formatDate(customer.created_at)}</span></p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E63946]" />
                Addresses
              </h4>
              <div className="space-y-2 text-sm">
                {customer.addresses && customer.addresses.length > 0 ? (
                  customer.addresses.map((addr, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-gray-100">
                      <p className="font-medium text-gray-700">{addr.address_line1}</p>
                      <p className="text-gray-500 text-xs">{addr.city}, {addr.state} - {addr.postal_code}</p>
                      {addr.is_default && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No addresses saved</p>
                )}
              </div>
            </div>
          </div>

          {customer.favorite_restaurant && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Favorite Restaurant
              </h4>
              <p className="text-gray-700">{customer.favorite_restaurant}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Close
            </button>
            <button
              onClick={handleViewOrders}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              View Orders
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Manage Customer Modal
const ManageCustomerModal = ({ customer, onClose, onUpdate }: { customer: Customer | null; onClose: () => void; onUpdate: () => void }) => {
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null)

  const handleAction = async () => {
    if (!customer) return
    setLoading(true)
    
    try {
      let response
      if (action === 'delete') {
        response = await api.delete(`/users/${customer.id}/`)
      } else {
        response = await api.patch(`/users/${customer.id}/`, {
          is_active: action === 'activate'
        })
      }
      
      if (response.data.success || response.status === 200 || response.status === 204) {
        toast.success(action === 'delete' ? 'Customer deleted successfully!' : `Customer ${action === 'activate' ? 'activated' : 'deactivated'} successfully!`)
        onUpdate()
        onClose()
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('You don\'t have permission to perform this action')
      } else {
        toast.error(error.response?.data?.message || 'Action failed')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!customer) return null

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
          <h2 className="text-xl font-bold text-white">Manage Customer</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center text-white font-bold text-xl">
              {customer.full_name?.charAt(0) || customer.email?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{customer.full_name}</p>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => { setAction('activate'); handleAction() }}
              disabled={loading || customer.is_active}
              className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Activate Account
            </button>
            <button
              onClick={() => { setAction('deactivate'); handleAction() }}
              disabled={loading || !customer.is_active}
              className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserX className="w-4 h-4" />
              Deactivate Account
            </button>
            <button
              onClick={() => { setAction('delete'); handleAction() }}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Customer
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            {customer.is_active ? 'Customer is currently active' : 'Customer is currently inactive'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export const CustomersPage = () => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const itemsPerPage = 10

  // Check if user is admin or super admin
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isVendor = user?.role === 'VENDOR'
  const canManage = isAdmin || isVendor

  // Fetch all customers - removed pagination limit
  const { 
    data: customers = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Customer[]>({
    queryKey: ['customers', statusFilter, searchTerm],
    queryFn: async () => {
      try {
        let url = '/users/?role=customer'
        if (statusFilter === 'active') {
          url += '&is_active=true'
        } else if (statusFilter === 'inactive') {
          url += '&is_active=false'
        } else if (statusFilter === 'verified') {
          url += '&is_verified=true'
        }
        // Add limit to get all customers
        url += '&limit=1000'
        
        const response = await api.get(url)
        console.log('Customers API response:', response.data)
        
        let customerData = []
        if (response.data?.results) {
          customerData = response.data.results
        } else if (response.data?.data) {
          customerData = response.data.data
        } else if (Array.isArray(response.data)) {
          customerData = response.data
        }
        
        setAllCustomers(customerData)
        return customerData
      } catch (error) {
        console.error('Error fetching customers:', error)
        return []
      }
    },
    enabled: isAdmin,
  })

  // Fetch customer stats
  const { 
    data: stats, 
    refetch: refetchStats 
  } = useQuery<CustomerStats>({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      try {
        const response = await api.get('/users/customers/stats/')
        return response.data?.data || {}
      } catch (error) {
        console.error('Error fetching stats:', error)
        return {}
      }
    },
    enabled: isAdmin,
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

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetailsModal(true)
  }

  const handleManage = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowManageModal(true)
  }

  // Use allCustomers instead of customers for filtering
  const filteredCustomers = allCustomers.filter((customer: Customer) => {
    const matchesSearch = 
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile_number?.includes(searchTerm)
    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // If not admin or vendor, show access denied
  if (!isAdmin && !isVendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to view this page. This section is only available for administrators.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-2 bg-[#1D3557] text-white rounded-lg hover:bg-[#457B9D] transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading customers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to Load Customers</h3>
          <p className="text-gray-500 mb-4">There was an error loading the customer data. Please try again.</p>
          <button 
            onClick={() => { refetch(); refetchStats(); }}
            className="px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
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
              <h1 className="text-3xl font-bold mb-2">Customers</h1>
              <p className="text-white/80">Manage and analyze all registered customers</p>
              <p className="text-sm text-white/60 mt-1">Total: {allCustomers.length} customers</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  refetch()
                  refetchStats()
                  toast.success('Refreshed!')
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              {isAdmin && (
                <button className="flex items-center gap-2 px-4 py-2 bg-[#E63946] rounded-lg hover:bg-[#C62828] transition shadow-lg">
                  <UserPlus className="w-4 h-4" />
                  Add Customer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {isAdmin && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{allCustomers.length}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#1D3557]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#1D3557]" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-emerald-600">{allCustomers.filter(c => c.is_active).length}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Verified</p>
                  <p className="text-2xl font-bold text-blue-600">{allCustomers.filter(c => c.is_verified).length}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Orders</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.total_orders?.toLocaleString() || '0'}</p>
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
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.total_revenue || 0)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New (30d)</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.new_customers_30d || '0'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
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
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCustomers.map((customer: Customer, index: number) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(customer)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {customer.full_name?.charAt(0) || customer.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{customer.full_name || 'N/A'}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-xs text-gray-500">4.5</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-3 h-3 text-[#E63946]" />
                          <span className="text-xs">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3 text-[#E63946]" />
                          <span className="text-xs">{customer.mobile_number || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{customer.total_orders || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-emerald-600">{formatCurrency(customer.total_spent || 0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{formatDate(customer.created_at)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          customer.is_active 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {customer.is_verified && (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleViewDetails(customer)}
                          className="p-1.5 text-[#1D3557] hover:bg-[#1D3557]/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <button 
                            onClick={() => handleManage(customer)}
                            className="p-1.5 text-[#E63946] hover:bg-[#E63946]/10 rounded-lg transition-colors"
                            title="Manage"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No customers found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
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
        {showDetailsModal && selectedCustomer && (
          <CustomerDetailsModal 
            customer={selectedCustomer} 
            onClose={() => setShowDetailsModal(false)}
            onUpdate={() => {
              refetch()
              refetchStats()
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showManageModal && selectedCustomer && (
          <ManageCustomerModal 
            customer={selectedCustomer} 
            onClose={() => setShowManageModal(false)} 
            onUpdate={() => {
              refetch()
              refetchStats()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}