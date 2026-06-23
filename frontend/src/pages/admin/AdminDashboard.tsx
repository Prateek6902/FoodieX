import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Store, 
  Truck, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  XCircle,
  Star,
  Download,
  RefreshCw,
  Award,
  Package,
  Percent,
  Activity
} from 'lucide-react'
import api from '../../services/api'
import { RevenueChart } from '../../components/charts/RevenueChart'
import { RecentOrdersTable } from '../../components/tables/RecentOrdersTable'
import { TopVendorsChart } from '../../components/charts/TopVendorsChart'
import { OrderStatusChart } from '../../components/charts/OrderStatusChart'
import { RevenueCategoryChart } from '../../components/charts/RevenueCategoryChart'
import { RegionAnalysisChart } from '../../components/charts/RegionAnalysisChart'

// Color scheme
const COLORS = {
  primary: '#E63946',
  secondary: '#F1FAEE',
  accent: '#A8DADC',
  dark: '#457B9D',
  darker: '#1D3557',
  gradient: 'from-[#1D3557] via-[#457B9D] to-[#A8DADC]',
}

interface DashboardStats {
  total_orders: number
  total_orders_change: number
  total_revenue: number
  total_revenue_change: number
  total_customers: number
  total_customers_change: number
  total_restaurants: number
  total_restaurants_change: number
  active_delivery_partners: number
  active_delivery_partners_change: number
  average_order_value: number
  on_time_delivery: number
  cancellation_rate: number
  avg_rating: number
  repeat_customer_rate: number
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/dashboard/admin/stats/')
    console.log('Full API Response:', response)
    console.log('Response data:', response.data)
    
    // Extract the data - handle both nested and flat structures
    let data = response.data
    
    // If the response has a data property that contains the actual stats
    if (data && data.success === true && data.data) {
      data = data.data
    }
    
    // If data is still nested with a data property
    if (data && data.data) {
      data = data.data
    }
    
    console.log('Extracted data:', data)
    
    // Return the stats with proper mapping
    return {
      total_orders: data.total_orders || 0,
      total_orders_change: data.total_orders_change || 0,
      total_revenue: data.total_revenue || 0,
      total_revenue_change: data.total_revenue_change || 0,
      total_customers: data.total_customers || 0,
      total_customers_change: data.total_customers_change || 0,
      total_restaurants: data.total_restaurants || 0,
      total_restaurants_change: data.total_restaurants_change || 0,
      active_delivery_partners: data.active_delivery_partners || 0,
      active_delivery_partners_change: data.active_delivery_partners_change || 0,
      average_order_value: data.average_order_value || 0,
      on_time_delivery: data.on_time_delivery || 0,
      cancellation_rate: data.cancellation_rate || 0,
      avg_rating: data.avg_rating || 0,
      repeat_customer_rate: data.repeat_customer_rate || 0,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      total_orders: 0,
      total_orders_change: 0,
      total_revenue: 0,
      total_revenue_change: 0,
      total_customers: 0,
      total_customers_change: 0,
      total_restaurants: 0,
      total_restaurants_change: 0,
      active_delivery_partners: 0,
      active_delivery_partners_change: 0,
      average_order_value: 0,
      on_time_delivery: 0,
      cancellation_rate: 0,
      avg_rating: 0,
      repeat_customer_rate: 0,
    }
  }
}

