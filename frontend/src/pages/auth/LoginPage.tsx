import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Lock, Eye, EyeOff, LogIn, UserPlus, 
  ArrowRight, CheckCircle, AlertCircle, Shield,
  Facebook, Github, Apple, Smartphone, Key,
  Loader2, ArrowLeft, Send, RefreshCw,
  User, Store, Truck, UtensilsCrossed,
  Sparkles, Crown, Zap, Coffee
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'

const API_URL = 'http://localhost:8000/api'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, setLoading: setAuthLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [mode, setMode] = useState<AuthMode>('login')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [verificationOtp, setVerificationOtp] = useState(['', '', '', '', '', ''])
  
  // Form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    role: 'customer'
  })
  
  const [forgotData, setForgotData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthLoading(true)
    
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, {
        email: loginData.email,
        password: loginData.password,
      })
      
      if (response.data.success && response.data.access) {
        login(response.data.user, {
          access: response.data.access,
          refresh: response.data.refresh
        })
        
        toast.success('Welcome back! 🎉')
        
        const userRole = response.data.user.role?.toLowerCase()
        setTimeout(() => {
          if (userRole === 'super_admin' || userRole === 'admin') {
            navigate('/admin')
          } else if (userRole === 'vendor') {
            navigate('/vendor')
          } else if (userRole === 'customer') {
            navigate('/customer')
          } else if (userRole === 'delivery_partner') {
            navigate('/delivery')
          } else {
            navigate('/dashboard')
          }
        }, 100)
      } else {
        toast.error(response.data.message || 'Login failed')
      }
    } catch (error: any) {
      // Check if verification is required
      if (error.response?.data?.requires_verification) {
        setVerificationEmail(error.response.data.email || loginData.email)
        setMode('verify')
        toast.error('Please verify your email first')
      } else {
        toast.error(error.response?.data?.message || 'Invalid credentials')
      }
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (registerData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await axios.post(`${API_URL}/auth/register/`, {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        confirm_password: registerData.confirmPassword,
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        mobile_number: registerData.mobileNumber,
        role: registerData.role.toUpperCase(),
      })
      
      if (response.data.success) {
        toast.success('Account created! 🎉 Please verify your email.')
        setVerificationEmail(registerData.email)
        setMode('verify')
      } else {
        toast.error(response.data.message || 'Registration failed')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle Email Verification
  const handleVerifyEmail = async () => {
    const otpCode = verificationOtp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email/`, {
        email: verificationEmail,
        otp_code: otpCode
      })

      if (response.data.success) {
        toast.success('Email verified successfully! 🎉')
        
        if (response.data.access && response.data.user) {
          login(response.data.user, {
            access: response.data.access,
            refresh: response.data.refresh
          })
          
          setTimeout(() => {
            const userRole = response.data.user.role?.toLowerCase()
            if (userRole === 'super_admin' || userRole === 'admin') {
              navigate('/admin')
            } else if (userRole === 'vendor') {
              navigate('/vendor')
            } else {
              navigate('/dashboard')
            }
          }, 1500)
        } else {
          setTimeout(() => {
            setMode('login')
            toast.success('Email verified! Please login.')
          }, 2000)
        }
      } else {
        toast.error(response.data.message || 'Verification failed')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle Resend Verification OTP
  const handleResendVerificationOTP = async () => {
    if (countdown > 0) return
    
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp/`, {
        email: verificationEmail,
        type: 'email_verification'
      })

      if (response.data.success) {
        setCountdown(60)
        toast.success('Verification code resent!')
      } else {
        toast.error(response.data.message || 'Failed to resend code')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  // Handle Forgot Password - Send OTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password/`, {
        email: forgotData.email
      })
      
      if (response.data.success) {
        setOtpSent(true)
        setCountdown(60)
        toast.success('OTP sent to your email!')
      } else {
        toast.error(response.data.message || 'Failed to send OTP')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (forgotData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password/`, {
        email: forgotData.email,
        otp_code: forgotData.otp,
        new_password: forgotData.newPassword,
        confirm_password: forgotData.confirmPassword
      })
      
      if (response.data.success) {
        toast.success('Password reset successful! Please login.')
        setMode('login')
        setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '' })
        setOtpSent(false)
      } else {
        toast.error(response.data.message || 'Password reset failed')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle Resend Password Reset OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp/`, {
        email: forgotData.email,
        type: 'password_reset'
      })
      
      if (response.data.success) {
        setCountdown(60)
        toast.success('OTP resent successfully!')
      }
    } catch (error: any) {
      toast.error('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input change for verification
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...verificationOtp]
    newOtp[index] = value
    setVerificationOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationOtp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Social login handlers
  const handleSocialLogin = (provider: string) => {
    toast.loading(`${provider} login coming soon...`)
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1D3557]/5 rounded-full blur-3xl"></div>
        
        {/* Floating food emojis */}
        <div className="absolute top-10 left-10 text-4xl animate-bounce opacity-20">🍔</div>
        <div className="absolute bottom-20 right-20 text-4xl animate-bounce delay-300 opacity-20">🍕</div>
        <div className="absolute top-1/3 right-10 text-3xl animate-bounce delay-700 opacity-20">🌮</div>
        <div className="absolute bottom-1/3 left-10 text-3xl animate-bounce delay-500 opacity-20">🍣</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1D3557] to-[#457B9D] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">🍔</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1D3557]">FoodieX</h1>
                <p className="text-xs text-[#457B9D]">Delivering happiness</p>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800">
              {mode === 'login' && 'Welcome Back! 👋'}
              {mode === 'register' && 'Create Your Account 🚀'}
              {mode === 'forgot' && 'Forgot Password 🔑'}
              {mode === 'reset' && 'Reset Password 🔐'}
              {mode === 'verify' && 'Verify Your Email 📧'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'login' && 'Sign in to continue your food journey'}
              {mode === 'register' && 'Join the FoodieX family today'}
              {mode === 'forgot' && 'Enter your email to reset password'}
              {mode === 'reset' && 'Enter OTP and new password'}
              {mode === 'verify' && `We've sent a verification code to`}
            </p>
            {mode === 'verify' && (
              <p className="text-[#E63946] font-medium mt-1 text-sm">{verificationEmail}</p>
            )}
          </div>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition-all bg-gray-50"
                      placeholder="admin@foodiex.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition-all bg-gray-50"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loginData.rememberMe}
                      onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                      className="w-4 h-4 text-[#E63946] rounded focus:ring-[#E63946]"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-[#E63946] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#E63946] to-[#C62828] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  <span>Sign In</span>
                </button>

                {/* Guest Button */}
                <button
                  type="button"
                  onClick={handleGuestBrowse}
                  className="w-full py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:border-[#1D3557] hover:text-[#1D3557] transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  <span>Continue as Guest</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                    placeholder="johndoe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={registerData.mobileNumber}
                    onChange={(e) => setRegisterData({ ...registerData, mobileNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">I want to join as</label>
                  <select
                    value={registerData.role}
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                  >
                    <option value="customer">🍽️ Customer</option>
                    <option value="vendor">🏪 Vendor</option>
                    <option value="delivery_partner">🚚 Delivery Partner</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#E63946] to-[#C62828] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  <span>Create Account</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuestBrowse}
                  className="w-full py-3 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:border-[#1D3557] hover:text-[#1D3557] transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  <span>Continue as Guest</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* Email Verification Form */}
            {mode === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-[#1D3557]/5 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code sent to <br />
                    <span className="font-semibold text-[#1D3557]">{verificationEmail}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  {verificationOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 transition-all bg-gray-50"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyEmail}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#E63946] to-[#C62828] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  <span>Verify Email</span>
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Didn't receive the code?{' '}
                    <button
                      onClick={handleResendVerificationOTP}
                      disabled={loading || countdown > 0}
                      className="text-[#E63946] font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                  </p>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-sm text-gray-500 hover:text-[#E63946] transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && !otpSent && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleForgotPassword}
                className="space-y-5"
              >
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <p className="text-sm text-gray-600">
                    Enter your email address and we'll send you a password reset OTP.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={forgotData.email}
                      onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span>Send OTP</span>
                </button>
              </motion.form>
            )}

            {/* Reset Password Form */}
            {(mode === 'reset' || (mode === 'forgot' && otpSent)) && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
                  <p className="text-sm text-gray-600">
                    Enter the OTP sent to <span className="font-semibold">{forgotData.email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP Code
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotData.otp}
                      onChange={(e) => setForgotData({ ...forgotData, otp: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] text-center text-2xl tracking-widest bg-gray-50"
                      placeholder="000000"
                    />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-gray-500">Enter the 6-digit code sent to your email</p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={countdown > 0}
                      className="text-xs text-[#E63946] hover:underline disabled:opacity-50"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={forgotData.confirmPassword}
                      onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] bg-gray-50"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#E63946] to-[#C62828] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                  <span>Reset Password</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Social Login - Only for login mode */}
          {mode === 'login' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3.97A11.96 11.96 0 0 0 12 1C6.576 1 2.095 4.12.41 8.58l4.856 3.185Z"/>
                    <path fill="#34A853" d="M16.06 18.79A7.03 7.03 0 0 1 12 21c-3.236 0-6.054-2.008-7.154-4.893L.41 14.42A11.96 11.96 0 0 0 12 24c3.355 0 6.604-1.088 9.138-3.12l-5.078-4.09Z"/>
                    <path fill="#4A90E2" d="M21.138 20.88C22.806 19.2 24 16.66 24 14c0-1.36-.26-2.66-.73-3.87h-8.27v6.44h4.72c-.56 1.65-1.9 2.8-3.54 3.38l5.14 3.37Z"/>
                    <path fill="#FBBC05" d="M5.266 14.22A7.08 7.08 0 0 1 4.91 12c0-.77.1-1.51.27-2.24L.41 8.58a11.96 11.96 0 0 0 0 6.84l4.856-3.185Z"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleSocialLogin('Facebook')}
                  className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all"
                >
                  <Facebook className="w-5 h-5 text-[#1877F2]" />
                </button>
                <button
                  onClick={() => handleSocialLogin('Apple')}
                  className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all"
                >
                  <Apple className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center">
            {mode === 'login' && (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#E63946] font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            )}
            {(mode === 'register' || mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setOtpSent(false)
                  setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '' })
                }}
                className="text-sm text-gray-600 hover:text-[#E63946] transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            )}
          </div>

          {/* Demo credentials hint */}
          {mode === 'login' && (
            <div className="mt-4 p-3 bg-gradient-to-r from-[#1D3557]/5 to-[#457B9D]/5 rounded-xl border border-[#1D3557]/10">
              <p className="text-xs text-gray-500 text-center">
                🔑 Demo: <span className="font-mono text-[#1D3557]">admin@foodiex.com</span> / <span className="font-mono text-[#1D3557]">admin123</span>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}