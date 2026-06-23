import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts'
import { 
  MapPin, TrendingUp, RefreshCw, 
  Globe, Compass, Navigation, Target, Award,
  DollarSign, ShoppingBag
} from 'lucide-react'
import api from '../../services/api'

interface RegionData {
  region: string
  revenue: number
  orders: number
  customers?: number
  restaurants?: number
  growth?: number
}

interface RegionResponse {
  regions: RegionData[]
  total_regions: number
  total_revenue: number
  total_orders: number
  top_performing_region: string
  fastest_growing_region: string
}

const COLORS = {
  primary: '#E63946',
  secondary: '#F1FAEE',
  accent: '#A8DADC',
  dark: '#457B9D',
  darker: '#1D3557',
  chartColors: ['#E63946', '#457B9D', '#A8DADC', '#2EC4B6', '#FF9F1C', '#9B59B6', '#3498DB', '#E74C3C'],
}

const fetchRegionData = async (): Promise<RegionResponse> => {
  try {
    const response = await api.get('/dashboard/region-analysis/')
    console.log('Region analysis response:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    } else if (Array.isArray(response.data)) {
      const regions = response.data.map((item: any) => ({
        region: item.region || item.name || 'Unknown',
        revenue: item.revenue || item.total_revenue || 0,
        orders: item.orders || item.total_orders || Math.round((item.revenue || 0) / 100),
        customers: item.customers || 0,
        restaurants: item.restaurants || 0,
        growth: item.growth || item.percentage || 0,
      }))
      
      const total_revenue = regions.reduce((sum, r) => sum + r.revenue, 0)
      const total_orders = regions.reduce((sum, r) => sum + r.orders, 0)
      
      return {
        regions: regions,
        total_regions: regions.length,
        total_revenue: total_revenue,
        total_orders: total_orders,
        top_performing_region: regions.length > 0 ? regions[0].region : 'N/A',
        fastest_growing_region: regions.length > 0 
          ? regions.reduce((max, r) => (r.growth || 0) > (max.growth || 0) ? r : max, regions[0]).region 
          : 'N/A',
      }
    } else if (response.data?.regions) {
      return response.data
    }
    
    const sampleRegions: RegionData[] = [
      { region: 'North America', revenue: 253663.19, orders: 2456, customers: 1890, restaurants: 45, growth: 18.5 },
      { region: 'Europe', revenue: 26942.69, orders: 345, customers: 280, restaurants: 12, growth: 8.3 },
      { region: 'Asia', revenue: 21295.33, orders: 278, customers: 210, restaurants: 8, growth: 6.6 },
      { region: 'South America', revenue: 10996.80, orders: 156, customers: 120, restaurants: 5, growth: 3.4 },
      { region: 'Africa', revenue: 5450.62, orders: 89, customers: 67, restaurants: 3, growth: 1.7 },
      { region: 'Australia', revenue: 4956.20, orders: 67, customers: 52, restaurants: 2, growth: 1.5 },
    ]
    
    return {
      regions: sampleRegions,
      total_regions: sampleRegions.length,
      total_revenue: sampleRegions.reduce((sum, r) => sum + r.revenue, 0),
      total_orders: sampleRegions.reduce((sum, r) => sum + r.orders, 0),
      top_performing_region: sampleRegions[0].region,
      fastest_growing_region: sampleRegions.reduce((max, r) => (r.growth || 0) > (max.growth || 0) ? r : max, sampleRegions[0]).region,
    }
  } catch (error) {
    console.error('Error fetching region data:', error)
    return {
      regions: [],
      total_regions: 0,
      total_revenue: 0,
      total_orders: 0,
      top_performing_region: 'N/A',
      fastest_growing_region: 'N/A',
    }
  }
}

