// pages/guest/GuestRestaurantsPage.tsx

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Search, Star, MapPin, Clock, DollarSign, 
  Store, Filter, ChevronRight, Heart,
  Leaf, Award, Zap, UtensilsCrossed
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

interface Restaurant {
  id: string
  name: string
  cuisine_type: string
  city: string
  rating: number | string
  delivery_charge: number | string
  minimum_order_amount: number | string
  is_active: boolean
  logo_url?: string
  has_delivery?: boolean
  has_takeaway?: boolean
  has_dining?: boolean
  is_veg?: boolean
  is_featured?: boolean
  is_offering?: boolean
  discount?: string
  eta?: string
}

const toNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

const renderStars = (rating: number | string): JSX.Element => {
  const ratingNum = toNumber(rating)
  const fullStars = Math.floor(ratingNum)
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-600">{ratingNum.toFixed(1)}</span>
    </div>
  )
}

export const GuestRestaurantsPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('All')

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['guest-restaurants'],
    queryFn: async () => {
      const response = await api.get('/restaurants/')
      let restaurantsData: Restaurant[] = []
      if (Array.isArray(response.data)) {
        restaurantsData = response.data
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        restaurantsData = response.data.results
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        restaurantsData = response.data.data
      }
      return restaurantsData.slice(0, 12).map((r, index) => ({
        ...r,
        is_featured: index % 3 === 0,
        is_offering: index % 2 === 0,
        discount: index % 2 === 0 ? `${10 + (index % 20)}% OFF` : undefined,
        eta: `${15 + (index % 30)}-${25 + (index % 20)} min`,
        has_delivery: true,
        has_takeaway: index % 2 === 0,
        has_dining: index % 3 === 0,
        is_veg: index % 4 === 0,
      }))
    },
  })

  const cuisineTypes = ['All', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Fast Food']

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = 
      restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine_type?.toLowerCase().includes(selectedCuisine.toLowerCase())
    return matchesSearch && matchesCuisine
  })

  const handleRestaurantClick = (restaurantId: string) => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      navigate(`/customer/restaurants/${restaurantId}`)
    } else {
      // Show signup prompt
      if (confirm('Create a free account to view menu and place orders! Click OK to sign up.')) {
        navigate('/register')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Discover Restaurants</h1>
          <p className="text-gray-500">Find the best restaurants in your city</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-[#E63946]">
            <span className="bg-red-50 px-3 py-1 rounded-full">👋 Guest Mode</span>
            <span>Sign up to order food</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, or dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  selectedCuisine === cuisine 
                    ? 'bg-[#E63946] text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRestaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition group cursor-pointer"
                onClick={() => handleRestaurantClick(restaurant.id)}
              >
                <div className="relative h-48 bg-gray-200">
                  {restaurant.logo_url ? (
                    <img 
                      src={restaurant.logo_url} 
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center">
                      <Store className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  {restaurant.is_offering && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {restaurant.discount}
                    </div>
                  )}
                  {restaurant.is_featured && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="flex items-center gap-2 text-white">
                      {renderStars(restaurant.rating)}
                      <span className="text-xs text-white/80">({toNumber(restaurant.rating).toFixed(1)})</span>
                    </div>
                  </div>
                  {/* Guest lock overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-semibold text-[#1D3557] flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#E63946]" />
                      Sign up to order
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800 group-hover:text-[#E63946] transition">
                        {restaurant.name}
                      </h4>
                      <p className="text-xs text-gray-500">{restaurant.cuisine_type}</p>
                    </div>
                    {restaurant.is_veg && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-0.5">
                        <Leaf className="w-3 h-3" />
                        Veg
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>${toNumber(restaurant.delivery_charge).toFixed(2)} delivery</span>
                    <span>•</span>
                    <span>{restaurant.eta || '30-40 min'}</span>
                    <span>•</span>
                    <span>{restaurant.city}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {restaurant.has_delivery && (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">Delivery</span>
                    )}
                    {restaurant.has_takeaway && (
                      <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-xs rounded">Takeaway</span>
                    )}
                    {restaurant.has_dining && (
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-xs rounded">Dining</span>
                    )}
                  </div>
                  {/* Guest CTA */}
                  <button 
                    className="mt-3 w-full py-2 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white rounded-lg hover:shadow-lg transition text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/register')
                    }}
                  >
                    Sign up to order
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Guest CTA Banner */}
        <div className="mt-8 bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">🍔 Join FoodieX Today!</h3>
          <p className="text-white/80 text-sm mb-4">Create a free account to order food, save favorites, and get exclusive offers</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition font-medium"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}