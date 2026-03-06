// src/admin/ConfirmModal.js
import React from 'react';
import './admin.css';

/**
 * A beautiful, centered confirmation dialog box.
 * Props:
 *   - isOpen: boolean
 *   - title: string
 *   - message: string
 *   - confirmText: string (default "Confirm")
 *   - cancelText: string (default "Cancel")
 *   - confirmColor: string (CSS color, default "#ef4444" = red)
 *   - onConfirm: function
 *   - onCancel: function
 */
const ConfirmModal = ({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = '#ef4444', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          {confirmColor === '#ef4444' ? '⚠️' : '✅'}
        </div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-cancel" onClick={onCancel}>{cancelText}</button>
          <button className="confirm-modal-confirm" style={{ background: confirmColor }} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
