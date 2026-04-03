import React from 'react';
import './RunButton.css';

const RunButton = ({ status, onClick, mini }) => {
  const getButtonConfig = () => {
    switch (status) {
    case 'loading':
      return { text: '●', disabled: true, className: 'run-button--loading' };
    case 'success':
      return { text: '▶', disabled: false, className: 'run-button--success' };
    case 'error':
      return { text: '▶', disabled: false, className: 'run-button--error' };
    default:
      return { text: '▶', disabled: false, className: '' };
    }
  };

  const config = getButtonConfig();

  return (
    <button
      className={`run-button ${config.className} ${mini ? 'run-button--mini' : ''}`}
      onClick={onClick}
      disabled={config.disabled}
    >
      {config.text}
    </button>
  );
};

export default RunButton;
