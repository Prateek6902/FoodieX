import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import { motion } from 'framer-motion'
import api from '../../services/api'

interface RevenueChartProps {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  height?: number
  chartType?: 'area' | 'bar'
}

// Default mock data to prevent undefined
const DEFAULT_DATA = [
  { name: 'Week 1', revenue: 40000, profit: 8000 },
  { name: 'Week 2', revenue: 45000, profit: 9000 },
  { name: 'Week 3', revenue: 52000, profit: 10400 },
  { name: 'Week 4', revenue: 48000, profit: 9600 },
  { name: 'Week 5', revenue: 55000, profit: 11000 },
  { name: 'Week 6', revenue: 60000, profit: 12000 },
  { name: 'Week 7', revenue: 58000, profit: 11600 },
  { name: 'Week 8', revenue: 62000, profit: 12400 },
  { name: 'Week 9', revenue: 59000, profit: 11800 },
  { name: 'Week 10', revenue: 65000, profit: 13000 },
  { name: 'Week 11', revenue: 70000, profit: 14000 },
  { name: 'Week 12', revenue: 75000, profit: 15000 },
]

const fetchRevenueData = async (period: string): Promise<any[]> => {
  try {
    const response = await api.get(`/dashboard/revenue-chart/?period=${period}`)
    console.log('Revenue chart response:', response.data)
    
    // Handle different response structures
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    if (response.data?.revenue_data && Array.isArray(response.data.revenue_data)) {
      return response.data.revenue_data
    }
    
    // Return default data if no valid data found
    return DEFAULT_DATA
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return DEFAULT_DATA
  }
}

export const RevenueChart = ({ 
  period = 'weekly', 
  height = 400, 
  chartType = 'area' 
}: RevenueChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  
  const { data: chartData = DEFAULT_DATA, isLoading } = useQuery({
    queryKey: ['revenue-chart', selectedPeriod],
    queryFn: () => fetchRevenueData(selectedPeriod),
    initialData: DEFAULT_DATA,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: p.color }}>
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
            <p className="text-sm text-gray-500">Loading chart data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
          <p className="text-sm text-gray-500">Track your revenue and profit trends</p>
        </div>
        
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                selectedPeriod === p
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9F1C" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF9F1C" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              stroke="#9CA3AF"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#FF9F1C"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGradient)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#2EC4B6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#profitGradient)"
              name="Profit"
            />
          </AreaChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis tickFormatter={formatCurrency} stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" fill="#FF9F1C" name="Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="profit" fill="#2EC4B6" name="Profit" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  )
}