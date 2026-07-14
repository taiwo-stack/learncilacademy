import React from 'react';

export default function WipeBoardModal({
  showClearModal,
  setShowClearModal,
  clearBoard
}) {
  if (!showClearModal) return null;

  return (
    <div className="whiteboard-modal-overlay">
      <div className="whiteboard-modal">
        <div className="modal-header">Wipe Board Canvas</div>
        <div className="modal-body">
          Are you sure you want to delete all elements and drawings? This action will clear your workspace but can be undone via Undo (Ctrl+Z).
        </div>
        <div className="modal-footer">
          <button className="whiteboard-btn" onClick={() => setShowClearModal(false)}>
            Cancel
          </button>
          <button className="whiteboard-btn danger" onClick={clearBoard}>
            Clear Board
          </button>
        </div>
      </div>
    </div>
  );
}
