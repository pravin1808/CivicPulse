import { Navigate } from 'react-router-dom'
import { useAppContext } from '../hooks/useAppContext'
import type { Role } from '../types/role'

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[]
  children: React.ReactNode
}) {
  const { role } = useAppContext()

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
