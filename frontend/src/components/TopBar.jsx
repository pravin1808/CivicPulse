import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Bell } from 'lucide-react';
import './TopBar.css';

const TopBar = ({ title }) => {
  const { user } = useAuth();

  const profileContent = (
    <div className={`profile-indicator ${user?.role === 'citizen' ? 'clickable' : ''}`}>
      <div className="avatar-circle">
        <User size={18} />
      </div>
      <div className="profile-details">
        <span className="profile-name">{user?.email?.split('@')[0]}</span>
        <span className="profile-role">{user?.role}</span>
      </div>
    </div>
  );

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
        
        {user?.role === 'citizen' ? (
          <Link to="/citizen/profile" title="View Profile">
            {profileContent}
          </Link>
        ) : (
          profileContent
        )}
      </div>
    </header>
  );
};

export default TopBar;
