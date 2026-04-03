import React from 'react';
import './FloatingButtons.css';

const FloatingButtons = ({ onClick }) => {
  return (
    <div className="floating-buttons">
      <button
        className="floating-btn floating-btn--ai"
        onClick={onClick}
        title="AI Assistant"
      >
        <span className="floating-btn__icon">🤖</span>
        <span className="floating-btn__label">AI</span>
      </button>
    </div>
  );
};

export default FloatingButtons;
