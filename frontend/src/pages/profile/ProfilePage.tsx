import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { motion } from 'framer-motion'
import { 
  Mail, Phone, User, Calendar, Award, Edit2, 
  Save, X, MapPin, Briefcase, Clock, CheckCircle,
  Camera, Globe, Twitter, Linkedin, Github,
  ShoppingBag, DollarSign, Star, Settings, LogOut,
  Shield, CreditCard, Heart, Bell, MessageSquare,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

interface ProfileFormData {
  first_name: string
  last_name: string
  mobile_number: string
  phone_number: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
}

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    mobile_number: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  })

  // Load user data into form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        mobile_number: user.mobile_number || user.phone_number || '',
        phone_number: user.phone_number || user.mobile_number || '',
        address: user.address || user.address_line1 || '',
        city: user.city || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        country: user.country || 'India',
      })
    }
  }, [user])

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'January 2024'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long'
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await api.put('/users/update-profile/', formData)
      if (response.data.success) {
        // Update the user in the store
        updateUser({
          first_name: formData.first_name,
          last_name: formData.last_name,
          mobile_number: formData.mobile_number,
          phone_number: formData.phone_number,
          address: formData.address,
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          full_name: `${formData.first_name} ${formData.last_name}`.trim()
        })
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        toast.error(response.data.message || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }

  const displayName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email?.split('@')[0] || 'User'
  const userPhone = user?.mobile_number || user?.phone_number

  // Format full address for display
  const getFullAddress = () => {
    const parts = [
      user?.address || user?.address_line1,
      user?.city,
      user?.state,
      user?.postal_code,
      user?.country
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Not provided'
  }

  const stats = [
    { label: 'Total Orders', value: '24', icon: ShoppingBag, color: 'orange' },
    { label: 'Total Spent', value: '₹4,567', icon: DollarSign, color: 'green' },
    { label: 'Reviews', value: '12', icon: Star, color: 'yellow' },
    { label: 'Member Since', value: formatDate(user?.created_at), icon: Calendar, color: 'blue' },
  ]

  const quickActions = [
    { label: 'Settings', icon: Settings, href: '/settings', color: 'gray' },
    { label: 'Security', icon: Shield, href: '/security', color: 'blue' },
    { label: 'Wallet', icon: CreditCard, href: '/wallet', color: 'green' },
    { label: 'Wishlist', icon: Heart, href: '/wishlist', color: 'red' },
    { label: 'Notifications', icon: Bell, href: '/notifications', color: 'purple' },
    { label: 'Messages', icon: MessageSquare, href: '/chat', color: 'teal' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-white/70">Manage your personal information</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] h-24"></div>
            <div className="text-center px-6 pb-6 relative">
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#FF9F1C] to-[#2EC4B6] flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg mx-auto -mt-14">
                  {getInitials(displayName)}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-[#FF9F1C] rounded-full text-white shadow-md hover:scale-110 transition">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-3">{displayName}</h2>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full text-xs text-green-700 mt-1">
                <CheckCircle className="w-3 h-3" />
                Verified Account
              </div>
              <p className="text-sm text-[#FF9F1C] mt-2 font-medium">{user?.role?.toUpperCase() || 'USER'}</p>
            </div>

            <div className="border-t border-gray-100 p-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{userPhone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Joined {formatDate(user?.created_at)}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition">
                    <div className={`w-10 h-10 rounded-full bg-${stat.color}-100 flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-5 h-5 text-${stat.color}-500`} />
                    </div>
                    <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9F1C]"
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      placeholder="Country"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF9F1C] to-[#FFBF69] text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-[#FF9F1C]" />
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-gray-800">{displayName || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-[#FF9F1C]" />
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="text-gray-800">{userPhone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-[#FF9F1C]" />
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="text-gray-800">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-[#FF9F1C]" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-gray-800">{getFullAddress()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.label}
                      onClick={() => window.location.href = action.href}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                    >
                      <Icon className="w-5 h-5 text-gray-500 group-hover:text-[#FF9F1C] transition" />
                      <span className="text-sm text-gray-700">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect Socially</h3>
              <div className="flex gap-3">
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                  <Globe className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                  <Twitter className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                  <Github className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                  <Linkedin className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}