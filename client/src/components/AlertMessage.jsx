/**
 * Reusable Alert Component (client/src/components/AlertMessage.jsx)
 * Displays Bootstrap dismissible alerts with icons.
 */

import React from 'react';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const iconClass = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill'
  }[type] || 'bi-info-circle-fill';

  return (
    <div className={`alert alert-${type} alert-dismissible fade show d-flex align-items-center mb-3 shadow-sm`} role="alert">
      <i className={`bi ${iconClass} me-2 fs-5`}></i>
      <div className="flex-grow-1">{message}</div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default AlertMessage;
