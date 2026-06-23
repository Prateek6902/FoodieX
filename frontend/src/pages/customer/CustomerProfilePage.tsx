import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Calendar, 
  RefreshCw, Edit, Save, X, CheckCircle,
  Shield, Award, Star, ShoppingBag
} from 'lucide-react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

interface CustomerProfile {
  id: string
  email: string
  full_name: string
  mobile_number: string
  profile_picture?: string
  first_name: string
  last_name: string
  username: string
  role: string
  is_verified: boolean
  created_at: string
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export const CustomerProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    mobile_number: ''
  })

  const { data: profile, refetch } = useQuery<CustomerProfile>({
    queryKey: ['customer-profile'],
    queryFn: async () => {
      const response = await api.get('/customers/profile/')
      return response.data.data
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/customers/update-profile/', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
      refetch()
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })

  const handleEdit = () => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        mobile_number: profile.mobile_number || ''
      })
    }
    setIsEditing(true)
  }

  const handleSave = () => {
    updateProfile.mutate(profileData)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-white/80">Manage your personal information</p>
            </div>
            <button 
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {profile.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{profile.full_name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500">{profile.email}</span>
                      {profile.is_verified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={updateProfile.isPending}
                        className="px-4 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {updateProfile.isPending ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="mt-1 w-full px-3 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
                    placeholder="First Name"
                  />
                ) : (
                  <p className="font-medium text-gray-800 mt-1">{profile.full_name}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </p>
                <p className="font-medium text-gray-800 mt-1">{profile.email}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Mobile Number
                </p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.mobile_number}
                    onChange={(e) => setProfileData({ ...profileData, mobile_number: e.target.value })}
                    className="mt-1 w-full px-3 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946]"
                    placeholder="Mobile Number"
                  />
                ) : (
                  <p className="font-medium text-gray-800 mt-1">{profile.mobile_number || 'Not provided'}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined
                </p>
                <p className="font-medium text-gray-800 mt-1">{formatDate(profile.created_at)}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Role
                </p>
                <p className="font-medium text-gray-800 mt-1 capitalize">{profile.role}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Username
                </p>
                <p className="font-medium text-gray-800 mt-1">{profile.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-lg font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Reviews</p>
                <p className="text-lg font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-lg font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Addresses</p>
                <p className="text-lg font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}