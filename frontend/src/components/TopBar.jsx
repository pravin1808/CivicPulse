import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell } from 'lucide-react';
import './TopBar.css';

const TopBar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="page-title">{title || 'Dashboard'}</h2>
        <span className="page-subtitle">CivicPulse issue tracking system</span>
      </div>
      
      <div className="topbar-right">
        <button className="icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="badge-dot"></span>
        </button>
        
        <div className="profile-indicator">
          <div className="avatar-circle">
            <User size={18} />
          </div>
          <div className="profile-details">
            <span className="profile-name">{user?.email?.split('@')[0]}</span>
            <span className="profile-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
