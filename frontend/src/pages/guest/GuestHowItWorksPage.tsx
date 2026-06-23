// pages/guest/GuestHowItWorksPage.tsx

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Smartphone, Search, ShoppingBag, Truck, 
  Star, Heart, Clock, Shield, CreditCard,
  Users, Award, Zap, Coffee
} from 'lucide-react'

export const GuestHowItWorksPage = () => {
  const navigate = useNavigate()

  const steps = [
    {
      icon: <Search className="w-8 h-8 text-[#E63946]" />,
      title: 'Find Your Food',
      description: 'Browse through hundreds of restaurants and cuisines to find what you crave.',
      details: 'Search by cuisine, restaurant name, or dish type. Filter by ratings, price, and delivery time.'
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-[#E63946]" />,
      title: 'Place Your Order',
      description: 'Add items to your cart and customize your order with special instructions.',
      details: 'Choose from delivery, takeaway, or dining options. Apply coupons for extra savings.'
    },
    {
      icon: <Truck className="w-8 h-8 text-[#E63946]" />,
      title: 'Track Delivery',
      description: 'Follow your order in real-time from preparation to delivery.',
      details: 'Get live updates on your order status. Track your delivery partner on the map.'
    },
    {
      icon: <Star className="w-8 h-8 text-[#E63946]" />,
      title: 'Enjoy & Review',
      description: 'Rate your experience and help others make better choices.',
      details: 'Earn rewards for reviews. Build your foodie reputation in the community.'
    }
  ]

  const benefits = [
    { icon: <Clock className="w-6 h-6" />, title: 'Fast Delivery', desc: 'Get your food delivered in 30-45 minutes' },
    { icon: <Shield className="w-6 h-6" />, title: 'Secure Payments', desc: 'Multiple payment options with secure checkout' },
    { icon: <Heart className="w-6 h-6" />, title: 'Top Quality', desc: 'Handpicked restaurants with verified ratings' },
    { icon: <Award className="w-6 h-6" />, title: 'Best Offers', desc: 'Exclusive discounts and loyalty rewards' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">How FoodieX Works</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Ordering food has never been easier. Follow these simple steps and enjoy delicious meals at your doorstep.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[#E63946]">Step {index + 1}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{index + 1}/4</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{step.description}</p>
                  <p className="text-gray-400 text-xs mt-2">{step.details}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose FoodieX?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl hover:bg-gray-50 transition"
              >
                <div className="w-14 h-14 rounded-full bg-[#E63946]/10 flex items-center justify-center mx-auto mb-4 text-[#E63946]">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{benefit.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#E63946] to-[#C62828] rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Join thousands of happy customers and experience the best food delivery service.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-white text-[#E63946] rounded-xl font-semibold hover:shadow-xl transition"
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  )
}