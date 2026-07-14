import React from 'react';
import { generateRandomName } from './constants';

export default function NameModal({
  showNameModal,
  roomId,
  userName,
  setUserName,
  startCollaboration
}) {
  if (!showNameModal) return null;

  return (
    <div className="whiteboard-modal-overlay" style={{ zIndex: 11000 }}>
      <div className="whiteboard-modal" style={{ maxWidth: '400px' }}>
        <div className="modal-header">Join Virtual Classroom</div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.95rem', lineHeight: '1.4' }}>
            Enter your name to start collaborating on the tutor's whiteboard.
          </p>
          <input 
            type="text" 
            placeholder="Enter name (e.g. Student Alex)" 
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userName.trim() !== '') {
                startCollaboration(roomId, userName.trim(), false);
              }
            }}
          />
        </div>
        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button 
            className="whiteboard-btn" 
            onClick={() => {
              const defaultName = generateRandomName();
              startCollaboration(roomId, defaultName, false);
            }}
          >
            Quick Join
          </button>
          <button 
            className="whiteboard-btn primary" 
            disabled={userName.trim() === ''}
            onClick={() => startCollaboration(roomId, userName.trim(), false)}
          >
            Join Classroom
          </button>
        </div>
      </div>
    </div>
  );
}
