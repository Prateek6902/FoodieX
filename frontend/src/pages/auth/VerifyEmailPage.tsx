import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Mail, RefreshCw, Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'

const API_URL = 'http://localhost:8000/api'

export const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [email, setEmail] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')

  useEffect(() => {
    // Get email from location state or localStorage
    const stateEmail = (location.state as any)?.email
    const storedEmail = localStorage.getItem('verification_email')
    if (stateEmail) {
      setEmail(stateEmail)
      localStorage.setItem('verification_email', stateEmail)
    } else if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [location])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email/`, {
        email: email,
        otp_code: otpCode
      })

      if (response.data.success) {
        setVerificationStatus('success')
        toast.success('🎉 Email verified successfully!')
        
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
            navigate('/login')
          }, 2000)
        }
      } else {
        setVerificationStatus('error')
        toast.error(response.data.message || 'Verification failed')
      }
    } catch (error: any) {
      setVerificationStatus('error')
      toast.error(error.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    
    setResendLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp/`, {
        email: email,
        type: 'email_verification'
      })

      if (response.data.success) {
        setCountdown(60)
        toast.success('Verification code resent!')
        setVerificationStatus('pending')
        setOtp(['', '', '', '', '', ''])
      } else {
        toast.error(response.data.message || 'Failed to resend OTP')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1D3557] to-[#457B9D] rounded-2xl flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1D3557]">FoodieX</h1>
                <p className="text-xs text-[#457B9D]">Verify your email</p>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Verify Your Email 📧</h2>
            <p className="text-gray-500 text-sm mt-1">
              We've sent a verification code to
            </p>
            <p className="text-[#E63946] font-semibold mt-1 text-sm">{email || 'your email address'}</p>
          </div>

          {verificationStatus === 'pending' && (
            <>
              <div className="bg-[#1D3557]/5 rounded-xl p-4 text-center mb-6 border border-[#1D3557]/10">
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E63946]" />
                  Enter the 6-digit verification code
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 transition-all bg-gray-50"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#E63946] to-[#C62828] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                <span>Verify Email</span>
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleResendOTP}
                    disabled={resendLoading || countdown > 0}
                    className="text-[#E63946] font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    {resendLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </button>
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
            </>
          )}

          {verificationStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified! 🎉</h2>
              <p className="text-gray-500 mb-6">
                Your email has been successfully verified. Redirecting...
              </p>
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </motion.div>
          )}

          {verificationStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
              <p className="text-gray-500 mb-6">
                Invalid or expired verification code. Please try again.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setVerificationStatus('pending')
                    setOtp(['', '', '', '', '', ''])
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#E63946] to-[#C62828] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={handleResendOTP}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:border-[#1D3557] transition-all"
                >
                  Resend OTP
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 hover:text-[#E63946] transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Add missing User and ArrowRight icons if not already imported
const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)