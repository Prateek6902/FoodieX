import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-[#132A13]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4F772D]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full px-3 py-2 border rounded-lg transition-all duration-200",
              "bg-white border-[#90A955] focus:border-[#31572C] focus:ring-2 focus:ring-[#31572C]/20",
              "placeholder:text-[#4F772D]/50 text-[#132A13]",
              icon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4F772D]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'