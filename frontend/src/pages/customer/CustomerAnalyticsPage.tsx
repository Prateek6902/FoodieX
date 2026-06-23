import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  BarChart3, TrendingUp, DollarSign, ShoppingBag,
  Star, MapPin, Calendar, RefreshCw,
  ChevronRight, Award, Users, Clock
} from 'lucide-react'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'

interface AnalyticsData {
  monthly_spending: Array<{
    month: string
    total: number
    count: number
  }>
  favorite_restaurants: Array<{
    restaurant_name: string
    order_count: number
    total_spent: number
  }>
  total_orders: number
  total_spent: number
  average_order_value: number
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

export const CustomerAnalyticsPage = () => {
  const navigate = useNavigate()

  const { data: analytics, refetch } = useQuery<AnalyticsData>({
    queryKey: ['customer-analytics'],
    queryFn: async () => {
      const response = await api.get('/customers/analytics/')
      return response.data.data
    },
  })

  // Mock data if no data from API
  const stats = analytics || {
    monthly_spending: [
      { month: 'Jan', total: 1200, count: 3 },
      { month: 'Feb', total: 800, count: 2 },
      { month: 'Mar', total: 1500, count: 4 },
      { month: 'Apr', total: 600, count: 1 },
      { month: 'May', total: 2000, count: 5 },
      { month: 'Jun', total: 1800, count: 4 },
    ],
    favorite_restaurants: [],
    total_orders: 0,
    total_spent: 0,
    average_order_value: 0
  }

  const maxSpending = Math.max(...stats.monthly_spending.map(m => m.total), 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Analytics</h1>
              <p className="text-white/80">Track your spending and order patterns</p>
            </div>
            <button 
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total_orders}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.total_spent)}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.average_order_value)}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Favorite Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.favorite_restaurants.length}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Spending Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#E63946]" />
            Monthly Spending
          </h2>
          <div className="space-y-3">
            {stats.monthly_spending.map((month, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{month.month}</span>
                  <div className="flex gap-4">
                    <span className="text-gray-600">₹{month.total}</span>
                    <span className="text-gray-400">{month.count} orders</span>
                  </div>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-lg flex items-center justify-end pr-2 text-white text-xs font-medium"
                    style={{ width: `${(month.total / maxSpending) * 100}%` }}
                  >
                    {month.total > maxSpending * 0.1 && `₹${month.total}`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Favorite Restaurants */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#E63946]" />
              Favorite Restaurants
            </h2>
            <button 
              onClick={() => navigate('/customer/restaurants')}
              className="text-sm text-[#E63946] hover:underline font-medium flex items-center gap-1"
            >
              Browse All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">
            {stats.favorite_restaurants && stats.favorite_restaurants.length > 0 ? (
              <div className="space-y-3">
                {stats.favorite_restaurants.map((restaurant, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{restaurant.restaurant_name}</p>
                        <p className="text-sm text-gray-500">{restaurant.order_count} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{formatCurrency(restaurant.total_spent)}</p>
                      <p className="text-sm text-gray-500">total spent</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No favorite restaurants yet</p>
                <p className="text-sm text-gray-400 mt-1">Start ordering to discover your favorites!</p>
                <button 
                  onClick={() => navigate('/customer/restaurants')}
                  className="mt-4 px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition"
                >
                  Explore Restaurants
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}