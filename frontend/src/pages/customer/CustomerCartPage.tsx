// CustomerCartPage.tsx - Complete Updated

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, X, Plus, Minus, Trash2, 
  CreditCard, Wallet, Truck, Package, 
  MapPin, ChevronRight, RefreshCw,
  Gift, AlertCircle, CheckCircle
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'

interface Address {
  id: string
  address_type: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  landmark: string | null
  is_default: boolean
}

interface Coupon {
  id: string
  code: string
  discount_type: string
  discount_value: number
  description: string
  valid_until: string
  is_used: boolean
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

export const CustomerCartPage = () => {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getItemCount } = useCart()
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [couponCode, setCouponCode] = useState<string>('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderType, setOrderType] = useState<string>('delivery')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card')
  const [placingOrder, setPlacingOrder] = useState(false)

  // Fetch addresses from API
  const { data: addresses = [], refetch: refetchAddresses } = useQuery<Address[]>({
    queryKey: ['customer-addresses'],
    queryFn: async () => {
      const response = await api.get('/customers/addresses/')
      return response.data.data || []
    },
  })

  // Available coupons - In real app, fetch from API
  const availableCoupons: Coupon[] = [
    {
      id: '1',
      code: 'WELCOME10',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      description: '10% off on your first order',
      valid_until: '2024-12-31',
      is_used: false
    }
  ]

  const cartTotal = getCartTotal()
  const itemCount = getItemCount()
  const deliveryFee = orderType === 'delivery' ? 40 : 0
  const tax = Math.round(cartTotal * 0.05)
  const discount = appliedCoupon ? 
    (appliedCoupon.discount_type === 'PERCENTAGE' ? 
      (cartTotal * appliedCoupon.discount_value) / 100 : 
      appliedCoupon.discount_value
    ) : 0
  const grandTotal = cartTotal + deliveryFee + tax - discount

  const applyCoupon = () => {
    const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase())
    if (coupon) {
      setAppliedCoupon(coupon)
      toast.success('Coupon applied successfully!')
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setPlacingOrder(true)
    try {
      // Find selected address
      const selectedAddress = addresses.find(a => a.id === selectedAddressId)
      
      // Prepare order data
      const orderData = {
        restaurant_id: cartItems[0]?.restaurant_id || '',
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        order_type: orderType,
        payment_method: selectedPaymentMethod,
        delivery_address: orderType === 'delivery' ? {
          address: selectedAddress?.address_line1 || '',
          city: selectedAddress?.city || '',
          state: selectedAddress?.state || '',
          pincode: selectedAddress?.postal_code || ''
        } : {},
        delivery_notes: ''
      }

      console.log('Placing order:', orderData)

      // Use /orders/ (without /create/) since ViewSet uses POST /orders/
      const response = await api.post('/orders/', orderData)
      
      console.log('Order response:', response.data)

      if (response.data.success) {
        toast.success('Order placed successfully!')
        clearCart()
        setShowCheckout(false)
        navigate('/customer/orders')
      } else {
        toast.error(response.data.message || 'Failed to place order')
      }
    } catch (error: any) {
      console.error('Order placement error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || 'Failed to place order'
      toast.error(errorMessage)
    } finally {
      setPlacingOrder(false)
    }
  }

  if (cartItems.length === 0 && !showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl mb-6">
            <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
            <p className="text-white/80">Review your items and proceed to checkout</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">Browse restaurants and add items!</p>
            <button 
              onClick={() => navigate('/customer/restaurants')}
              className="mt-4 px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
              <p className="text-white/80">{itemCount} items in your cart</p>
            </div>
            <button 
              onClick={() => navigate('/customer/restaurants')}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              Continue Shopping
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">Items ({itemCount})</h2>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-600 transition"
                >
                  Clear All
                </button>
              </div>

              {cartItems.map((item) => (
                <div key={item.product_id} className="p-4 border-b border-gray-100 last:border-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.is_veg ? (
                        <span className="text-green-500 font-bold text-xs border border-green-500 rounded px-1">Veg</span>
                      ) : (
                        <span className="text-red-500 font-bold text-xs border border-red-500 rounded px-1">Non-veg</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-sm text-gray-500">{item.restaurant_name}</p>
                      <p className="text-sm font-medium text-[#E63946]">{formatCurrency(item.unit_price)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <h2 className="font-semibold text-gray-800 mb-3">Apply Coupon</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <button
                    onClick={removeCoupon}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition"
                  >
                    Apply
                  </button>
                )}
              </div>
              {appliedCoupon && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Coupon {appliedCoupon.code} applied! {appliedCoupon.discount_type === 'PERCENTAGE' ? `${appliedCoupon.discount_value}% off` : `₹${appliedCoupon.discount_value} off`}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sticky top-6">
              <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-800">Total</span>
                    <span className="text-[#E63946] text-lg">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full mt-4 py-3 bg-[#E63946] text-white rounded-xl hover:bg-[#C62828] transition font-medium"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCheckout(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-bold text-white">Checkout</h2>
                  </div>
                  <button onClick={() => setShowCheckout(false)} className="p-2 rounded-lg hover:bg-white/10 transition text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setOrderType('delivery')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                          orderType === 'delivery'
                            ? 'bg-[#E63946] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        Delivery
                      </button>
                      <button
                        onClick={() => setOrderType('takeaway')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                          orderType === 'takeaway'
                            ? 'bg-[#E63946] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        Takeaway
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {orderType === 'delivery' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                      {addresses.length === 0 ? (
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                          <p className="text-gray-500">No addresses saved</p>
                          <button 
                            onClick={() => {
                              setShowCheckout(false)
                              navigate('/customer/addresses')
                            }}
                            className="mt-2 text-[#E63946] text-sm hover:underline"
                          >
                            Add Address
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {addresses.map((addr) => (
                            <div 
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`p-3 border rounded-xl cursor-pointer transition ${
                                selectedAddressId === addr.id 
                                  ? 'border-[#E63946] bg-red-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <input
                                  type="radio"
                                  checked={selectedAddressId === addr.id}
                                  onChange={() => setSelectedAddressId(addr.id)}
                                  className="mt-1"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{addr.address_type}</span>
                                    {addr.is_default && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{addr.address_line1}</p>
                                  <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.postal_code}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedPaymentMethod('card')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                          selectedPaymentMethod === 'card'
                            ? 'bg-[#E63946] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        Card
                      </button>
                      <button
                        onClick={() => setSelectedPaymentMethod('wallet')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                          selectedPaymentMethod === 'wallet'
                            ? 'bg-[#E63946] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Wallet className="w-4 h-4" />
                        Wallet
                      </button>
                      <button
                        onClick={() => setSelectedPaymentMethod('cod')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                          selectedPaymentMethod === 'cod'
                            ? 'bg-[#E63946] text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <DollarSign className="w-4 h-4" />
                        COD
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.product_id} className="flex justify-between text-sm">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span>{formatCurrency(item.total_price)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Delivery Fee</span>
                          <span>{formatCurrency(deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tax</span>
                          <span>{formatCurrency(tax)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                          <span>Total</span>
                          <span className="text-[#E63946]">{formatCurrency(grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={placingOrder}
                    className="w-full py-3 bg-[#E63946] text-white rounded-xl hover:bg-[#C62828] transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {placingOrder ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const DollarSign = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)