import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Star, MessageCircle, RefreshCw, Edit, Trash2,
  X, Send, AlertCircle, Clock, CheckCircle
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  order_id: string
  order_number?: string
  product_name?: string
  restaurant_name?: string
}

interface Order {
  id: string
  order_number: string
  restaurant_name: string
  created_at: string
  status: string
  total_amount: number
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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

export const CustomerReviewsPage = () => {
  const navigate = useNavigate()
  const [showAddReview, setShowAddReview] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('')
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  // Fetch customer reviews
  const { data: reviews = [], refetch } = useQuery<Review[]>({
    queryKey: ['customer-reviews'],
    queryFn: async () => {
      const response = await api.get('/customers/reviews/')
      return response.data.data || []
    },
  })

  // Fetch customer orders for review selection
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['customer-orders-for-review'],
    queryFn: async () => {
      const response = await api.get('/customers/orders/')
      return response.data.data || []
    },
  })

  // Get only delivered orders that haven't been reviewed yet
  const deliveredOrders = orders.filter(
    (order: Order) => order.status === 'delivered'
  )

  const createReview = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/customers/reviews/create/', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!')
      refetch()
      setShowAddReview(false)
      setRating(0)
      setComment('')
      setSelectedOrderId('')
      setSelectedRestaurantId('')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit review'
      toast.error(message)
    },
  })

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      await api.delete(`/customers/reviews/${reviewId}/delete/`)
    },
    onSuccess: () => {
      toast.success('Review deleted successfully')
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete review')
    },
  })

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    if (!selectedOrderId) {
      toast.error('Please select an order')
      return
    }
    if (!comment.trim()) {
      toast.error('Please write a comment')
      return
    }

    createReview.mutate({
      order_id: selectedOrderId,
      restaurant_id: selectedRestaurantId || null,
      rating: rating,
      comment: comment.trim()
    })
  }

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReview.mutate(reviewId)
    }
  }

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={`text-2xl transition ${
              star <= count ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:scale-110' : ''}`}
          >
            ★
          </button>
        ))}
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
              <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
              <p className="text-white/80">Share your feedback and experiences</p>
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
                onClick={() => setShowAddReview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#E63946] rounded-lg hover:bg-[#C62828] transition shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                Write Review
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-800">{reviews.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Average Rating</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : '0'}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Delivered Orders</p>
            <p className="text-2xl font-bold text-green-600">{deliveredOrders.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Can Review</p>
            <p className="text-2xl font-bold text-blue-600">
              {deliveredOrders.filter(o => 
                !reviews.some(r => r.order_id === o.id)
              ).length}
            </p>
          </div>
        </div>

        {/* Add Review Modal */}
        {showAddReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
                <h2 className="text-xl font-bold text-white">Write a Review</h2>
                <button 
                  onClick={() => {
                    setShowAddReview(false)
                    setRating(0)
                    setComment('')
                    setSelectedOrderId('')
                  }} 
                  className="p-2 rounded-lg hover:bg-white/10 transition text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Select Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => {
                      setSelectedOrderId(e.target.value)
                      const order = deliveredOrders.find(o => o.id === e.target.value)
                      if (order) {
                        setSelectedRestaurantId('') // You can set restaurant ID if available
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
                  >
                    <option value="">Select an order...</option>
                    {deliveredOrders
                      .filter(order => !reviews.some(r => r.order_id === order.id))
                      .map((order: Order) => (
                        <option key={order.id} value={order.id}>
                          {order.order_number} - {order.restaurant_name} ({formatDate(order.created_at)})
                        </option>
                      ))}
                  </select>
                  {deliveredOrders.filter(order => !reviews.some(r => r.order_id === order.id)).length === 0 && (
                    <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      No orders available for review. You can only review delivered orders.
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  {renderStars(rating, true)}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
                    rows={4}
                    placeholder="Share your experience..."
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={createReview.isPending}
                  className="w-full py-2.5 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {createReview.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No reviews yet</p>
            <p className="text-sm text-gray-400 mt-1">Share your experience with your orders!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">• {formatDate(review.created_at)}</span>
                      {review.order_number && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {review.order_number}
                        </span>
                      )}
                    </div>
                    {review.restaurant_name && (
                      <p className="text-sm font-medium text-gray-600 mt-1">{review.restaurant_name}</p>
                    )}
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this review?')) {
                        handleDeleteReview(review.id)
                      }
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    disabled={deleteReview.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}