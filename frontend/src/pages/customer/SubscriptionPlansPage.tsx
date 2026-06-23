// pages/customer/SubscriptionPlansPage.tsx

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, Zap, Sparkles, Award, Check, 
  ShoppingBag, Truck, Gift, CreditCard,
  Star, Users, Coffee, Pizza, Cake,
  Bell, Clock, Shield, Heart, TrendingUp,
  ArrowRight, Loader2, XCircle, Info,
  ChevronRight, ChevronLeft, Plus, Minus
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  period: string
  features: string[]
  is_popular?: boolean
  badge?: string
  discount?: number
  icon: any
  color?: string
}

interface SubscriptionData {
  id: string
  plan: string
  start_date: string
  end_date: string
  is_active: boolean
  auto_renew: boolean
}

interface VoucherData {
  id: string
  code: string
  discount_percentage: number
  valid_until: string
  is_used: boolean
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic access to FoodieX',
    price: 0,
    period: 'forever',
    icon: Star,
    color: '#6B7280',
    features: [
      'Order from all restaurants',
      'Standard delivery fees',
      'View restaurant menus',
      'Rate restaurants',
      'Basic support'
    ]
  },
  {
    id: 'silver',
    name: 'Silver',
    description: 'Great for regular foodies',
    price: 99,
    period: 'month',
    icon: Award,
    color: '#94A3B8',
    badge: 'Popular',
    is_popular: true,
    features: [
      'Everything in Free',
      'Free delivery on orders above ₹99',
      '5% cashback on every order',
      'Priority support',
      'Exclusive offers'
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'Premium dining experience',
    price: 299,
    period: 'month',
    icon: Crown,
    color: '#F59E0B',
    badge: 'Best Value',
    features: [
      'Everything in Silver',
      'Free delivery on all orders (no minimum)',
      '10% cashback on every order',
      'Priority delivery',
      'Exclusive restaurant access',
      'Birthday special offers',
      'Guest dining passes'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    description: 'The ultimate foodie experience',
    price: 999,
    period: 'year',
    icon: Zap,
    color: '#8B5CF6',
    badge: 'Premium',
    features: [
      'Everything in Gold',
      '20% cashback on every order',
      'Free delivery worldwide',
      'VIP restaurant tables',
      'Personal food concierge',
      'Exclusive tasting events',
      'Celebrity chef masterclasses',
      'Food festival passes'
    ]
  }
]

// FAQ Data
const faqs = [
  {
    q: 'How do I subscribe to a plan?',
    a: 'Simply click on the "Subscribe Now" button on your preferred plan. Follow the payment process to complete your subscription.'
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, you can cancel your subscription at any time from your account settings. You\'ll continue to enjoy benefits until the end of your billing cycle.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major credit/debit cards, UPI, and net banking. You can also use your FoodieX wallet.'
  },
  {
    q: 'Is there a free trial available?',
    a: 'Yes! New users get a 7-day free trial of the Silver plan. No commitment required.'
  }
]

export const SubscriptionPlansPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Fetch current subscription
  const { data: subscriptionData, refetch: refetchSubscription } = useQuery<SubscriptionData>({
    queryKey: ['current-subscription'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/current/')
      return response.data.data
    },
    enabled: false, // Disabled for now - will be enabled when backend is ready
  })

  // Fetch vouchers
  const { data: vouchers = [] } = useQuery<VoucherData[]>({
    queryKey: ['customer-vouchers'],
    queryFn: async () => {
      const response = await api.get('/customers/vouchers/')
      return response.data.data || []
    },
    enabled: false, // Disabled for now
  })

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.post('/subscriptions/subscribe/', { plan: planId })
      return response.data
    },
    onSuccess: () => {
      toast.success('🎉 Subscription activated successfully!')
      refetchSubscription()
      setSelectedPlan(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to subscribe')
    },
  })

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      toast('You are already on the Free plan')
      return
    }
    
    setSelectedPlan(planId)
    setIsProcessing(true)
    
    try {
      await subscribeMutation.mutateAsync(planId)
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const isCurrentPlan = (planId: string) => {
    return subscriptionData?.plan?.toLowerCase() === planId
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            Upgrade to premium and enjoy exclusive benefits, free delivery, and amazing cashback rewards.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const isSelected = selectedPlan === plan.id
            const isCurrent = isCurrentPlan(plan.id)
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all overflow-hidden ${
                  plan.is_popular ? 'border-[#E63946] shadow-xl' : 'border-gray-100'
                } ${isSelected ? 'ring-2 ring-[#E63946]' : ''}`}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0 bg-[#E63946] text-white text-xs font-semibold px-4 py-1 rotate-45 translate-x-8 translate-y-2">
                    POPULAR
                  </div>
                )}
                
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className={`p-2 rounded-xl ${
                        plan.is_popular ? 'bg-[#E63946]/10' : 'bg-gray-100'
                      }`}
                      style={{ color: plan.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{plan.name}</h3>
                      <p className="text-xs text-gray-500">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-800">{formatCurrency(plan.price)}</span>
                    <span className="text-sm text-gray-500">/{plan.period}</span>
                    {plan.discount && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Save {plan.discount}%
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-[#E63946] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-gray-400 pl-6">
                        +{plan.features.length - 4} more benefits
                      </li>
                    )}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isProcessing || isCurrent || plan.id === 'free'}
                    className={`w-full py-2.5 rounded-xl font-semibold transition ${
                      isCurrent || plan.id === 'free'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#E63946] text-white hover:bg-[#C62828] shadow-lg'
                        : 'bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white hover:shadow-lg'
                    }`}
                  >
                    {isProcessing && isSelected ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : isCurrent ? (
                      'Current Plan ✓'
                    ) : plan.id === 'free' ? (
                      'Free Plan'
                    ) : (
                      'Subscribe Now'
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Compare Plans Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="text-[#E63946] hover:underline font-medium flex items-center gap-1 mx-auto"
          >
            {showCompare ? 'Hide Comparison' : 'Compare All Plans'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Table */}
        {showCompare && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-x-auto"
          >
            <table className="w-full bg-white rounded-2xl shadow-lg border border-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {['Free Delivery', 'Cashback', 'Priority Support', 'Exclusive Offers', 'VIP Access', 'Personal Concierge'].map((feature) => (
                  <tr key={feature}>
                    <td className="px-4 py-3 text-sm text-gray-600">{feature}</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-center">
                        {plan.features.some(f => f.includes(feature) || feature.includes(f)) ? (
                          <Check className="w-5 h-5 text-[#E63946] mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold text-center mb-8">Membership Benefits</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <p className="font-semibold">Free Delivery</p>
              <p className="text-sm text-white/70">On orders above ₹99</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6" />
              </div>
              <p className="font-semibold">Exclusive Offers</p>
              <p className="text-sm text-white/70">Members-only discounts</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <p className="font-semibold">Priority Support</p>
              <p className="text-sm text-white/70">24/7 dedicated assistance</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="font-semibold">Cashback Rewards</p>
              <p className="text-sm text-white/70">Up to 20% cashback</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <h3 className="font-semibold text-gray-800 text-left">{faq.q}</h3>
                  {expandedFaq === idx ? (
                    <Minus className="w-5 h-5 text-[#E63946] flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-[#E63946] flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-sm text-gray-500">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-emerald-500" />
            Secure Payments
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Heart className="w-4 h-4 text-red-500" />
            10K+ Happy Customers
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Star className="w-4 h-4 text-yellow-500" />
            4.8/5 Average Rating
          </div>
        </div>
      </div>
    </div>
  )
}