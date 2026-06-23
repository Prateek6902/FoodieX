import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  ShoppingBag, 
  Users, 
  Store, 
  Truck, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Download,
  Calendar,
  Filter,
  Clock,
  Activity,
  Bell,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import { api } from '../../services/api'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { RevenueChart } from '../../components/charts/RevenueChart'
import { RecentOrdersTable } from '../../components/tables/RecentOrdersTable'
import { TopVendorsChart } from '../../components/charts/TopVendorsChart'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'

interface DashboardStats {
  summary: {
    total_revenue: number
    total_orders: number
    total_customers: number
    total_vendors: number
    total_delivery_partners: number
  }
  overall: {
    total_delivery_partners: number
  }
  recent_activities?: Array<{
    id: string
    type: string
    message: string
    created_at: string
  }>
  revenue_data?: Array<{
    date: string
    revenue: number
  }>
  order_data?: Array<{
    date: string
    orders: number
  }>
}

// Recent Activity Component (built-in)
const RecentActivityList = ({ activities }: { activities?: Array<{ id: string; type: string; message: string; created_at: string }> }) => {
  const defaultActivities = [
    { id: '1', type: 'order', message: 'New order #ORD-2024-001 placed by John Doe', created_at: new Date().toISOString() },
    { id: '2', type: 'user', message: 'New customer Sarah Smith registered', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', type: 'restaurant', message: 'Restaurant "Spice Garden" went live', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', type: 'delivery', message: 'Delivery partner Mike completed 50 deliveries', created_at: new Date(Date.now() - 14400000).toISOString() },
    { id: '5', type: 'review', message: 'New 5-star review for KFC', created_at: new Date(Date.now() - 86400000).toISOString() },
  ]

  const displayActivities = activities && activities.length > 0 ? activities : defaultActivities

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-blue-500" />
      case 'user': return <Users className="w-4 h-4 text-emerald-500" />
      case 'restaurant': return <Store className="w-4 h-4 text-orange-500" />
      case 'delivery': return <Truck className="w-4 h-4 text-purple-500" />
      case 'review': return <MessageSquare className="w-4 h-4 text-yellow-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {displayActivities.slice(0, 5).map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">{activity.message}</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(activity.created_at)}
            </p>
          </div>
        </div>
      ))}
      <button className="w-full text-center text-sm text-[#E63946] hover:underline font-medium py-2">
        View All Activity
      </button>
    </div>
  )
}

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await api.get('/dashboard/admin/')
      return response.data.data
    },
    refetchInterval: 30000,
  })

  const statsCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.summary?.total_revenue?.toLocaleString() || '0'}`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'primary' as const,
    },
    {
      title: 'Total Orders',
      value: stats?.summary?.total_orders?.toLocaleString() || '0',
      change: '+8.2%',
      trend: 'up' as const,
      icon: ShoppingBag,
      color: 'secondary' as const,
    },
    {
      title: 'Active Customers',
      value: stats?.summary?.total_customers?.toLocaleString() || '0',
      change: '+15.3%',
      trend: 'up' as const,
      icon: Users,
      color: 'accent' as const,
    },
    {
      title: 'Active Vendors',
      value: stats?.summary?.total_vendors?.toLocaleString() || '0',
      change: '-2.1%',
      trend: 'down' as const,
      icon: Store,
      color: 'warning' as const,
    },
    {
      title: 'Delivery Partners',
      value: stats?.overall?.total_delivery_partners?.toLocaleString() || '0',
      change: '+5.3%',
      trend: 'up' as const,
      icon: Truck,
      color: 'success' as const,
    },
    {
      title: 'Profit Margin',
      value: '24.8%',
      change: '+3.2%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'primary' as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-white/80">Welcome back, Admin! Here's your platform overview</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm">
                <Calendar className="w-4 h-4" />
                Last 30 days
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#E63946] rounded-lg hover:bg-[#C62828] transition text-sm shadow-lg">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'primary' ? 'bg-[#1D3557]/10 text-[#1D3557]' :
                  stat.color === 'secondary' ? 'bg-[#E63946]/10 text-[#E63946]' :
                  stat.color === 'accent' ? 'bg-[#457B9D]/10 text-[#457B9D]' :
                  stat.color === 'warning' ? 'bg-amber-100 text-amber-600' :
                  stat.color === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                } flex items-center gap-1`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview</h3>
            <RevenueChart />
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Vendors</h3>
            <TopVendorsChart />
          </div>
        </div>

        {/* Tables and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
              <RecentOrdersTable />
            </div>
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#E63946]" />
                  Recent Activity
                </h3>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Live</span>
              </div>
              <RecentActivityList activities={stats?.recent_activities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}