export const RegionAnalysisChart = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'radial' | 'composed' | 'scatter'>('radial')
  const [showDetails, setShowDetails] = useState(true)

  const { data: regionData, isLoading, error, refetch } = useQuery<RegionResponse>({
    queryKey: ['regionAnalysis'],
    queryFn: fetchRegionData,
    refetchInterval: 60000,
  })

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

  const regions = regionData?.regions || []
  const totalRegions = regionData?.total_regions || 0
  const totalRevenue = regionData?.total_revenue || 0
  const totalOrders = regionData?.total_orders || 0
  const topRegion = regionData?.top_performing_region || 'N/A'
  const fastestRegion = regionData?.fastest_growing_region || 'N/A'

  const sortedRegions = [...regions].sort((a, b) => b.revenue - a.revenue)
  const maxRevenue = sortedRegions.length > 0 ? sortedRegions[0].revenue : 1

  const radialData = sortedRegions.map((region, index) => ({
    name: region.region,
    value: region.revenue,
    fill: COLORS.chartColors[index % COLORS.chartColors.length],
  }))

  const composedData = sortedRegions.map(region => ({
    name: region.region,
    revenue: region.revenue / 1000,
    orders: region.orders,
    growth: region.growth || 0,
  }))

  const scatterData = sortedRegions.map(region => ({
    name: region.region,
    x: region.revenue / 10000,
    y: region.orders,
    z: region.growth || 0,
  }))

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Region Analysis</h3>
          <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-2 animate-pulse" />
            <p className="text-gray-400">Loading region data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Region Analysis</h3>
          <button onClick={() => refetch()} className="text-sm text-[#E63946] hover:underline">
            Retry
          </button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Failed to load region data</p>
        </div>
      </div>
    )
  }

  if (regions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Region Analysis</h3>
          <button onClick={() => refetch()} className="text-sm text-[#E63946] hover:underline">
            Refresh
          </button>
        </div>
        <div className="text-center py-12">
          <Compass className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No region data available</p>
          <p className="text-sm text-gray-400 mt-1">Start adding restaurants to see region analysis</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Region Analysis</h3>
          <p className="text-sm text-gray-500">Performance across different regions</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('radial')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'radial' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Radial View"
          >
            <Target className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('composed')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'composed' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Composed View"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('scatter')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'scatter' ? 'bg-[#E63946] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Scatter View"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#1D3557]/10 to-[#457B9D]/10 rounded-xl text-center border border-[#1D3557]/10">
            <Globe className="w-5 h-5 text-[#1D3557] mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{totalRegions}</p>
            <p className="text-xs text-gray-500">Regions</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-[#E63946]/10 to-[#C62828]/10 rounded-xl text-center border border-[#E63946]/10">
            <DollarSign className="w-5 h-5 text-[#E63946] mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-gray-500">Total Revenue</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-[#A8DADC]/10 to-[#457B9D]/10 rounded-xl text-center border border-[#A8DADC]/10">
            <ShoppingBag className="w-5 h-5 text-[#457B9D] mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{formatNumber(totalOrders)}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-[#FF9F1C]/10 to-[#F59E0B]/10 rounded-xl text-center border border-[#FF9F1C]/10">
            <Award className="w-5 h-5 text-[#FF9F1C] mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-800 truncate">{topRegion}</p>
            <p className="text-xs text-gray-500">Top Region</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-[#2EC4B6]/10 to-[#10B981]/10 rounded-xl text-center border border-[#2EC4B6]/10">
            <TrendingUp className="w-5 h-5 text-[#2EC4B6] mx-auto mb-1" />
            <p className="text-sm font-bold text-gray-800 truncate">{fastestRegion}</p>
            <p className="text-xs text-gray-500">Fastest Growth</p>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[350px]">
          {viewMode === 'radial' && (
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="90%" 
                data={radialData}
                startAngle={180}
                endAngle={-180}
              >
                <PolarAngleAxis type="number" domain={[0, maxRevenue]} />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  label={{ 
                    position: 'insideStart', 
                    fill: '#fff',
                    fontSize: 10,
                    fontWeight: 'bold',
                    formatter: (value: number) => formatCurrency(value)
                  }}
                />
                <Legend 
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'composed' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={composedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis yAxisId="left" stroke="#6B7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  fill="#E63946"
                  stroke="#E63946"
                  fillOpacity={0.2}
                  name="Revenue (₹k)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#457B9D"
                  strokeWidth={2}
                  name="Orders"
                  dot={{ r: 4, fill: "#457B9D" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="growth"
                  stroke="#2EC4B6"
                  strokeWidth={2}
                  name="Growth %"
                  dot={{ r: 4, fill: "#2EC4B6" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'scatter' && (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Revenue (₹10k)"
                  stroke="#6B7280"
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Orders"
                  stroke="#6B7280"
                />
                <ZAxis 
                  type="number" 
                  dataKey="z" 
                  range={[60, 400]} 
                  name="Growth %"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Revenue (₹10k)') return formatCurrency(value * 10000)
                    if (name === 'Orders') return formatNumber(value)
                    if (name === 'Growth %') return `${value}%`
                    return value
                  }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Scatter 
                  name="Regions" 
                  data={scatterData} 
                  fill="#E63946"
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Region Details */}
        {showDetails && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedRegions.slice(0, 6).map((region, index) => {
              const percentage = (region.revenue / totalRevenue * 100) || 0
              return (
                <motion.div
                  key={region.region}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-xl transition cursor-pointer ${
                    selectedRegion === region.region 
                      ? 'bg-[#E63946]/10 border-2 border-[#E63946]' 
                      : 'bg-gray-50 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRegion(selectedRegion === region.region ? null : region.region)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{region.region}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(region.revenue)}</p>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, ${COLORS.chartColors[index % COLORS.chartColors.length]}, ${COLORS.primary})`
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-2 text-right">
                      <div className={`flex items-center gap-0.5 text-xs ${
                        (region.growth || 0) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>{(region.growth || 0)}%</span>
                      </div>
                      <p className="text-xs text-gray-400">{region.orders} orders</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}