import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Gift, RefreshCw, Tag, Percent, 
  Clock, CheckCircle, XCircle, 
  AlertCircle, Copy, Check
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

interface Coupon {
  id: string
  code: string
  discount_type: string
  discount_value: number
  description: string
  valid_until: string
  is_used: boolean
  used_at?: string
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export const CustomerCouponsPage = () => {
  const { data: coupons = [], refetch } = useQuery<Coupon[]>({
    queryKey: ['customer-coupons'],
    queryFn: async () => {
      const response = await api.get('/customers/coupons/')
      return response.data.data || []
    },
  })

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Coupon code copied!')
  }

  const availableCoupons = coupons.filter(c => !c.is_used)
  const usedCoupons = coupons.filter(c => c.is_used)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Coupons</h1>
              <p className="text-white/80">View and manage your available coupons</p>
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Coupons</p>
            <p className="text-2xl font-bold text-gray-800">{coupons.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold text-green-600">{availableCoupons.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Used</p>
            <p className="text-2xl font-bold text-gray-400">{usedCoupons.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Expired</p>
            <p className="text-2xl font-bold text-red-500">0</p>
          </div>
        </div>

        {/* Available Coupons */}
        {availableCoupons.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#E63946]" />
              Available Coupons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCoupons.map((coupon) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-5 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-pink-500" />
                        <span className="text-2xl font-bold text-[#E63946]">{coupon.code}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{coupon.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Valid until {formatDate(coupon.valid_until)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="px-3 py-1.5 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition text-sm flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Used Coupons */}
        {usedCoupons.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-400" />
              Used Coupons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usedCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-xl font-bold text-gray-400 line-through">{coupon.code}</span>
                      </div>
                      <p className="text-gray-500 mt-1">{coupon.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Used
                        </span>
                      </div>
                    </div>
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {coupons.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 text-center py-16">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No coupons available</p>
            <p className="text-sm text-gray-400 mt-1">Complete orders to earn rewards!</p>
          </div>
        )}
      </div>
    </div>
  )
}