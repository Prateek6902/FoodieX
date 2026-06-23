// components/dashboard/StatsCard.tsx
import { motion } from 'framer-motion'
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info'
  trend?: 'up' | 'down'
  comparisonText?: string
}

const colorStyles = {
  primary: {
    bg: 'bg-orange-50',
    icon: 'text-[#FF9F1C]',
    border: 'border-orange-100',
  },
  secondary: {
    bg: 'bg-teal-50',
    icon: 'text-[#2EC4B6]',
    border: 'border-teal-100',
  },
  accent: {
    bg: 'bg-purple-50',
    icon: 'text-purple-500',
    border: 'border-purple-100',
  },
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-500',
    border: 'border-green-100',
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-500',
    border: 'border-yellow-100',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    border: 'border-blue-100',
  },
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  color = 'primary',
  trend = 'up',
  comparisonText
}: StatsCardProps) => {
  const changeValue = change ? parseFloat(change.replace('%', '').replace('+', '')) : 0
  const isPositive = changeValue > 0
  const isNegative = changeValue < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border p-6 transition-all duration-300",
        colorStyles[color].border,
        "hover:shadow-lg"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", colorStyles[color].bg)}>
          <Icon className={cn("w-6 h-6", colorStyles[color].icon)} />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            isPositive ? "bg-green-100 text-green-700" : isNegative ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
          )}>
            {isPositive && <ArrowUpRight className="w-3 h-3" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value}
        </p>
        {comparisonText && (
          <p className="text-xs text-gray-400 mt-2">{comparisonText}</p>
        )}
      </div>
    </motion.div>
  )
}