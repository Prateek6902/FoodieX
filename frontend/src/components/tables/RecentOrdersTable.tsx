// components/tables/RecentOrdersTable.tsx
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  Package, 
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  User,
  Store,
  DollarSign,
  Calendar,
  X,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Receipt,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
// Import restaurant logos
import pizzaPalaceLogo from '../../assets/restaurants/pizza-palace.png'
import burgerHouseLogo from '../../assets/restaurants/burger-house.png'
import sushiWorldLogo from '../../assets/restaurants/sushi-world.png'
import subwayLogo from '../../assets/restaurants/subway.png'
import biryaniByKilo from '../../assets/restaurants/biryani.by.kilo.png'
import BehrozLogo from '../../assets/restaurants/behroz-biryani.png'
import DefaultLogo from '../../assets/restaurants/default.png'
import CurryLogo from '../../assets/restaurants/curry-corner.png'
import TacoLogo from '../../assets/restaurants/taco-fiesta.png'
import KFCLogo from '../../assets/restaurants/kfc.png'
import StarBucksLogo from '../../assets/restaurants/starbucks.png'
import DominosLogo from '../../assets/restaurants/dominos.png'
import MCdonaldLogo from '../../assets/restaurants/mcdonald.png'
interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  restaurant_name: string
  total_amount: number
  status: string
  created_at: string
  items?: OrderItem[]
  delivery_address?: string | { address?: string; city?: string; state?: string }
  delivery_fee?: number
  subtotal?: number
  tax_amount?: number
  discount_amount?: number
  payment_status?: string
  payment_method?: string
  delivery_notes?: string
  region?: string
}

// Restaurant logos mapping
const restaurantLogos: Record<string, string> = {
  'Pizza Palace': pizzaPalaceLogo,
  'Burger House': burgerHouseLogo,
  'Sushi World': sushiWorldLogo,
  'Subway': subwayLogo,
  'Biryani By Kilo': biryaniByKilo,
  'Behroz Biryani': BehrozLogo,
  'Taco Fiesta': TacoLogo,
  'Curry Corner': CurryLogo,
  'Spice Garden': DefaultLogo,
  'Pizza Central': DefaultLogo,
  'Burger Junction': DefaultLogo,
  'Green Bites': DefaultLogo,
  'Rolls & Bowls': DefaultLogo,
  'Tandoor House': DefaultLogo,
  'KFC': KFCLogo,
  'MCDonald': MCdonaldLogo,
  'Dominos': DominosLogo,
  'StarBucks': StarBucksLogo
}

const defaultLogo = DefaultLogo

const getRestaurantLogo = (restaurantName: string): string => {
  if (!restaurantName) return defaultLogo
  return restaurantLogos[restaurantName] || defaultLogo
}

const fetchRecentOrders = async (): Promise<Order[]> => {
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
    } else if (response.data?.orders && Array.isArray(response.data.orders)) {
      orders = response.data.orders
    }
    
    return orders.slice(0, 5)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
}

const fetchOrderDetails = async (orderId: string): Promise<Order | null> => {
  try {
    const response = await api.get(`/orders/${orderId}/`)
    console.log('Order details response:', response.data)
    
    let order = response.data
    if (order?.data) {
      order = order.data
    }
    return order
  } catch (error) {
    console.error('Error fetching order details:', error)
    return null
  }
}

