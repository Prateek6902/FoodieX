import api from './api'

export const analyticsService = {
  // Get revenue analytics
  getRevenueAnalytics: async (period = 'weekly') => {
    try {
      const response = await api.get('/analytics/revenue/', { params: { period } })
      // Handle different response structures
      if (response.data.success) {
        return response.data.data || []
      }
      if (Array.isArray(response.data)) {
        return response.data
      }
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      }
      return []
    } catch (error) {
      console.error('Revenue analytics error:', error)
      return []
    }
  },

  // Get customer growth data
  getCustomerGrowth: async () => {
    try {
      const response = await api.get('/analytics/customer-growth/')
      if (response.data.success) {
        return response.data.data || []
      }
      if (Array.isArray(response.data)) {
        return response.data
      }
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      }
      return []
    } catch (error) {
      console.error('Customer growth error:', error)
      return []
    }
  },

  // Get sales by category
  getSalesByCategory: async () => {
    try {
      const response = await api.get('/analytics/sales-by-category/')
      if (response.data.success) {
        return response.data.categories || response.data.data || []
      }
      if (Array.isArray(response.data)) {
        return response.data
      }
      if (response.data.categories && Array.isArray(response.data.categories)) {
        return response.data.categories
      }
      return []
    } catch (error) {
      console.error('Sales by category error:', error)
      return []
    }
  },

  // Get top products
  getTopProducts: async () => {
    try {
      const response = await api.get('/analytics/top-products/')
      if (response.data.success) {
        return response.data.products || response.data.data || []
      }
      if (Array.isArray(response.data)) {
        return response.data
      }
      if (response.data.products && Array.isArray(response.data.products)) {
        return response.data.products
      }
      return []
    } catch (error) {
      console.error('Top products error:', error)
      return []
    }
  },
}