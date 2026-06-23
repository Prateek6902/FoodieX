import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Truck, DollarSign, MapPin, Star, Clock, Award, CheckCircle, 
  TrendingUp, Users, Phone, Mail, MoreVertical, Eye, Edit, 
  Activity, Calendar, ThumbsUp, AlertCircle, X, ChevronRight,
  Filter, Download, RefreshCw, UserCheck, UserX, UserMinus,
  Zap, Target, Shield, Battery, Navigation, Package, CreditCard,
  Trash, Search, BarChart3
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'
import { Link } from 'react-router-dom'

// Helper function to safely convert to number
const toNumber = (value: any): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

interface DeliveryPartner {
  id: string
  full_name: string
  phone_number: string
  email: string
  vehicle_type: string
  vehicle_number: string
  total_deliveries: number
  total_earnings: number
  rating: number | string
  availability_status: string
  is_active: boolean
  verification_status: string
  on_time_delivery_rate: number | string
  acceptance_rate: number | string
  city: string
  joined_date: string
  performance_score?: number
  reliability_score?: number
  customer_satisfaction_score?: number
  attendance_score?: number
}

interface DashboardData {
  partners: {
    total: number
    active: number
    available: number
  }
  deliveries: {
    total_assignments: number
    completed: number
    pending: number
    completion_rate: number
  }
  earnings: {
    total: number
    pending: number
  }
  performance: {
    average_rating: number
    average_acceptance_rate: number
    on_time_rate: number
  }
}

interface PartnersResponse {
  data: DeliveryPartner[]
  stats?: {
    total_partners: number
    active_partners: number
    available_partners: number
  }
}

interface PerformanceData {
  data: Array<{
    week?: string
    month?: string
    deliveries: number
  }>
}

