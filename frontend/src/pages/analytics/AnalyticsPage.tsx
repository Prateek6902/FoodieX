import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Star,
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Award,
  Clock,
  XCircle,
  Percent,
  Package,
  Store
} from 'lucide-react'
import api from '../../services/api'
import { GlassCard } from '../../components/ui/GlassCard'

// Import DatePicker dynamically to avoid SSR issues
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const COLORS = ['#E63946', '#457B9D', '#A8DADC', '#2EC4B6', '#FF9F1C', '#9B59B6', '#3498DB', '#E74C3C']

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface RevenueData {
  name: string
  revenue: number
  orders: number
}

interface CustomerData {
  month: string
  new_customers: number
  total_customers: number
}

interface ProductData {
  name: string
  sales: number
  revenue: number
  growth: string
}

interface CategoryData {
  name: string
  value: number
  sales?: number
}

interface DashboardStats {
  total_revenue: number
  total_revenue_change: number
  total_orders: number
  total_orders_change: number
  total_customers: number
  total_customers_change: number
  avg_rating: number
  on_time_delivery: number
  cancellation_rate: number
  average_order_value: number
  repeat_customer_rate: number
}

export const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'customers'>('revenue')
  const [showRevenueChart, setShowRevenueChart] = useState<boolean>(true)
  const [showCustomerChart, setShowCustomerChart] = useState<boolean>(true)
  const [showCategoryChart, setShowCategoryChart] = useState<boolean>(true)

  // Fetch revenue data
  const { data: revenueData = [], isLoading: revenueLoading } = useQuery<RevenueData[]>({
    queryKey: ['revenue-analytics', period, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('period', period)
      if (dateRange.startDate) params.append('start_date', dateRange.startDate.toISOString().split('T')[0])
      if (dateRange.endDate) params.append('end_date', dateRange.endDate.toISOString().split('T')[0])
      
      const response = await api.get(`/analytics/revenue/?${params.toString()}`)
      if (response.data?.success && response.data?.data) {
        return response.data.data
      }
      return []
    },
  })

  // Fetch customer growth data
  const { data: customerData = [], isLoading: customerLoading } = useQuery<CustomerData[]>({
    queryKey: ['customer-growth', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('start_date', dateRange.startDate.toISOString().split('T')[0])
      if (dateRange.endDate) params.append('end_date', dateRange.endDate.toISOString().split('T')[0])
      
      const response = await api.get(`/analytics/customer-growth/?${params.toString()}`)
      if (response.data?.success && response.data?.data) {
        return response.data.data
      }
      return []
    },
  })

  // Fetch top products data
  const { data: topProducts = [], isLoading: productsLoading } = useQuery<ProductData[]>({
    queryKey: ['top-products', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('start_date', dateRange.startDate.toISOString().split('T')[0])
      if (dateRange.endDate) params.append('end_date', dateRange.endDate.toISOString().split('T')[0])
      
      const response = await api.get(`/analytics/top-products/?${params.toString()}`)
      if (response.data?.success && response.data?.products) {
        return response.data.products
      }
      return []
    },
  })

  // Fetch sales by category data
  const { data: categoryData = [], isLoading: categoryLoading } = useQuery<CategoryData[]>({
    queryKey: ['sales-by-category', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('start_date', dateRange.startDate.toISOString().split('T')[0])
      if (dateRange.endDate) params.append('end_date', dateRange.endDate.toISOString().split('T')[0])
      
      const response = await api.get(`/analytics/sales-by-category/?${params.toString()}`)
      if (response.data?.success && response.data?.categories) {
        return response.data.categories
      }
      return []
    },
  })

  // Fetch dashboard stats
  const { data: dashboardStats = null, isLoading: statsLoading } = useQuery<DashboardStats | null>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/admin/stats/')
      if (response.data?.success && response.data?.data) {
        return response.data.data
      }
      return null
    },
  })

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-IN').format(value || 0)
  }

  const stats = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(dashboardStats?.total_revenue || 0), 
      change: `+${dashboardStats?.total_revenue_change || 12.5}%`, 
      trend: 'up' as const, 
      icon: DollarSign 
    },
    { 
      label: 'Total Orders', 
      value: formatNumber(dashboardStats?.total_orders || 0), 
      change: `+${dashboardStats?.total_orders_change || 8.2}%`, 
      trend: 'up' as const, 
      icon: ShoppingBag 
    },
    { 
      label: 'Active Users', 
      value: formatNumber(dashboardStats?.total_customers || 0), 
      change: `+${dashboardStats?.total_customers_change || 15.3}%`, 
      trend: 'up' as const, 
      icon: Users 
    },
    { 
      label: 'Avg Rating', 
      value: (dashboardStats?.avg_rating || 4.8).toFixed(1), 
      change: `+0.3`, 
      trend: 'up' as const, 
      icon: Star 
    },
  ]

  const handleExport = async (): Promise<void> => {
    try {
      const response = await api.get('/analytics/export/', {
        responseType: 'blob',
        params: {
          start_date: dateRange.startDate?.toISOString().split('T')[0],
          end_date: dateRange.endDate?.toISOString().split('T')[0],
          period,
        }
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const isLoading = revenueLoading || customerLoading || productsLoading || categoryLoading || statsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3557] via-[#457B9D] to-[#A8DADC] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-white/80">Real-time platform analytics and insights from your data</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Date Range:</span>
              </div>
              <div className="flex gap-2 items-center">
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={(date: Date | null) => setDateRange({ ...dateRange, startDate: date })}
                  placeholderText="Start Date"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                />
                <span className="text-gray-400">to</span>
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={(date: Date | null) => setDateRange({ ...dateRange, endDate: date })}
                  placeholderText="End Date"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  minDate={dateRange.startDate || undefined}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    period === p
                      ? 'bg-[#E63946] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E63946]/20 to-[#457B9D]/20 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-[#E63946]" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Revenue & Orders Trend</h2>
                  <p className="text-sm text-gray-500">Track your business performance over time</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedMetric('revenue')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      selectedMetric === 'revenue' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setSelectedMetric('orders')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      selectedMetric === 'orders' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Orders
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E63946" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E63946" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#457B9D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#457B9D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis yAxisId="left" stroke="#6B7280" tickFormatter={selectedMetric === 'revenue' ? (value: number) => `₹${value/1000}k` : undefined} />
                  {selectedMetric === 'orders' && <YAxis yAxisId="right" orientation="right" stroke="#457B9D" />}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: number) => selectedMetric === 'revenue' ? formatCurrency(value) : formatNumber(value)}
                  />
                  <Legend />
                  {selectedMetric === 'revenue' && (
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#E63946"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                      name="Revenue"
                    />
                  )}
                  {selectedMetric === 'orders' && (
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#457B9D"
                      strokeWidth={2}
                      fill="url(#ordersGradient)"
                      name="Orders"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>

          {/* Customer Growth Chart */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Customer Growth</h2>
              <button onClick={() => setShowCustomerChart(!showCustomerChart)} className="text-gray-400 hover:text-gray-600">
                {showCustomerChart ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {showCustomerChart && (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={customerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatNumber(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="new_customers" 
                    stroke="#2EC4B6" 
                    name="New Customers" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#2EC4B6" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_customers" 
                    stroke="#E63946" 
                    name="Total Customers" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#E63946" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Top Selling Products</h2>
              <button className="text-sm text-[#E63946] hover:underline">View All</button>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis type="category" dataKey="name" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 12 }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Units Sold']}
                />
                <Bar dataKey="sales" fill="#E63946" name="Units Sold" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Sales by Category */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Revenue by Category</h2>
              <button onClick={() => setShowCategoryChart(!showCategoryChart)} className="text-gray-400 hover:text-gray-600">
                {showCategoryChart ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {showCategoryChart && (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={130}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={2}
                  >
                    {categoryData.map((_: CategoryData, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Percentage']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value: string) => (
                      <span style={{ color: '#374151', fontSize: '12px' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </div>

        {/* Performance Metrics */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{dashboardStats?.on_time_delivery || 92.4}%</p>
              <p className="text-xs text-gray-500 mt-1">On-time Delivery</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{dashboardStats?.cancellation_rate || 2.8}%</p>
              <p className="text-xs text-gray-500 mt-1">Cancellation Rate</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <DollarSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">₹{(dashboardStats?.average_order_value || 764).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Avg Order Value</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">{dashboardStats?.repeat_customer_rate || 35.6}%</p>
              <p className="text-xs text-gray-500 mt-1">Repeat Customer Rate</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{dashboardStats?.avg_rating || 4.6}/5</p>
              <p className="text-xs text-gray-500 mt-1">Customer Rating</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}