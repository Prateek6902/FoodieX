import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface RoleBasedRouteProps {
  allowedRoles: string[]
  redirectTo?: string
}

export const RoleBasedRoute = ({ allowedRoles, redirectTo = '/' }: RoleBasedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user?.role || '')) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}