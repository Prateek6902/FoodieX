// pages/guest/GuestHomePage.tsx

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRight, Store, ShoppingBag, Truck, 
  Clock, Star, Users, Award, Shield,UserPlus,
  CreditCard, Smartphone, Coffee, Pizza,
  UtensilsCrossed, Crown, Zap, Sparkles
} from 'lucide-react'

export const GuestHomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Store,
      title: '500+ Restaurants',
      description: 'Discover the best restaurants in your city',
      color: 'text-[#E63946]',
      bg: 'bg-red-50'
    },
    {
      icon: ShoppingBag,
      title: 'Quick Delivery',
      description: 'Food delivered in 30-45 minutes',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: Star,
      title: '4.8 Avg Rating',
      description: 'Trusted by thousands of customers',
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      icon: Award,
      title: 'Best Offers',
      description: 'Exclusive discounts and deals',
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ]

  const steps = [
    {
      icon: <Store className="w-8 h-8 text-[#E63946]" />,
      title: 'Browse Restaurants',
      description: 'Explore restaurants and cuisines',
      number: '01'
    },
    {
      icon: <ShoppingBag className="w-8 h-8 text-[#E63946]" />,
      title: 'Order Your Food',
      description: 'Add items and customize your order',
      number: '02'
    },
    {
      icon: <Truck className="w-8 h-8 text-[#E63946]" />,
      title: 'Track Delivery',
      description: 'Track your order in real-time',
      number: '03'
    },
    {
      icon: <UtensilsCrossed className="w-8 h-8 text-[#E63946]" />,
      title: 'Enjoy Your Meal',
      description: 'Rate and review your experience',
      number: '04'
    }
  ]

  const stats = [
    { value: '500+', label: 'Restaurants' },
    { value: '10K+', label: 'Daily Orders' },
    { value: '4.8', label: 'Avg Rating' },
    { value: '50+', label: 'Cities' },
  ]

  const cuisineTypes = [
    { icon: '🍕', name: 'Pizza', count: '120+' },
    { icon: '🍔', name: 'Burgers', count: '80+' },
    { icon: '🍣', name: 'Sushi', count: '60+' },
    { icon: '🌮', name: 'Tacos', count: '90+' },
    { icon: '🍝', name: 'Pasta', count: '70+' },
    { icon: '🥗', name: 'Salads', count: '50+' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D3557] to-[#457B9D] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-8xl">🍔</div>
          <div className="absolute bottom-20 right-20 text-8xl">🍕</div>
          <div className="absolute top-40 right-40 text-6xl">🌮</div>
          <div className="absolute bottom-40 left-20 text-6xl">🍣</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm mb-4">
                <Zap className="w-4 h-4 inline mr-1" />
                Order food online
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Delicious Food <br />
                <span className="text-[#E63946]">Delivered to You</span>
              </h1>
              <p className="text-white/80 text-lg mb-8 max-w-lg">
                Discover the best restaurants in your city. Order food online and get it delivered to your doorstep in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-[#E63946] text-white rounded-xl font-semibold hover:bg-[#C62828] transition shadow-lg flex items-center justify-center gap-2 group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>
                <button
                  onClick={() => navigate('/restaurants')}
                  className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition backdrop-blur-sm flex items-center justify-center gap-2"
                >
                  <Store className="w-5 h-5" />
                  Browse Restaurants
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#E63946] flex items-center justify-center text-2xl">
                    🍔
                  </div>
                  <div>
                    <p className="font-semibold">Featured Restaurant</p>
                    <p className="text-sm text-white/60">The Burger House</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">4.8</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Cheese Burger', 'Chicken Burger', 'Veg Burger', 'Fries'].map((item) => (
                    <div key={item} className="bg-white/5 rounded-lg p-3 text-center hover:bg-white/10 transition">
                      <p className="text-sm font-medium">{item}</p>
                      <p className="text-xs text-white/50">$9.99</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                  <span>⏰ 20-30 min</span>
                  <span>🚚 Free delivery</span>
                  <span className="text-green-400">● Open now</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-[#1D3557]">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
            <p className="text-gray-500 mt-2">Order food in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100 hover:shadow-xl transition group"
              >
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#E63946] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Why Choose FoodieX?</h2>
            <p className="text-gray-500 mt-2">We make food delivery simple and enjoyable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition group"
              >
                <div className={`${feature.bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Explore Cuisines</h2>
            <p className="text-gray-500 mt-2">Find your favorite food</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cuisineTypes.map((cuisine, index) => (
              <motion.button
                key={cuisine.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate('/restaurants')}
                className="bg-white rounded-2xl p-4 text-center shadow-lg border border-gray-100 hover:shadow-xl transition group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition">{cuisine.icon}</div>
                <p className="font-medium text-gray-800 text-sm">{cuisine.name}</p>
                <p className="text-xs text-gray-400">{cuisine.count}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience FoodieX?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers and order your favorite food today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-[#E63946] text-white rounded-xl font-semibold hover:bg-[#C62828] transition shadow-lg flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/restaurants')}
              className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              Browse Restaurants
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}