import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, badgeText, badgeType }) => {
  const getBadgeClass = () => {
    switch (badgeType) {
      case 'success': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'danger': return 'badge-danger';
      case 'info': return 'badge-info';
      default: return 'badge-default';
    }
  };

  return (
    <div className="stat-card glass-card">
      <div className="stat-card-main">
        <div className="stat-card-icon">
          {icon}
        </div>
        {badgeText && (
          <span className={`stat-badge ${getBadgeClass()}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div className="stat-card-details">
        <span className="stat-title">{title}</span>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
