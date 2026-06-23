import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Eye, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  User,
  Receipt,
  Package,
  DollarSign,
  Calendar,
  Store,
  Printer,
  X,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  BarChart3
} from 'lucide-react'
import api from '../../services/api'

// Import real restaurant logos
import pizzaPalaceLogo from '../../assets/restaurants/pizza-palace.png'
import burgerHouseLogo from '../../assets/restaurants/burger-house.png'
import sushiWorldLogo from '../../assets/restaurants/sushi-world.png'
import subwayLogo from '../../assets/restaurants/subway.png'
import biryaniByKilo from '../../assets/restaurants/biryani.by.kilo.png'
import behrozLogo from '../../assets/restaurants/behroz-biryani.png'
import tacoLogo from '../../assets/restaurants/taco-fiesta.png'
import curryLogo from '../../assets/restaurants/curry-corner.png'
import defaultLogo from '../../assets/restaurants/default.png'
import veerjiLogo from '../../assets/restaurants/veer-ji.png'
import chhatHouseLogo from '../../assets/restaurants/chaat-house.png'
import tandoorStoryLogo from '../../assets/restaurants/tandoor-story.png'
import KFCLogo from '../../assets/restaurants/kfc.png'
import StarBucksLogo from '../../assets/restaurants/starbucks.png'
import DominosLogo from '../../assets/restaurants/dominos.png'
import MCdonaldLogo from '../../assets/restaurants/mcdonald.png'

// Define Order type
interface OrderItem {
  name: string
  quantity: number
  price: number
  special_instructions?: string
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  restaurant_name: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  status: string
  payment_status: string
  payment_method: string
  delivery_address: {
    address: string
    city: string
    state: string
    pincode?: string
  }
  delivery_notes?: string
  created_at: string
  region: string
  logo_url?: string
}

// Restaurant logos mapping with real images
const restaurantLogos: Record<string, string> = {
  'Pizza Palace': pizzaPalaceLogo,
  'Burger House': burgerHouseLogo,
  'Sushi World': sushiWorldLogo,
  'Subway': subwayLogo,
  'Biryani By Kilo': biryaniByKilo,
  'Behrouz Biryani': behrozLogo,
  'Taco Fiesta': tacoLogo,
  'Curry Corner': curryLogo,
  'Veerji': veerjiLogo,
  'Chhat House': chhatHouseLogo,
  'Tandoor Story': tandoorStoryLogo,
  'Spice Garden': curryLogo,
  'Pizza Central': pizzaPalaceLogo,
  'Burger Junction': burgerHouseLogo,
  'Green Bites': defaultLogo,
  'Rolls & Bowls': defaultLogo,
  'Tandoor House': tandoorStoryLogo,
  'KFC': KFCLogo,
  'MCDonald': MCdonaldLogo,
  'Dominos': DominosLogo,
  'StarBucks': StarBucksLogo
}

// Helper function to safely convert to number
const toNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

