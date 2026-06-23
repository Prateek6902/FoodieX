// components/dashboard/TopPerformers.tsx
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, MapPin, ShoppingBag } from 'lucide-react'
import api from '../../services/api'

interface TopVendor {
  id: string
  name: string
  zone: string
  orders: number
  revenue: number
  rating: number
  growth: number
}

const fetchTopPerformers = async (): Promise<TopVendor[]> => {
  try {
    const response = await api.get('/dashboard/top-performers/')
    if (response.data?.success && response.data?.data) {
      return response.data.data as TopVendor[]
    }
    return []
  } catch (error) {
    console.error('Error fetching top performers:', error)
    return []
  }
}

export const TopPerformers = () => {
  const { data: vendors = [], isLoading } = useQuery<TopVendor[]>({
    queryKey: ['topPerformers'],
    queryFn: fetchTopPerformers,
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
          <button className="text-sm text-[#FF9F1C] hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i: number) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Top Performers</h3>
        <button className="text-sm text-[#FF9F1C] hover:underline transition-colors">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {vendors.map((vendor: TopVendor, index: number) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9F1C] to-[#2EC4B6] text-white font-bold text-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{vendor.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{vendor.zone}</span>
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{vendor.orders}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-gray-900">{vendor.orders}</p>
              <div className={`flex items-center gap-1 text-xs ${vendor.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-3 h-3" />
                <span>{vendor.growth > 0 ? '+' : ''}{vendor.growth}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {vendors.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No vendor data available
        </div>
      )}
    </div>
  )
}