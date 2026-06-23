import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios'

const API_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add token with debugging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    
    // Debug logs - Fixed to handle undefined baseURL
    console.log('=== API Request Debug ===')
    console.log('URL:', `${config.baseURL || API_URL}${config.url}`)
    console.log('Method:', config.method?.toUpperCase())
    console.log('Token exists:', !!token)
    
    if (token) {
      console.log('Token preview:', token.substring(0, 50) + '...')
      config.headers.Authorization = `Bearer ${token}`
      console.log('Authorization header set:', !!config.headers.Authorization)
    } else {
      console.warn('⚠️ No token found in localStorage!')
    }
    console.log('========================')
    
    return config
  },
  (error: Error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response success:', response.status, response.config.url)
    return response
  },
  async (error: AxiosError) => {
    console.error('❌ Response error:', error.response?.status, error.config?.url)
    console.error('Error data:', error.response?.data)
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = localStorage.getItem('refresh_token')
      console.log('Attempting token refresh. Refresh token exists:', !!refreshToken)
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token/`, {
            refresh: refreshToken
          })
          
          console.log('Refresh response:', response.data)
          
          if (response.data.success && response.data.access) {
            // Update tokens
            localStorage.setItem('access_token', response.data.access)
            if (response.data.refresh) {
              localStorage.setItem('refresh_token', response.data.refresh)
            }
            
            // Update authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.access}`
            }
            console.log('Token refreshed successfully, retrying original request')
            return api(originalRequest)
          } else {
            console.error('Refresh response missing access token')
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // Clear storage and redirect to login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        console.error('No refresh token available')
        // No refresh token, redirect to login
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Export both default and named export
export default api
export { api }