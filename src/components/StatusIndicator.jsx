import React from 'react';
import './StatusIndicator.css';

const StatusIndicator = ({ status, mini }) => {
  const getStatusConfig = () => {
    switch (status) {
    case 'loading':
      return { icon: '●', className: 'status--loading' };
    case 'success':
      return { icon: '✓', className: 'status--success' };
    case 'error':
      return { icon: '✗', className: 'status--error' };
    default:
      return { icon: '○', className: '' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`status-indicator ${config.className} ${mini ? 'status-indicator--mini' : ''}`}>
      {config.icon}
    </span>
  );
};

export default StatusIndicator;
