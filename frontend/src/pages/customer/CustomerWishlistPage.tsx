import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Heart, Package, Trash2, ShoppingBag} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface WishlistItem {
  id: string
  product: string
  product_name: string
  product_price: number
  product_image: string
  created_at: string
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

export const CustomerWishlistPage = () => {
  const navigate = useNavigate()

  const { data: wishlistItems = [], refetch } = useQuery<WishlistItem[]>({
    queryKey: ['customer-wishlist'],
    queryFn: async () => {
      const response = await api.get('/customers/wishlist/')
      return response.data.data || []
    },
  })

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/customers/wishlist/remove/${productId}/`)
    },
    onSuccess: () => {
      toast.success('Removed from wishlist')
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist')
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
              <p className="text-white/80">Your favorite items saved for later</p>
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
                Browse Restaurants
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{wishlistItems.length}</p>
        </div>

        {/* Wishlist Grid */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mt-1">Start adding your favorite items!</p>
            <button 
              onClick={() => navigate('/customer/restaurants')}
              className="mt-4 px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item: WishlistItem, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 line-clamp-2">{item.product_name}</p>
                    <p className="text-lg font-bold text-[#E63946] mt-1">{formatCurrency(item.product_price)}</p>
                    <button
                      onClick={() => removeFromWishlist.mutate(item.product)}
                      className="mt-2 text-sm text-red-500 hover:text-red-600 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)