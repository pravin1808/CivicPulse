import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Users, 
  LogOut, 
  ShieldAlert, 
  Settings, 
  UserCircle 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'citizen':
        return [
          { path: '/citizen/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/citizen/report-issue', label: 'Report Issue', icon: <PlusCircle size={20} /> },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/admin/issues', label: 'Issues', icon: <ClipboardList size={20} /> },
          { path: '/admin/workers', label: 'Workers', icon: <Users size={20} /> },
        ];
      case 'worker':
        return [
          { path: '/worker/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <ShieldAlert size={24} color="#ffffff" />
        </div>
        <div className="logo-text">
          <h1>CivicPulse</h1>
          <span>Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.role === 'admin' ? 'A' : user?.role === 'worker' ? 'W' : 'C'}
          </div>
          <div className="user-info">
            <span className="user-role">{user?.role ? user.role.toUpperCase() : 'USER'}</span>
            <span className="user-email" title={user?.email}>{user?.email}</span>
          </div>
          <button className="settings-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
