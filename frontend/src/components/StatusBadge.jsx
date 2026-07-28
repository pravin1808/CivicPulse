import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getDisplayStatus = (statusStr) => {
    if (!statusStr) return 'Unknown';
    return statusStr.replace('_', ' ');
  };

  const getClassName = (statusStr) => {
    if (!statusStr) return 'badge-unknown';
    return `badge-${statusStr.toLowerCase().replace('_', '')}`;
  };

  return (
    <span className={`status-badge ${getClassName(status)}`}>
      {getDisplayStatus(status)}
    </span>
  );
};

export default StatusBadge;