export const DeliveryDashboard = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const userRole = user?.role?.toLowerCase() || ''
  const isAdmin = userRole === 'admin' || userRole === 'super_admin'
  
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null)
  const [showPartnerModal, setShowPartnerModal] = useState<boolean>(false)
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false)
  const [statusAction, setStatusAction] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage: number = 10

  // Fetch delivery dashboard data - REAL DATA
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery<DashboardData>({
    queryKey: ['delivery-dashboard', userRole],
    queryFn: async (): Promise<DashboardData> => {
      const endpoint = isAdmin ? '/delivery/admin-dashboard/' : '/delivery/dashboard/'
      const response = await api.get(endpoint)
      return response.data.data
    },
    enabled: !!user,
  })

  // Fetch all delivery partners - REAL DATA
  const { data: allPartners, refetch: refetchPartners } = useQuery<PartnersResponse>({
    queryKey: ['all-delivery-partners'],
    queryFn: async (): Promise<PartnersResponse> => {
      const response = await api.get('/delivery/partners/')
      return response.data
    },
    enabled: isAdmin,
  })

  // Fetch top performers - REAL DATA
  const { data: topPerformers, refetch: refetchTopPerformers } = useQuery<DeliveryPartner[]>({
    queryKey: ['top-delivery-partners'],
    queryFn: async (): Promise<DeliveryPartner[]> => {
      const response = await api.get('/delivery/partners/top/?limit=10')
      return response.data.data || []
    },
    enabled: isAdmin,
  })

  // Update partner status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ partnerId, status }: { partnerId: string; status: string }) => {
      const response = await api.put(`/delivery/partners/${partnerId}/`, {
        availability_status: status
      })
      return response.data
    },
    onSuccess: (): void => {
      toast.success('Partner status updated successfully')
      refetchPartners()
      refetchTopPerformers()
      refetchDashboard()
      setShowStatusModal(false)
    },
    onError: (error: any): void => {
      toast.error(error.response?.data?.message || 'Failed to update partner status')
    },
  })

  // Delete partner mutation
  const deletePartnerMutation = useMutation({
    mutationFn: async (partnerId: string) => {
      const response = await api.delete(`/delivery/partners/${partnerId}/`)
      return response.data
    },
    onSuccess: (): void => {
      toast.success('Partner removed successfully')
      refetchPartners()
      refetchTopPerformers()
      refetchDashboard()
    },
    onError: (error: any): void => {
      toast.error(error.response?.data?.message || 'Failed to remove partner')
    },
  })

  const handleViewPartner = (partner: DeliveryPartner): void => {
    setSelectedPartner(partner)
    setShowPartnerModal(true)
  }

  const handleStatusChange = (partner: DeliveryPartner, action: string): void => {
    setSelectedPartner(partner)
    setStatusAction(action)
    setShowStatusModal(true)
  }

  const confirmStatusChange = (): void => {
    if (selectedPartner) {
      let newStatus = ''
      switch (statusAction) {
        case 'activate':
          newStatus = 'AVAILABLE'
          break
        case 'deactivate':
          newStatus = 'OFFLINE'
          break
        case 'suspend':
          newStatus = 'OFFLINE'
          break
        default:
          newStatus = 'AVAILABLE'
      }
      updateStatusMutation.mutate({ partnerId: selectedPartner.id, status: newStatus })
    }
  }

  const handleDeletePartner = (partner: DeliveryPartner): void => {
    if (confirm(`Are you sure you want to remove ${partner.full_name} from delivery partners?`)) {
      deletePartnerMutation.mutate(partner.id)
    }
  }

  // Filter partners based on search and status
  const partnersData: DeliveryPartner[] = allPartners?.data || []
  
  const filteredPartners: DeliveryPartner[] = partnersData.filter((partner: DeliveryPartner) => {
    const matchesSearch: boolean = 
      partner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.phone_number?.includes(searchTerm) ||
      partner.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus: boolean = statusFilter === 'all' || 
      (statusFilter === 'active' && partner.availability_status === 'AVAILABLE') ||
      (statusFilter === 'busy' && partner.availability_status === 'BUSY') ||
      (statusFilter === 'offline' && partner.availability_status === 'OFFLINE')
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages: number = Math.ceil(filteredPartners.length / itemsPerPage)
  const paginatedPartners: DeliveryPartner[] = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Partner status distribution
  const partners: DeliveryPartner[] = allPartners?.data || []
  const statusDistribution = {
    active: partners.filter((p: DeliveryPartner) => p.availability_status === 'AVAILABLE').length,
    busy: partners.filter((p: DeliveryPartner) => p.availability_status === 'BUSY').length,
    offline: partners.filter((p: DeliveryPartner) => p.availability_status === 'OFFLINE').length,
    inactive: partners.filter((p: DeliveryPartner) => !p.is_active).length,
  }
  const totalPartners: number = partners.length

  const getStatusBadge = (status: string): { text: string; className: string; icon: any } => {
    switch(status) {
      case 'AVAILABLE':
        return { text: 'Active', className: 'bg-green-100 text-green-700', icon: CheckCircle }
      case 'BUSY':
        return { text: 'Busy', className: 'bg-orange-100 text-orange-700', icon: Activity }
      case 'OFFLINE':
        return { text: 'Offline', className: 'bg-gray-100 text-gray-700', icon: UserX }
      default:
        return { text: status || 'Unknown', className: 'bg-gray-100 text-gray-700', icon: UserCheck }
    }
  }

  const getVerificationBadge = (status: string): { text: string; className: string } => {
    switch(status) {
      case 'APPROVED':
        return { text: 'Verified', className: 'bg-green-100 text-green-700' }
      case 'PENDING':
        return { text: 'Pending', className: 'bg-yellow-100 text-yellow-700' }
      case 'REJECTED':
        return { text: 'Rejected', className: 'bg-red-100 text-red-700' }
      default:
        return { text: status || 'Unknown', className: 'bg-gray-100 text-gray-700' }
    }
  }

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading delivery dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Delivery Partners Dashboard</h1>
              <p className="text-white/80">Overview of delivery partner performance and key insights</p>
              <p className="text-sm text-white/60 mt-1">Total Partners: {totalPartners}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { refetchDashboard(); refetchPartners(); refetchTopPerformers(); }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#E63946] rounded-lg hover:bg-[#C62828] transition shadow-lg">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#1D3557]/10 rounded-xl">
                <Users className="w-6 h-6 text-[#1D3557]" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{totalPartners}</p>
                <p className="text-sm text-gray-500">Total Partners</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-emerald-600">Active: {partners.filter(p => p.is_active).length}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{partners.reduce((sum: number, p: DeliveryPartner) => sum + (p.total_deliveries || 0), 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Deliveries</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-emerald-600">Avg: {partners.length > 0 ? Math.round(partners.reduce((sum: number, p: DeliveryPartner) => sum + (p.total_deliveries || 0), 0) / partners.length) : 0} per partner</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{partners.length > 0 ? (partners.reduce((sum: number, p: DeliveryPartner) => sum + toNumber(p.rating), 0) / partners.length).toFixed(1) : '0'}</p>
                <p className="text-sm text-gray-500">Avg. Rating</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-amber-600">out of 5 stars</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">₹{partners.reduce((sum: number, p: DeliveryPartner) => sum + (p.total_earnings || 0), 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Earnings</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-purple-600">Avg: ₹{partners.length > 0 ? Math.round(partners.reduce((sum: number, p: DeliveryPartner) => sum + (p.total_earnings || 0), 0) / partners.length).toLocaleString() : 0}</div>
          </div>
        </div>

        {/* Top Performers and Partner Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers - REAL DATA */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Top Performers
              </h2>
              <button className="text-sm text-[#E63946] hover:underline flex items-center gap-1 font-medium">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {topPerformers && topPerformers.length > 0 ? (
                topPerformers.map((partner: DeliveryPartner, idx: number) => {
                  const rankColors: string[] = ['bg-amber-500', 'bg-gray-400', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500']
                  const ratingValue: number = toNumber(partner.rating)
                  return (
                    <div key={partner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-md transition cursor-pointer" onClick={() => handleViewPartner(partner)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${rankColors[idx] || 'bg-[#1D3557]'} flex items-center justify-center text-white font-bold text-sm`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{partner.full_name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{partner.total_deliveries} deliveries</span>
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-amber-400 fill-current" />
                              <span>{ratingValue.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">₹{partner.total_earnings?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Success: {toNumber(partner.on_time_delivery_rate).toFixed(0)}%</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-400 text-center py-4">No top performers data available</p>
              )}
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-[#1D3557]/10 to-[#457B9D]/10 rounded-lg text-center">
              <p className="text-sm text-gray-700">
                🎉 Motivate your delivery partners by recognizing their achievements!
              </p>
            </div>
          </div>

          {/* Partner Status Distribution - REAL DATA */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#E63946]" />
              Partner Status
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-emerald-600">{statusDistribution.active} ({Math.round((statusDistribution.active / totalPartners) * 100) || 0}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(statusDistribution.active / totalPartners) * 100 || 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Busy</span>
                  <span className="font-semibold text-orange-600">{statusDistribution.busy} ({Math.round((statusDistribution.busy / totalPartners) * 100) || 0}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(statusDistribution.busy / totalPartners) * 100 || 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Offline</span>
                  <span className="font-semibold text-gray-600">{statusDistribution.offline} ({Math.round((statusDistribution.offline / totalPartners) * 100) || 0}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500 rounded-full" style={{ width: `${(statusDistribution.offline / totalPartners) * 100 || 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Inactive</span>
                  <span className="font-semibold text-red-600">{statusDistribution.inactive} ({Math.round((statusDistribution.inactive / totalPartners) * 100) || 0}%)</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(statusDistribution.inactive / totalPartners) * 100 || 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">Total Partners</span>
              <span className="font-bold text-[#1D3557]">{totalPartners}</span>
            </div>
          </div>
        </div>

        {/* All Delivery Partners List - REAL DATA */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E63946]" />
                All Delivery Partners
                <span className="text-sm font-normal text-gray-500">({filteredPartners.length})</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search partners..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
                <button className="px-3 py-2 text-sm bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition">
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliveries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPartners.map((partner: DeliveryPartner, idx: number) => {
                  const statusInfo = getStatusBadge(partner.availability_status)
                  const StatusIcon = statusInfo.icon
                  const verificationInfo = getVerificationBadge(partner.verification_status)
                  const ratingValue: number = toNumber(partner.rating)
                  return (
                    <motion.tr 
                      key={partner.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => handleViewPartner(partner)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center text-white font-bold text-sm">
                            {partner.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{partner.full_name}</p>
                            <p className="text-xs text-gray-500">ID: {partner.id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{partner.phone_number}</p>
                        <p className="text-xs text-gray-500">{partner.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{partner.vehicle_type}</p>
                        <p className="text-xs text-gray-500">{partner.vehicle_number}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#1D3557]">{partner.total_deliveries?.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-emerald-600">₹{partner.total_earnings?.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="font-medium">{ratingValue.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${verificationInfo.className}`}>
                          {verificationInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleViewPartner(partner)}
                            className="p-1.5 text-[#1D3557] hover:bg-[#1D3557]/10 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(partner, 'activate')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                            title="Change Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePartner(partner)}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition"
                            title="Remove Partner"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
                {filteredPartners.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-400">No delivery partners found</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPartners.length)} of {filteredPartners.length} partners
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-1.5 rounded-lg text-sm transition ${
                        currentPage === pageNum
                          ? 'bg-[#E63946] text-white shadow-md'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Partner Details Modal */}
      <AnimatePresence>
        {showPartnerModal && selectedPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPartnerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#1D3557] to-[#457B9D] px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
                <h2 className="text-xl font-bold text-white">Partner Details</h2>
                <button onClick={() => setShowPartnerModal(false)} className="p-2 rounded-lg hover:bg-white/10 transition text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center text-white font-bold text-2xl">
                    {selectedPartner.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedPartner.full_name}</h3>
                    <p className="text-gray-500">Delivery Partner since {new Date(selectedPartner.joined_date).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedPartner.availability_status).className}`}>
                        {getStatusBadge(selectedPartner.availability_status).text}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getVerificationBadge(selectedPartner.verification_status).className}`}>
                        {getVerificationBadge(selectedPartner.verification_status).text}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="font-medium">{toNumber(selectedPartner.rating).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4 text-[#E63946]" /> {selectedPartner.phone_number}</p>
                      <p className="flex items-center gap-2 text-gray-700"><Mail className="w-4 h-4 text-[#E63946]" /> {selectedPartner.email}</p>
                      <p className="flex items-center gap-2 text-gray-700"><MapPin className="w-4 h-4 text-[#E63946]" /> {selectedPartner.city}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Vehicle Details</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700"><span className="text-gray-500">Type:</span> <span className="font-medium">{selectedPartner.vehicle_type}</span></p>
                      <p className="text-gray-700"><span className="text-gray-500">Number:</span> <span className="font-medium">{selectedPartner.vehicle_number}</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-[#1D3557]">{selectedPartner.total_deliveries}</p>
                      <p className="text-xs text-gray-500">Total Deliveries</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-600">₹{selectedPartner.total_earnings?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Total Earnings</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">{toNumber(selectedPartner.on_time_delivery_rate).toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">On-Time Rate</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-2xl font-bold text-orange-600">{toNumber(selectedPartner.acceptance_rate).toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">Acceptance Rate</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button className="flex-1 py-2.5 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white rounded-lg hover:shadow-lg transition">
                    Edit Profile
                  </button>
                  <button className="flex-1 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    View Assignments
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Change Modal */}
      <AnimatePresence>
        {showStatusModal && selectedPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Confirm Status Change</h3>
                </div>
                <p className="text-gray-600">
                  Are you sure you want to <span className="font-semibold text-[#E63946]">{statusAction}</span> <strong>{selectedPartner.full_name}</strong>?
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusChange}
                    className="flex-1 px-4 py-2.5 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}