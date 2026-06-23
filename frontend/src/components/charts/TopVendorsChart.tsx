// components/charts/TopVendorsChart.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, Star, DollarSign, ShoppingBag, Award } from 'lucide-react'
import api from '../../services/api'

interface TopVendor {
  rank: number
  name: string
  revenue: number
  orders: number
  growth: string
  rating: number
}

const fetchTopVendors = async (): Promise<TopVendor[]> => {
  try {
    const response = await api.get('/dashboard/top-performers/')
    console.log('Top performers response:', response.data)
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (response.data?.results && Array.isArray(response.data.results)) {
      return response.data.results
    }
    return []
  } catch (error) {
    console.error('Error fetching top performers:', error)
    return []
  }
}

export const TopVendorsChart = () => {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['topVendors'],
    queryFn: fetchTopVendors,
    refetchInterval: 60000,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const getMedalEmoji = (rank: number) => {
    switch(rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
          <p className="text-sm text-gray-500">Highest revenue generating vendors</p>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (vendors.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
          <p className="text-sm text-gray-500">Highest revenue generating vendors</p>
        </div>
        <div className="p-6 text-center py-12">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No vendor data available</p>
        </div>
      </div>
    )
  }

  // Filter out vendors with zero revenue for better display
  const activeVendors = vendors.filter(v => v.revenue > 0 || v.orders > 0)
  const displayVendors = activeVendors.length > 0 ? activeVendors : vendors

  // Calculate max revenue for progress bar
  const maxRevenue = Math.max(...displayVendors.map(v => v.revenue), 1)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
        <p className="text-sm text-gray-500">Highest revenue generating vendors</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {displayVendors.map((vendor) => (
            <motion.div
              key={vendor.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (vendor.rank - 1) * 0.1 }}
              className="relative p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              {/* Bar background */}
              <div 
                className="absolute left-0 top-0 bottom-0 rounded-lg transition-all duration-500 opacity-10"
                style={{ 
                  width: `${(vendor.revenue / maxRevenue) * 100}%`,
                  background: 'linear-gradient(135deg, #E63946, #457B9D)'
                }}
              />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-white ${
                    vendor.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    vendor.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    vendor.rank === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                    'bg-gradient-to-r from-[#1D3557] to-[#457B9D]'
                  }`}>
                    {vendor.rank <= 3 ? getMedalEmoji(vendor.rank) : vendor.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{vendor.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{vendor.orders} orders</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">{vendor.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(vendor.revenue)}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    vendor.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>{vendor.growth}</span>
                    <span className="text-gray-400 text-xs">vs last week</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}