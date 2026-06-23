import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  UserPlus, Mail, Lock, User, Phone, Store, Truck, 
  Users, Utensils, Headphones, Crown, Shield, Check,
  ArrowRight, Eye, EyeOff, Loader2, Sparkles,
  Coffee, Pizza, Cake, IceCream, Beef, Leaf
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  mobile_number: z.string().min(10, 'Valid mobile number required'),
  role: z.enum(['CUSTOMER', 'VENDOR', 'DELIVERY_PARTNER']),
})

type RegisterForm = z.infer<typeof registerSchema>

const roles = [
  { 
    value: 'CUSTOMER', 
    label: 'Customer', 
    icon: Users, 
    description: 'Order food from restaurants',
    color: '#E63946',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emoji: '🍽️'
  },
  { 
    value: 'VENDOR', 
    label: 'Vendor', 
    icon: Store, 
    description: 'Sell your products on our platform',
    color: '#1D3557',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    emoji: '🏪'
  },
  { 
    value: 'DELIVERY_PARTNER', 
    label: 'Delivery Partner', 
    icon: Truck, 
    description: 'Deliver food to customers',
    color: '#457B9D',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    emoji: '🚚'
  },
]

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('CUSTOMER')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CUSTOMER' },
  })

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/auth/register/', {
        email: data.email,
        username: data.username,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        mobile_number: data.mobile_number,
        role: data.role,
      })
      
      if (response.data.success) {
        toast.success('🎉 Account created successfully! Please verify your email.')
        navigate('/verify-email', { state: { email: data.email } })
      } else {
        toast.error(response.data.message || 'Registration failed')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    setValue('role', role as any)
  }

  const handleGuestBrowse = () => {
    navigate('/restaurants')
    toast.success('👋 Browsing as Guest')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1D3557]/5 via-white to-[#457B9D]/5 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E63946]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#457B9D]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating food emojis */}
        <div className="absolute top-20 left-20 text-4xl animate-bounce opacity-20">🍔</div>
        <div className="absolute bottom-20 right-20 text-4xl animate-bounce delay-300 opacity-20">🍕</div>
        <div className="absolute top-1/2 left-10 text-3xl animate-bounce delay-700 opacity-20">🌮</div>
        <div className="absolute bottom-1/3 right-10 text-3xl animate-bounce delay-500 opacity-20">🍣</div>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-5xl"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1D3557] to-[#457B9D] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">🍔</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1D3557]">FoodieX</h1>
                <p className="text-xs text-[#457B9D]">Create your account</p>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Create Your Account 🚀</h2>
            <p className="text-gray-500 text-sm mt-1">Join the FoodieX family and start your food journey</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Role Selection Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#1D3557] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E63946]" />
                Choose Your Role
              </h3>
              <div className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon
                  const isSelected = selectedRole === role.value
                  return (
                    <motion.button
                      key={role.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? `${role.bgColor} ${role.borderColor} shadow-md`
                          : 'bg-white/50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${role.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6" style={{ color: role.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold" style={{ color: isSelected ? role.color : '#1D3557' }}>
                              {role.label}
                            </p>
                            <span className="text-sm">{role.emoji}</span>
                          </div>
                          <p className="text-sm text-gray-500">{role.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#E63946] flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-gradient-to-r from-[#1D3557]/5 to-[#457B9D]/5 rounded-xl border border-[#1D3557]/10">
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-[#E63946] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#1D3557]">Why choose a role?</strong><br />
                    Different roles have different features and access levels. 
                    Choose wisely as this affects your dashboard and permissions.
                  </span>
                </p>
              </div>

              {/* Guest Button */}
              <button
                type="button"
                onClick={handleGuestBrowse}
                className="mt-4 w-full py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:border-[#1D3557] hover:text-[#1D3557] transition-all flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                <span>Continue as Guest</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Registration Form */}
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      {...register('first_name')}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50 ${
                        errors.first_name ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="John"
                    />
                    {errors.first_name && (
                      <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      {...register('last_name')}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50 ${
                        errors.last_name ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.last_name && (
                      <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('email')}
                      type="email"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50 ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('username')}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50 ${
                        errors.username ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="johndoe"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('mobile_number')}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50 ${
                        errors.mobile_number ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  {errors.mobile_number && (
                    <p className="text-xs text-red-500 mt-1">{errors.mobile_number.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50 ${
                        errors.password ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('confirm_password')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50 ${
                        errors.confirm_password ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="w-4 h-4 text-[#E63946] rounded focus:ring-[#E63946] border-gray-300" 
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the <Link to="/terms" className="text-[#E63946] hover:underline font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-[#E63946] hover:underline font-medium">Privacy Policy</Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#E63946] to-[#C62828] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  <span>Create Account</span>
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-[#E63946] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}