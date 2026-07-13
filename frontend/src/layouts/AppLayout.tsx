import { Link, Outlet } from 'react-router-dom'
import { useAppContext } from '../hooks/useAppContext'
import type { Role } from '../types/role'

const roleOptions: Role[] = ['ADMIN', 'WORKER', 'CITIZEN']

export function AppLayout() {
  const { role, setRole } = useAppContext()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-title">CivicPulse</p>
          <p className="muted">Issue management dashboard</p>
        </div>

        <label className="role-select">
          <span>Role</span>
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            {roleOptions.map((roleOption) => (
              <option key={roleOption} value={roleOption}>
                {roleOption === 'CITIZEN' ? 'USER (CITIZEN)' : roleOption}
              </option>
            ))}
          </select>
        </label>
      </header>

      <nav className="nav-bar">
        <Link to="/">Default Dashboard</Link>
        <Link to="/dashboard">Role Dashboard</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/admin/manage">Admin Assignments</Link>
        <Link to="/worker">Worker</Link>
        <Link to="/user">User</Link>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
