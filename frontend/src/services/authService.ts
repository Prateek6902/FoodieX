import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  username: string
  first_name?: string
  last_name?: string
  full_name?: string
  role: string
  is_verified?: boolean
  profile_picture?: string
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
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
)