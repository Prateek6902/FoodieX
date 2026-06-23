import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  full_name?: string
  mobile_number?: string
  phone_number?: string
  role: string
  is_verified?: boolean
  is_active?: boolean
  profile_picture?: string
  avatar?: string
  // Address fields
  address?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  latitude?: number
  longitude?: number
  // Business fields for vendors
  business_name?: string
  business_address?: string
  // Timestamps
  created_at?: string
  updated_at?: string
  last_login?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, tokens: { access: string; refresh: string }) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateAccessToken: (token: string) => void
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user, tokens) => {
        console.log('Login called with:', { user, tokens })
        
        // Save to localStorage
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Update state
        set({ 
          user, 
          accessToken: tokens.access, 
          refreshToken: tokens.refresh,
          isAuthenticated: true, 
          isLoading: false 
        })
        
        console.log('Auth state updated, isAuthenticated:', true)
      },
      
      logout: () => {
        console.log('Logout called')
        
        // Clear localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        
        // Update state
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null,
          isAuthenticated: false, 
          isLoading: false 
        })
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      updateAccessToken: (token) => {
        localStorage.setItem('access_token', token)
        set({ accessToken: token })
      },
      
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          set({ user: updatedUser })
          localStorage.setItem('user', JSON.stringify(updatedUser))
          console.log('User updated:', updatedUser)
        }
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
)