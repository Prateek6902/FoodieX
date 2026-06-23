// components/auth/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'

interface ProtectedRouteProps {
  allowedRoles?: string[]
  redirectTo?: string
}

export const ProtectedRoute = ({ allowedRoles = [], redirectTo = '/login' }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // Check localStorage for existing session
    const token = localStorage.getItem('access_token')
    const userStr = localStorage.getItem('user')
    
    console.log('ProtectedRoute check:', {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!userStr,
      token: token?.substring(0, 20) + '...',
      user: userStr ? JSON.parse(userStr) : null
    })
    
    setIsChecking(false)
  }, [])
  
  // Show loading spinner while checking
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E63946] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  // Check if user is authenticated (from store or localStorage)
  const token = localStorage.getItem('access_token')
  const userStr = localStorage.getItem('user')
  const isAuth = isAuthenticated || (token && userStr)
  
  if (!isAuth) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
  }
  
  // Get user from localStorage if not in store
  let currentUser = user
  if (!currentUser && userStr) {
    try {
      currentUser = JSON.parse(userStr)
      console.log('User loaded from localStorage:', currentUser)
    } catch (e) {
      console.error('Failed to parse user', e)
    }
  }
  
  // Check if user has required role
  if (allowedRoles.length > 0 && currentUser) {
    const userRole = currentUser.role?.toLowerCase()
    const hasRequiredRole = allowedRoles.some(role => 
      userRole === role.toLowerCase()
    )
    
    console.log('Role check:', { userRole, allowedRoles, hasRequiredRole })
    
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on role
      if (userRole === 'super_admin' || userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />
      } else if (userRole === 'vendor') {
        return <Navigate to="/vendor/dashboard" replace />
      } else if (userRole === 'customer') {
        return <Navigate to="/customer/dashboard" replace />
      } else if (userRole === 'delivery_partner') {
        return <Navigate to="/delivery/dashboard" replace />
      }
      return <Navigate to="/login" replace />
    }
  }
  
  return <Outlet />
}