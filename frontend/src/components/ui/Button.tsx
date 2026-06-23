import { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'default'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean  // Changed from 'loading' to 'isLoading'
  icon?: React.ReactNode
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-gradient-to-r from-[#31572C] to-[#4F772D] text-white hover:shadow-lg hover:from-[#4F772D] hover:to-[#31572C]',
  secondary: 'bg-gradient-to-r from-[#90A955] to-[#ECF39E] text-[#132A13] hover:shadow-lg',
  outline: 'border-2 border-[#31572C] text-[#31572C] hover:bg-[#31572C] hover:text-white transition-all',
  ghost: 'text-[#4F772D] hover:bg-[#ECF39E] hover:text-[#132A13] transition-colors',
  danger: 'bg-red-500 text-white hover:bg-red-600 transition-colors',
  success: 'bg-gradient-to-r from-[#4F772D] to-[#90A955] text-white hover:shadow-lg',
  default: 'bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 rounded-lg',
  lg: 'px-6 py-3 rounded-xl text-lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'default',
  size = 'md',
  isLoading = false,  // Changed from 'loading' to 'isLoading'
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'font-medium transition-all duration-200 flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props as MotionProps}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button