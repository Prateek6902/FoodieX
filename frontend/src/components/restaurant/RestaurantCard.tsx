import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, Heart, Eye } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface RestaurantCardProps {
  restaurant: {
    id: string
    name: string
    description: string
    cuisine_type: string
    city: string
    state: string
    rating: number
    total_reviews: number
    is_open_now: boolean
    logo?: string
    cover_image?: string
    delivery_time?: number
    min_order?: number
  }
  viewMode?: 'grid' | 'list'
  onWishlist?: (id: string) => void
  isWishlisted?: boolean
}

export const RestaurantCard = ({ 
  restaurant, 
  viewMode = 'grid', 
  onWishlist, 
  isWishlisted = false 
}: RestaurantCardProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-500'
    if (rating >= 4.0) return 'text-emerald-500'
    if (rating >= 3.5) return 'text-yellow-500'
    return 'text-orange-500'
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-4 hover:border-primary/30 transition-all duration-300">
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
              {restaurant.logo ? (
                <img 
                  src={restaurant.logo} 
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <span className="text-3xl">🍕</span>
                </div>
              )}
              {!restaurant.is_open_now && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-xs text-white font-medium">Closed</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/restaurants/${restaurant.id}`}>
                    <h3 className="text-lg font-semibold text-white hover:text-primary transition">
                      {restaurant.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-white/40">{restaurant.cuisine_type}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onWishlist?.(restaurant.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-danger text-danger' : 'text-white/60'}`} />
                  </button>
                  <Link to={`/restaurants/${restaurant.id}`}>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Eye className="w-4 h-4 text-white/60" />
                    </button>
                  </Link>
                </div>
              </div>

              <p className="text-sm text-white/60 mt-2 line-clamp-2">
                {restaurant.description || `Experience the best ${restaurant.cuisine_type} cuisine in town.`}
              </p>

              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className={`w-4 h-4 ${getRatingColor(restaurant.rating)} fill-current`} />
                  <span className="text-sm text-white">{restaurant.rating}</span>
                  <span className="text-xs text-white/40">({restaurant.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/60">{restaurant.delivery_time || 30}-{restaurant.delivery_time ? restaurant.delivery_time + 15 : 45} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/60">{restaurant.city}, {restaurant.state}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-2">
                  {restaurant.is_open_now ? (
                    <span className="text-xs text-success">● Open Now</span>
                  ) : (
                    <span className="text-xs text-danger">● Closed</span>
                  )}
                  {restaurant.min_order && (
                    <span className="text-xs text-white/40">Min order: ${restaurant.min_order}</span>
                  )}
                </div>
                <Link to={`/restaurants/${restaurant.id}`}>
                  <Button size="sm" variant="outline">
                    View Menu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    )
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="overflow-hidden hover:border-primary/30 transition-all duration-300 group">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
          {restaurant.cover_image ? (
            <img 
              src={restaurant.cover_image} 
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <span className="text-6xl">🍕</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
              restaurant.is_open_now 
                ? 'bg-success/90 text-white' 
                : 'bg-danger/90 text-white'
            }`}>
              {restaurant.is_open_now ? 'Open Now' : 'Closed'}
            </div>
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={() => onWishlist?.(restaurant.id)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-danger text-danger' : 'text-white'}`} />
          </button>

          {/* Rating Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
            <Star className={`w-3 h-3 ${getRatingColor(restaurant.rating)} fill-current`} />
            <span className="text-xs text-white font-medium">{restaurant.rating}</span>
            <span className="text-xs text-white/60">({restaurant.total_reviews})</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Link to={`/restaurants/${restaurant.id}`}>
            <h3 className="text-lg font-semibold text-white hover:text-primary transition mb-1 line-clamp-1">
              {restaurant.name}
            </h3>
          </Link>
          
          <p className="text-sm text-white/40 mb-2">{restaurant.cuisine_type}</p>
          
          <p className="text-sm text-white/60 line-clamp-2 mb-3">
            {restaurant.description || `Experience the best ${restaurant.cuisine_type} cuisine in town.`}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/60">{restaurant.delivery_time || 30}-{restaurant.delivery_time ? restaurant.delivery_time + 15 : 45} min</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/60">{restaurant.city}</span>
              </div>
            </div>
            <Link to={`/restaurants/${restaurant.id}`}>
              <Button size="sm" variant="outline" className="text-xs">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}