const AdminDashboard = () => {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
    retry: 3,
  })

  console.log('Stats data in component:', stats)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value || 0)
  }

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center m-6">
        <p className="text-red-600 mb-4">Failed to load dashboard data.</p>
        <button 
          onClick={() => refetch()} 
          className="px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#C62828] transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  // Use the stats directly, they should already be in the correct format
  const safeStats = stats || {
    total_orders: 0,
    total_orders_change: 0,
    total_revenue: 0,
    total_revenue_change: 0,
    total_customers: 0,
    total_customers_change: 0,
    total_restaurants: 0,
    total_restaurants_change: 0,
    active_delivery_partners: 0,
    active_delivery_partners_change: 0,
    average_order_value: 0,
    on_time_delivery: 0,
    cancellation_rate: 0,
    avg_rating: 0,
    repeat_customer_rate: 0,
  }

  console.log('Safe stats being used:', safeStats)

  // Main Stats Cards - 6 cards
  const mainStatCards = [
    {
      title: "Total Orders",
      value: formatNumber(safeStats.total_orders),
      change: `${safeStats.total_orders_change > 0 ? '+' : ''}${safeStats.total_orders_change || 0}%`,
      trend: safeStats.total_orders_change > 0 ? 'up' : 'down',
      icon: ShoppingBag,
      color: "#E63946",
      bg: "bg-red-50",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(safeStats.total_revenue),
      change: `${safeStats.total_revenue_change > 0 ? '+' : ''}${safeStats.total_revenue_change || 0}%`,
      trend: safeStats.total_revenue_change > 0 ? 'up' : 'down',
      icon: DollarSign,
      color: "#457B9D",
      bg: "bg-blue-50",
    },
    {
      title: "Total Customers",
      value: formatNumber(safeStats.total_customers),
      change: `${safeStats.total_customers_change > 0 ? '+' : ''}${safeStats.total_customers_change || 0}%`,
      trend: safeStats.total_customers_change > 0 ? 'up' : 'down',
      icon: Users,
      color: "#A8DADC",
      bg: "bg-cyan-50",
    },
    {
      title: "Total Restaurants",
      value: formatNumber(safeStats.total_restaurants),
      change: `${safeStats.total_restaurants_change > 0 ? '+' : ''}${safeStats.total_restaurants_change || 0}%`,
      trend: safeStats.total_restaurants_change > 0 ? 'up' : 'down',
      icon: Store,
      color: "#1D3557",
      bg: "bg-indigo-50",
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(safeStats.average_order_value),
      change: "+6.4%",
      trend: 'up',
      icon: TrendingUp,
      color: "#2EC4B6",
      bg: "bg-teal-50",
    },
    {
      title: "Delivery Partners",
      value: formatNumber(safeStats.active_delivery_partners || 0),
      change: `${safeStats.active_delivery_partners_change > 0 ? '+' : ''}${safeStats.active_delivery_partners_change || 0}%`,
      trend: safeStats.active_delivery_partners_change > 0 ? 'up' : 'down',
      icon: Truck,
      color: "#FF9F1C",
      bg: "bg-orange-50",
    }
  ]

  // KPI Cards
  const kpiCards = [
    {
      title: "On-time Delivery",
      value: `${safeStats.on_time_delivery || 0}%`,
      change: "+2.8%",
      icon: Clock,
      color: "#10B981",
      bg: "bg-green-50",
      trend: 'up'
    },
    {
      title: "Cancellation Rate",
      value: `${safeStats.cancellation_rate || 0}%`,
      change: "-1.2%",
      icon: XCircle,
      color: "#EF4444",
      bg: "bg-red-50",
      trend: 'down'
    },
    {
      title: "Avg Rating",
      value: `${safeStats.avg_rating || 0}/5`,
      change: "+0.3",
      icon: Star,
      color: "#F59E0B",
      bg: "bg-yellow-50",
      trend: 'up'
    },
    {
      title: "Repeat Customers",
      value: `${safeStats.repeat_customer_rate || 0}%`,
      change: "+4.2%",
      icon: Users,
      color: "#8B5CF6",
      bg: "bg-purple-50",
      trend: 'up'
    }
  ]

  // Additional Metrics
  const additionalMetrics = [
    {
      title: "Total Profit",
      value: formatCurrency(safeStats.total_revenue * 0.3 || 0),
      change: "+15.2%",
      icon: TrendingUp,
      color: "#10B981",
      bg: "bg-green-50"
    },
    {
      title: "Total Sales",
      value: formatNumber(safeStats.total_orders || 0),
      change: "+8.3%",
      icon: ShoppingBag,
      color: "#E63946",
      bg: "bg-red-50"
    },
    {
      title: "Active Users",
      value: formatNumber(safeStats.total_customers || 0),
      change: "+10.1%",
      icon: Users,
      color: "#457B9D",
      bg: "bg-blue-50"
    },
    {
      title: "Commission Rate",
      value: "15%",
      change: "+0%",
      icon: Percent,
      color: "#A8DADC",
      bg: "bg-cyan-50"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${COLORS.gradient} rounded-2xl p-6 text-white shadow-xl`}
        >
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-white/80">Welcome back! Here's what's happening with your platform today.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={() => refetch()} 
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Stats Grid - 6 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {mainStatCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* KPI Cards - 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{kpi.title}</p>
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change}
                </span>
                <span className="text-xs text-gray-400">vs last week</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${metric.bg}`}>
                    <Icon className="w-4 h-4" style={{ color: metric.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{metric.title}</p>
                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-green-600">{metric.change}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Performance Overview with Progress Bars */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Performance Overview</h3>
              <Award className="w-5 h-5 text-[#E63946]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">On-time Delivery</span>
                  <span className="font-semibold text-gray-800">{safeStats.on_time_delivery || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-all duration-1000"
                    style={{ width: `${safeStats.on_time_delivery || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className="font-semibold text-gray-800">{safeStats.avg_rating || 0}/5</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full transition-all duration-1000"
                    style={{ width: `${((safeStats.avg_rating || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Repeat Customers</span>
                  <span className="font-semibold text-gray-800">{safeStats.repeat_customer_rate || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full transition-all duration-1000"
                    style={{ width: `${safeStats.repeat_customer_rate || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cancellation Rate</span>
                  <span className="font-semibold text-gray-800">{safeStats.cancellation_rate || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#EF4444] to-[#F87171] rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(safeStats.cancellation_rate || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <OrderStatusChart />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueCategoryChart />
          <RegionAnalysisChart />
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopVendorsChart />
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Quick Stats</h3>
              <Activity className="w-5 h-5 text-[#E63946]" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Orders</span>
                <span className="font-bold text-gray-800">{formatNumber(safeStats.total_orders)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-bold text-gray-800">{formatCurrency(safeStats.total_revenue)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Customers</span>
                <span className="font-bold text-gray-800">{formatNumber(safeStats.total_customers)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Restaurants</span>
                <span className="font-bold text-gray-800">{formatNumber(safeStats.total_restaurants)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <RecentOrdersTable />
      </div>
    </div>
  )
}

export default AdminDashboard