// Status configuration
const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  'pending': { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'Pending' },
  'confirmed': { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Confirmed' },
  'preparing': { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', label: 'Preparing' },
  'ready': { icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', label: 'Ready' },
  'out_for_delivery': { icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Out for Delivery' },
  'on_the_way': { icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'On the Way' },
  'delivered': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Delivered' },
  'cancelled': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Cancelled' },
}

const fetchOrders = async (): Promise<Order[]> => {
  try {
    const response = await api.get('/orders/')
    console.log('Orders API response:', response.data)
    
    let orders: Order[] = []
    
    if (Array.isArray(response.data)) {
      orders = response.data
    } else if (response.data?.results && Array.isArray(response.data.results)) {
      orders = response.data.results
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      orders = response.data.data
    }
    
    return orders.map((order: Order) => ({
      ...order,
      subtotal: toNumber(order.subtotal),
      delivery_fee: toNumber(order.delivery_fee),
      tax_amount: toNumber(order.tax_amount),
      discount_amount: toNumber(order.discount_amount),
      total_amount: toNumber(order.total_amount)
    }))
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

// Helper function to get restaurant logo
const getRestaurantLogo = (restaurantName: string): string => {
  // Check if we have a logo for this restaurant
  if (restaurantLogos[restaurantName]) {
    return restaurantLogos[restaurantName]
  }
  
  // Try case-insensitive match
  const lowerName = restaurantName.toLowerCase()
  for (const [key, value] of Object.entries(restaurantLogos)) {
    if (key.toLowerCase() === lowerName) {
      return value
    }
  }
  
  // Return default logo if no match found
  return defaultLogo
}

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }: { order: Order | null; onClose: () => void }) => {
  if (!order) return null

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending']
  const StatusIcon = statusConfig.icon

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Order Details</h2>
              <p className="text-white/70 text-sm font-mono">{order.order_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Restaurant Info with Logo */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <img
              src={getRestaurantLogo(order.restaurant_name)}
              alt={order.restaurant_name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultLogo
              }}
            />
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{order.restaurant_name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </span>
                <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-[#E63946]" />
                <h4 className="font-semibold text-gray-800">Customer</h4>
              </div>
              <p className="font-medium text-gray-800">{order.customer_name}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Mail className="w-3 h-3" />
                <span>{order.customer_email}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Phone className="w-3 h-3" />
                <span>{order.customer_phone}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#E63946]" />
                <h4 className="font-semibold text-gray-800">Delivery Address</h4>
              </div>
              <p className="text-gray-700">{order.delivery_address?.address}</p>
              <p className="text-sm text-gray-500 mt-1">
                {order.delivery_address?.city}, {order.delivery_address?.state} {order.delivery_address?.pincode}
              </p>
              {order.delivery_notes && (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {order.delivery_notes}
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E63946]" />
                <h4 className="font-semibold text-gray-800">Order Items</h4>
                <span className="ml-auto text-sm text-gray-500">{order.items?.length} items</span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items?.map((item: OrderItem, idx: number) => (
                <div key={idx} className="p-4 flex justify-between items-start hover:bg-white/50 transition">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                      <span className="text-sm text-gray-500">₹{toNumber(item.price).toFixed(2)} each</span>
                    </div>
                    {item.special_instructions && (
                      <p className="text-xs text-gray-400 mt-1">📝 {item.special_instructions}</p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 ml-4">
                    ₹{(toNumber(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#E63946]" />
              <h4 className="font-semibold text-gray-800">Payment Summary</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="text-gray-700">{formatCurrency(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-700">{formatCurrency(order.tax_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-[#E63946] text-lg">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Payment Method</span>
                <span className="text-gray-700 font-medium">{order.payment_method?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment_status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#E63946] to-[#C62828] text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const itemsPerPage = 10
  
  const { data: orders = [], isLoading, error, refetch } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    initialData: [],
    staleTime: 30000,
  })

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Order statistics
  const orderStats = {
    total: orders.length,
    delivered: orders.filter((o: Order) => o.status === 'delivered').length,
    pending: orders.filter((o: Order) => o.status === 'pending' || o.status === 'confirmed').length,
    cancelled: orders.filter((o: Order) => o.status === 'cancelled').length,
    preparing: orders.filter((o: Order) => o.status === 'preparing' || o.status === 'ready').length,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center m-6">
        <p className="text-red-600 mb-4">Failed to load orders</p>
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
                <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
                <p className="text-white/80">View and manage all customer orders</p>
                <p className="text-sm text-white/60 mt-1">Total Orders: {orders.length}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => refetch()} 
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{orderStats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Preparing</p>
              <p className="text-2xl font-bold text-purple-600">{orderStats.preparing}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, or restaurant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {paginatedOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first order to get started'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedOrders.map((order: Order, index: number) => {
                        const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending']
                        const StatusIcon = statusConfig.icon
                        
                        return (
                          <motion.tr
                            key={order.id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => handleViewOrder(order)}
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-gray-900">{order.order_number}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getRestaurantLogo(order.restaurant_name)}
                                  alt={order.restaurant_name}
                                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = defaultLogo
                                  }}
                                />
                                <span className="font-medium text-gray-800">{order.restaurant_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{order.customer_name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[120px]">{order.customer_email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewOrder(order)
                                }}
                                className="p-2 text-gray-400 hover:text-[#E63946] transition rounded-lg hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </>
  )
}