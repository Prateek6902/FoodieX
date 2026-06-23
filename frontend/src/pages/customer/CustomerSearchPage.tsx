// pages/customer/CustomerSearchPage.tsx

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, X, Mic, Filter, Star, MapPin, 
  Clock, DollarSign, Store, UtensilsCrossed,
  Pizza, Coffee, Cake, Beef, Leaf, 
  TrendingUp, Clock as ClockIcon, Award,
  ChevronRight, ChevronDown, Sliders,
  Grid3x3, List, Zap, Heart, Share2
} from 'lucide-react'
import { api } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'

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
  cover_image?: string
  description?: string
  has_delivery?: boolean
  has_takeaway?: boolean
  has_dining?: boolean
  is_veg?: boolean
  is_featured?: boolean
  is_offering?: boolean
  discount?: string
  eta?: string
}

interface SearchSuggestion {
  id: string
  name: string
  type: 'restaurant' | 'cuisine' | 'dish'
  image?: string
  count?: number
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

export const CustomerSearchPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All')
  const [selectedDietary, setSelectedDietary] = useState<string>('All')
  const [selectedSort, setSelectedSort] = useState<string>('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch restaurants
  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ['search-restaurants', debouncedSearch, selectedCuisine, selectedDietary],
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
      return restaurantsData.map((r, index) => ({
        ...r,
        cover_image: r.logo_url || `https://images.unsplash.com/photo-${1517248135467 + index}-4c7edcad34c4?w=600&h=300&fit=crop`,
        has_delivery: true,
        has_takeaway: index % 2 === 0,
        has_dining: index % 3 === 0,
        is_veg: index % 4 === 0,
        is_featured: index % 3 === 0,
        is_offering: index % 2 === 0,
        discount: index % 2 === 0 ? `${10 + (index % 20)}% OFF` : undefined,
        eta: `${15 + (index % 30)}-${25 + (index % 20)} min`,
      }))
    },
  })

  // Filter and sort restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = 
      restaurant.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(debouncedSearch.toLowerCase())
    
    const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine_type?.toLowerCase().includes(selectedCuisine.toLowerCase())
    const matchesDietary = selectedDietary === 'All' || 
      (selectedDietary === 'Pure Veg' && restaurant.is_veg) ||
      (selectedDietary === 'Non-Veg' && !restaurant.is_veg)
    
    return matchesSearch && matchesCuisine && matchesDietary
  })

  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    switch (selectedSort) {
      case 'rating':
        return toNumber(b.rating) - toNumber(a.rating)
      case 'delivery':
        return (a.eta || '').localeCompare(b.eta || '')
      case 'price':
        return toNumber(a.delivery_charge) - toNumber(b.delivery_charge)
      default:
        return 0
    }
  })

  // Search suggestions
  const searchSuggestions: SearchSuggestion[] = [
    { id: '1', name: 'Pizza', type: 'dish', count: 45 },
    { id: '2', name: 'Burger', type: 'dish', count: 32 },
    { id: '3', name: 'Sushi', type: 'dish', count: 28 },
    { id: '4', name: 'North Indian', type: 'cuisine', count: 56 },
    { id: '5', name: 'Italian', type: 'cuisine', count: 38 },
    { id: '6', name: 'The Burger House', type: 'restaurant' },
    { id: '7', name: 'Pizza Palace', type: 'restaurant' },
    { id: '8', name: 'Sushi World', type: 'restaurant' },
  ]

  // Trending searches
  const trendingSearches = ['Pizza', 'Burger', 'Sushi', 'Biryani', 'Tacos', 'Pasta', 'Ice Cream', 'Coffee']

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  // Save recent search
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Voice search
  const handleVoiceSearch = () => {
    setIsListening(true)
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = false
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setSearchQuery(transcript)
        setIsListening(false)
        saveRecentSearch(transcript)
      }
      
      recognition.onerror = () => {
        setIsListening(false)
        toast.error('Voice search failed. Please try typing.')
      }
      
      recognition.start()
    } else {
      toast.error('Voice search is not supported in your browser')
      setIsListening(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    saveRecentSearch(query)
  }

  const clearSearch = () => {
    setSearchQuery('')
    searchInputRef.current?.focus()
  }

  const cuisineTypes = ['All', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Fast Food']
  const dietaryOptions = ['All', 'Pure Veg', 'Non-Veg']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for restaurants, cuisines, or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {}}
                className="w-full pl-10 pr-24 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={handleVoiceSearch}
                  className={`p-1.5 rounded-full transition ${
                    isListening ? 'bg-[#E63946] text-white animate-pulse' : 'hover:bg-gray-100 text-gray-400'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl transition ${
                showFilters ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Search Indicator */}
          {isListening && (
            <div className="mt-2 flex items-center gap-2 text-sm text-[#E63946]">
              <span className="w-2 h-2 bg-[#E63946] rounded-full animate-pulse"></span>
              Listening... Speak now
            </div>
          )}

          {/* Search Suggestions */}
          <AnimatePresence>
            {searchQuery && !isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                {searchSuggestions
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSearch(suggestion.name)}
                      className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">
                          {suggestion.type === 'restaurant' ? '🏪' : 
                           suggestion.type === 'cuisine' ? '🍽️' : '🍲'}
                        </span>
                        <span className="text-gray-700">{suggestion.name}</span>
                        {suggestion.count && (
                          <span className="text-xs text-gray-400">({suggestion.count})</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-100 shadow-sm"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {cuisineTypes.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => setSelectedCuisine(cuisine)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          selectedCuisine === cuisine
                            ? 'bg-[#E63946] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dietary</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {dietaryOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedDietary(option)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          selectedDietary === option
                            ? 'bg-[#E63946] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">{sortedRestaurants.length} results</span>
                <div className="flex gap-2">
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Rating</option>
                    <option value="delivery">Delivery Time</option>
                    <option value="price">Price</option>
                  </select>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition ${
                        viewMode === 'grid' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition ${
                        viewMode === 'list' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Searches & Trending */}
      {!searchQuery && !showFilters && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-[#E63946] hover:text-[#E63946] transition flex items-center gap-2"
                  >
                    <span>{search}</span>
                    <X 
                      className="w-3 h-3 text-gray-400 hover:text-red-500" 
                      onClick={(e) => {
                        e.stopPropagation()
                        const updated = recentSearches.filter(s => s !== search)
                        setRecentSearches(updated)
                        localStorage.setItem('recentSearches', JSON.stringify(updated))
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#E63946]" />
              Trending Now
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {trendingSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(item)}
                  className="p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {['🍕', '🍔', '🍣', '🍛', '🌮', '🍝', '🍦', '☕'][index]}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-[#E63946] transition">{item}</p>
                      <p className="text-xs text-gray-400">Trending</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : searchQuery && sortedRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800">No results found</h3>
            <p className="text-gray-500 text-sm mt-2">
              We couldn't find any restaurants matching "{searchQuery}"
            </p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCuisine('All')
                setSelectedDietary('All')
              }}
              className="mt-4 px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (searchQuery || showFilters) && sortedRestaurants.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                {sortedRestaurants.length} {sortedRestaurants.length === 1 ? 'restaurant' : 'restaurants'} found
              </p>
            </div>
            
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
            }>
              {sortedRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition cursor-pointer group"
                  onClick={() => navigate(`/customer/restaurants/${restaurant.id}`)}
                >
                  <div className="relative h-40 bg-gray-200">
                    <img 
                      src={restaurant.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop'
                      }}
                    />
                    {restaurant.is_offering && restaurant.discount && (
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
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      {renderStars(restaurant.rating)}
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
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                      <span>💰 {toNumber(restaurant.delivery_charge).toFixed(2)} delivery</span>
                      <span>•</span>
                      <span>{restaurant.eta || '30-40 min'}</span>
                      <span>•</span>
                      <span>{restaurant.city}</span>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
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
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}