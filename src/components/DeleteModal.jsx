import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteModal({ itemToDelete, cancelDelete, confirmDelete }) {
  if (itemToDelete === null) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon-container">
          <AlertTriangle size={32} className="modal-warning-icon" />
        </div>
        <h3>Delete Receipt?</h3>
        <p>
          Are you sure you want to permanently delete this receipt from your spreadsheet?
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={cancelDelete}>
            Cancel
          </button>
          <button className="danger-btn" onClick={confirmDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
