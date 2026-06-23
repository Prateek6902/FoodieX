import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { cn } from '../../lib/utils'

interface RestaurantSkeletonProps {
  viewMode?: 'grid' | 'list'
}

export const RestaurantSkeleton = ({ viewMode = 'grid' }: RestaurantSkeletonProps) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <GlassCard className="p-4">
          <div className="flex gap-4">
            {/* Image Skeleton */}
            <div className="w-32 h-32 rounded-lg bg-white/5 animate-pulse" />
            
            {/* Content Skeleton */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
                  <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    )
  }

  // Grid view skeleton
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <GlassCard className="overflow-hidden">
        {/* Image Skeleton */}
        <div className="h-48 bg-gradient-to-br from-white/5 to-white/0 animate-pulse" />
        
        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-3">
              <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}