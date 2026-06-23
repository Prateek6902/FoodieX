import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react'
import { useState } from 'react'
import api from '../../services/api'

interface OrderStatus {
  name: string
  value: number
  color?: string
}

interface OrderDetail {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  status: string
  created_at: string
  items?: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}

const STATUS_COLORS: Record<string, string> = {
  'Delivered': '#10B981',
  'Preparing': '#F59E0B',
  'Out for Delivery': '#3B82F6',
  'Cancelled': '#EF4444',
  'Pending': '#8B5CF6',
  'Confirmed': '#06B6D4',
}

const CHART_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#06B6D4']

const fetchOrderStatusData = async (): Promise<OrderStatus[]> => {
  try {
    const response = await api.get('/dashboard/order-status/')
    console.log('Order status response:', response.data)
    
    // Handle different response structures
    let data = response.data
    if (data?.success && data?.data) {
      data = data.data
    } else if (data?.data) {
      data = data.data
    }
    
    // If data is an array, map it
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => ({
        name: item.name || item.status || 'Unknown',
        value: item.value || item.count || 0,
        color: STATUS_COLORS[item.name as keyof typeof STATUS_COLORS] || '#6B7280'
      }))
    }
    
    // If no data, return empty with default colors
    return [
      { name: 'Delivered', value: 0, color: STATUS_COLORS['Delivered'] },
      { name: 'Preparing', value: 0, color: STATUS_COLORS['Preparing'] },
      { name: 'Out for Delivery', value: 0, color: STATUS_COLORS['Out for Delivery'] },
      { name: 'Cancelled', value: 0, color: STATUS_COLORS['Cancelled'] },
    ]
  } catch (error) {
    console.error('Error fetching order status:', error)
    return []
  }
}

const fetchOrdersByStatus = async (status: string): Promise<OrderDetail[]> => {
  try {
    // Convert status to lowercase for API call
    const statusMap: Record<string, string> = {
      'Delivered': 'delivered',
      'Preparing': 'preparing',
      'Out for Delivery': 'out_for_delivery',
      'Cancelled': 'cancelled',
      'Pending': 'pending',
      'Confirmed': 'confirmed',
    }
    
    const statusParam = statusMap[status] || status.toLowerCase()
    const response = await api.get(`/orders/?status=${statusParam}`)
    console.log(`Orders with status ${status}:`, response.data)
    
    if (Array.isArray(response.data)) {
      return response.data
    }
    if (response.data?.results) {
      return response.data.results
    }
    if (response.data?.data) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.error(`Error fetching orders with status ${status}:`, error)
    return []
  }
}

export const OrderStatusChart = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [statusOrders, setStatusOrders] = useState<OrderDetail[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  const { data: statusData = [], isLoading, refetch } = useQuery<OrderStatus[]>({
    queryKey: ['orderStatus'],
    queryFn: fetchOrderStatusData,
    refetchInterval: 30000,
  })

  const totalOrders = statusData.reduce((sum: number, item: OrderStatus) => {
    return sum + item.value
  }, 0)

  const handleStatusClick = async (status: string) => {
    if (selectedStatus === status) {
      setSelectedStatus(null)
      setShowOrderDetails(false)
      return
    }
    
    setSelectedStatus(status)
    setIsLoadingOrders(true)
    setShowOrderDetails(true)
    
    try {
      const orders = await fetchOrdersByStatus(status)
      setStatusOrders(orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setStatusOrders([])
    } finally {
      setIsLoadingOrders(false)
    }
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'delivered': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-blue-100 text-blue-700',
      'preparing': 'bg-purple-100 text-purple-700',
      'out_for_delivery': 'bg-orange-100 text-orange-700',
      'cancelled': 'bg-red-100 text-red-700',
    }
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-700'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Orders by Status</h3>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const hasData = statusData.some(item => item.value > 0)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Orders by Status</h3>
          <p className="text-sm text-gray-500">Distribution of order statuses</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{totalOrders.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </div>
      </div>

      <div className="p-6">
        {!hasData ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400">No order data available</p>
            <p className="text-sm text-gray-400 mt-1">Orders will appear here once placed</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="w-full lg:w-1/2 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
                    onClick={(data) => handleStatusClick(data.name)}
                    className="cursor-pointer"
                  >
                    {statusData.map((entry: OrderStatus, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} 
                        stroke={selectedStatus === entry.name ? '#1D3557' : 'transparent'}
                        strokeWidth={selectedStatus === entry.name ? 3 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} orders`, 'Count']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-3">
              {statusData.map((item: OrderStatus, index: number) => {
                const percentage = totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(1) : '0'
                const isSelected = selectedStatus === item.name
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#E63946]/10 border-2 border-[#E63946]' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                    onClick={() => handleStatusClick(item.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      {isSelected && (
                        <span className="text-xs text-[#E63946] font-medium">(selected)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-800">
                        {item.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 w-12 text-right">{percentage}%</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Order Details Section - Shows when a status is clicked */}
        {selectedStatus && showOrderDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-800">
                {selectedStatus} Orders ({statusOrders.length})
              </h4>
              <button
                onClick={() => {
                  setSelectedStatus(null)
                  setShowOrderDetails(false)
                  setStatusOrders([])
                }}
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Close
              </button>
            </div>

            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : statusOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {statusOrders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{order.order_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.customer_name}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatCurrency(order.total_amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {statusOrders.length > 10 && (
                  <div className="text-center py-3 text-sm text-gray-500">
                    Showing 10 of {statusOrders.length} orders
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No {selectedStatus} orders found
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}