export const RecentOrdersTable = () => {
  const navigate = useNavigate()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['recentOrders'],
    queryFn: fetchRecentOrders,
    refetchInterval: 30000,
  })

  const handleViewOrder = async (orderId: string) => {
    setIsLoadingDetails(true)
    setShowDetailsModal(true)
    
    try {
      const orderDetails = await fetchOrderDetails(orderId)
      if (orderDetails) {
        setSelectedOrder(orderDetails)
      } else {
        const order = orders.find(o => o.id === orderId)
        setSelectedOrder(order || null)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      const order = orders.find(o => o.id === orderId)
      setSelectedOrder(order || null)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: any; text: string; className: string }> = {
      'pending': { icon: Clock, text: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      'confirmed': { icon: Clock, text: 'Confirmed', className: 'bg-blue-100 text-blue-700' },
      'preparing': { icon: Clock, text: 'Preparing', className: 'bg-purple-100 text-purple-700' },
      'ready': { icon: Clock, text: 'Ready', className: 'bg-indigo-100 text-indigo-700' },
      'on_the_way': { icon: Truck, text: 'On The Way', className: 'bg-orange-100 text-orange-700' },
      'delivered': { icon: CheckCircle, text: 'Delivered', className: 'bg-green-100 text-green-700' },
      'cancelled': { icon: XCircle, text: 'Cancelled', className: 'bg-red-100 text-red-700' },
    }
    const config = statusMap[status?.toLowerCase()] || statusMap['pending']
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getDeliveryAddress = (order: Order) => {
    if (!order.delivery_address) return 'N/A'
    if (typeof order.delivery_address === 'string') {
      return order.delivery_address
    }
    const addr = order.delivery_address
    const parts = [addr.address, addr.city, addr.state].filter(Boolean)
    return parts.join(', ') || 'N/A'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <p className="text-sm text-gray-500">Latest customer orders</p>
          </div>
          <div className="w-6 h-6 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-100"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <p className="text-sm text-gray-500">Latest customer orders</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#E63946] hover:bg-[#E63946]/10 rounded-lg transition font-medium"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No recent orders</p>
            <p className="text-sm text-gray-400 mt-1">Orders will appear here once placed</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  {/* Restaurant Logo */}
                  <div className="flex-shrink-0">
                    <img
                      src={getRestaurantLogo(order.restaurant_name)}
                      alt={order.restaurant_name}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultLogo
                      }}
                    />
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Order Number & Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-800">{order.order_number || 'N/A'}</span>
                          {getStatusBadge(order.status || 'pending')}
                        </div>
                        
                        {/* Restaurant & Customer */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Store className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">{order.restaurant_name || 'Unknown'}</span>
                          <span className="text-gray-300">•</span>
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">{order.customer_name || 'Guest'}</span>
                        </div>

                        {/* Date & Amount */}
                        <div className="flex items-center gap-4 mt-1.5">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-800">{formatCurrency(order.total_amount || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* View Button */}
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#E63946] hover:bg-[#E63946]/10 rounded-lg transition font-medium flex-shrink-0 ml-4"
                      >
                        View
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {isLoadingDetails ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
                    <div>
                      <h2 className="text-xl font-bold">Order Details</h2>
                      <p className="text-white/70 text-sm">{selectedOrder.order_number || 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-2 rounded-lg hover:bg-white/10 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Restaurant Info */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#E63946]/5 to-[#457B9D]/5 rounded-xl">
                      <img
                        src={getRestaurantLogo(selectedOrder.restaurant_name)}
                        alt={selectedOrder.restaurant_name}
                        className="w-16 h-16 rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultLogo
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{selectedOrder.restaurant_name || 'N/A'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(selectedOrder.status || 'pending')}
                          <span className="text-sm text-gray-500">{formatDate(selectedOrder.created_at)}</span>
                        </div>
                        {selectedOrder.region && (
                          <p className="text-xs text-gray-400 mt-1">Region: {selectedOrder.region}</p>
                        )}
                      </div>
                    </div>

                    {/* Customer & Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-800">{selectedOrder.customer_name || 'Guest User'}</span>
                          </div>
                          {selectedOrder.customer_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{selectedOrder.customer_email}</span>
                            </div>
                          )}
                          {selectedOrder.customer_phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{selectedOrder.customer_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 text-sm">{getDeliveryAddress(selectedOrder)}</span>
                          </div>
                          {selectedOrder.delivery_notes && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">📝 {selectedOrder.delivery_notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-800">{item.product_name || 'Unknown Item'}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity || 0}</p>
                              </div>
                              <p className="font-semibold text-gray-800">{formatCurrency(item.total_price || 0)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Order Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.subtotal || 0)}</span>
                        </div>
                        {selectedOrder.delivery_fee && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Fee</span>
                            <span className="font-medium">{formatCurrency(selectedOrder.delivery_fee)}</span>
                          </div>
                        )}
                        {selectedOrder.tax_amount && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-medium">{formatCurrency(selectedOrder.tax_amount)}</span>
                          </div>
                        )}
                        {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount</span>
                            <span className="font-medium text-green-600">-{formatCurrency(selectedOrder.discount_amount)}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold text-gray-800">Total</span>
                          <span className="font-bold text-[#E63946] text-lg">{formatCurrency(selectedOrder.total_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                          <span className="text-gray-500">Payment</span>
                          <span className="text-gray-600">
                            {selectedOrder.payment_method?.toUpperCase() || 'N/A'}
                            {selectedOrder.payment_status && (
                              <span className={`ml-2 font-medium ${
                                selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                                • {selectedOrder.payment_status.toUpperCase()}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="w-full px-4 py-2.5 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition font-medium"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}