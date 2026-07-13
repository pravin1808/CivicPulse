import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AdminAssignmentsPage } from '../pages/admin/AdminAssignmentsPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { DefaultDashboardPage } from '../pages/dashboard/DefaultDashboardPage'
import { RoleDashboardPage } from '../pages/dashboard/RoleDashboardPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { UserDashboardPage } from '../pages/user/UserDashboardPage'
import { WorkerDashboardPage } from '../pages/worker/WorkerDashboardPage'
import { RoleGuard } from './RoleGuard'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DefaultDashboardPage />} />
          <Route path="/dashboard" element={<RoleDashboardPage />} />
          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/manage"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminAssignmentsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/worker"
            element={
              <RoleGuard allowedRoles={['WORKER']}>
                <WorkerDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/user"
            element={
              <RoleGuard allowedRoles={['CITIZEN']}>
                <UserDashboardPage />
              </RoleGuard>
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
