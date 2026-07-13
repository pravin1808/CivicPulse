import { Navigate } from 'react-router-dom'
import { useAppContext } from '../../hooks/useAppContext'

export function RoleDashboardPage() {
  const { role } = useAppContext()

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  if (role === 'WORKER') {
    return <Navigate to="/worker" replace />
  }

  return <Navigate to="/user" replace />
}
