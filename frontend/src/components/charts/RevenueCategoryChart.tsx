import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { motion } from 'framer-motion'
import api from '../../services/api'

interface CategoryData {
  name: string
  value: number
}

const COLORS = ['#E63946', '#457B9D', '#A8DADC', '#2EC4B6', '#FF9F1C', '#9B59B6']

const fetchCategoryData = async (): Promise<CategoryData[]> => {
  try {
    const response = await api.get('/dashboard/revenue-by-category/')
    console.log('Revenue by category response:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    if (response.data?.data) {
      return response.data.data
    }
    return []
  } catch (error) {
    console.error('Error fetching category data:', error)
    return []
  }
}

export const RevenueCategoryChart = () => {
  const { data: categoryData = [], isLoading } = useQuery<CategoryData[]>({
    queryKey: ['revenueByCategory'],
    queryFn: fetchCategoryData,
    refetchInterval: 60000,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Revenue by Category</h3>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Revenue by Category</h3>
          <p className="text-sm text-gray-500">Revenue distribution across categories</p>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }: { name: string; percent: number }) => 
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
            >
              {categoryData.map((entry: CategoryData, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}