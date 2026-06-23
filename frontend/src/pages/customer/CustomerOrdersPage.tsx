import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, Eye, Clock, CheckCircle, XCircle,
  Search, Filter, Package, Truck,
  MapPin, DollarSign, X, Star
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  total_amount: number
  status: string
  created_at: string
  restaurant_name?: string
  items?: OrderItem[]
  delivery_address?: {
    address: string
    city: string
    state: string
    pincode?: string
  }
  subtotal?: number
  delivery_fee?: number
  tax_amount?: number
  discount_amount?: number
  payment_status?: string
  order_type?: string
  estimated_delivery_time?: string
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadge = (status: string): string => {
  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-700',
    'confirmed': 'bg-blue-100 text-blue-700',
    'preparing': 'bg-purple-100 text-purple-700',
    'ready': 'bg-indigo-100 text-indigo-700',
    'out_for_delivery': 'bg-orange-100 text-orange-700',
    'delivered': 'bg-green-100 text-green-700',
    'cancelled': 'bg-red-100 text-red-700',
  }
  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-700'
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'preparing': 'Preparing',
    'ready': 'Ready',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
  }
  return statusMap[status.toLowerCase()] || status
}

export const CustomerOrdersPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ['customer-orders'],
    queryFn: async () => {
      const response = await api.get('/customers/orders/')
      return response.data.data || []
    },
  })

  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      await api.post(`/customers/orders/${orderId}/cancel/`)
    },
    onSuccess: () => {
      toast.success('Order cancelled successfully')
      refetch()
      setShowOrderModal(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    },
  })

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await api.get(`/customers/orders/${orderId}/`)
      setSelectedOrder(response.data.data)
      setShowOrderModal(true)
    } catch (error) {
      toast.error('Failed to load order details')
    }
  }

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Orders</h1>
              <p className="text-white/80">Track and manage all your orders</p>
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
                onClick={() => navigate('/customer/restaurants')}
                className="flex items-center gap-2 px-4 py-2 bg-[#E63946] rounded-lg hover:bg-[#C62828] transition shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                Order Food
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((o: Order) => o.status === 'pending' || o.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o: Order) => o.status === 'delivered').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">
              {orders.filter((o: Order) => o.status === 'cancelled').length}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
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
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'Start exploring restaurants!'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button 
                  onClick={() => navigate('/customer/restaurants')}
                  className="mt-4 px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition"
                >
                  Browse Restaurants
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredOrders.map((order: Order) => (
                <div 
                  key={order.id} 
                  className="p-4 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => fetchOrderDetails(order.id)}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">{order.order_number}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      {order.restaurant_name && (
                        <p className="text-sm text-gray-600">{order.restaurant_name}</p>
                      )}
                      {order.order_type && (
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full inline-block mt-1">
                          {order.order_type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{formatCurrency(order.total_amount)}</p>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-[#E63946] transition">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
                <div>
                  <h2 className="text-xl font-bold text-white">Order Details</h2>
                  <p className="text-white/70 text-sm font-mono">{selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setShowOrderModal(false)} className="p-2 rounded-lg hover:bg-white/10 transition text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadge(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                    <span className="text-sm text-gray-500">• {formatDate(selectedOrder.created_at)}</span>
                    {selectedOrder.order_type && (
                      <span className="text-sm bg-gray-200 px-2 py-0.5 rounded-full">{selectedOrder.order_type}</span>
                    )}
                  </div>
                  {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                          cancelOrder.mutate(selectedOrder.id)
                        }
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {/* Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item: OrderItem, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{item.product_name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                          </div>
                          <p className="font-semibold text-gray-800">{formatCurrency(item.total_price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {selectedOrder.delivery_address && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#E63946]" />
                      Delivery Address
                    </h4>
                    <p className="text-gray-700">{selectedOrder.delivery_address.address}</p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state}
                    </p>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-3">Payment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span>{formatCurrency(selectedOrder.delivery_fee || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span>{formatCurrency(selectedOrder.tax_amount || 0)}</span>
                    </div>
                    {(selectedOrder.discount_amount || 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="text-emerald-600">-{formatCurrency(selectedOrder.discount_amount || 0)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-800">Total</span>
                        <span className="text-[#E63946] text-lg">{formatCurrency(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                    {selectedOrder.payment_status && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Status</span>
                        <span className={`font-medium ${selectedOrder.payment_status === 'paid' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                          {selectedOrder.payment_status.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const Printer = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
)