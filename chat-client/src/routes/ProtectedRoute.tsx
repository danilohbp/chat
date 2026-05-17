import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { usuario, token } = useAuth()

  if (!usuario || !token) {
    return <Navigate to="/login" replace />
  }

  return children
}
