import React from 'react';
import { 
  ChevronLeft, 
  Undo2, 
  Redo2, 
  Download, 
  MonitorPlay, 
  Trash2, 
  Share2, 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  ChevronUp 
} from 'lucide-react';

export default function WhiteboardHeader({
  isHeaderCollapsed,
  setIsHeaderCollapsed,
  navigate,
  undoStack,
  redoStack,
  handleUndo,
  handleRedo,
  isCollaborating,
  hasDrawAccess,
  isHost,
  elements,
  handleExport,
  isProcessingPdf,
  pdfProgress,
  pdfInputRef,
  setShowClearModal,
  initiateRoomCollab,
  showCollabSidebar,
  setShowCollabSidebar,
  participants,
  isMicOn,
  toggleMicrophone,
  micLevel,
  isVideoOn,
  toggleCamera,
  showVideoGrid,
  setShowVideoGrid,
  showParticipantStrip,
  setShowParticipantStrip,
  isHandRaised,
  toggleRaiseHand
}) {
  return (
    <header className={`whiteboard-header ${isHeaderCollapsed ? 'collapsed' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button className="whiteboard-btn-icon" onClick={() => navigate(-1)} data-tooltip="Go Back">
          <ChevronLeft size={20} />
        </button>
        
        <div className="whiteboard-logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/images/logo_icon.png" alt="Foundaxia Logo" className="whiteboard-logo-icon" />
          <img src="/images/logo_text.png" alt="Foundaxia Text" className="whiteboard-logo-text" />
        </div>
        
        <div className="whiteboard-title-block">
          <span style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: '0.2px' }}>Interactive Canvas</span>
          <span className="whiteboard-badge">Online Classroom</span>
        </div>
      </div>

      {/* Undo/Redo & Save Buttons */}
      <div className="whiteboard-top-controls">
        <button 
          className="whiteboard-btn-icon" 
          onClick={handleUndo} 
          disabled={undoStack.length === 0 || (isCollaborating && !hasDrawAccess)}
          data-tooltip="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button 
          className="whiteboard-btn-icon" 
          onClick={handleRedo} 
          disabled={redoStack.length === 0 || (isCollaborating && !hasDrawAccess)}
          data-tooltip="Redo (Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />

        <button 
          className="whiteboard-btn primary" 
          onClick={handleExport}
          disabled={elements.length === 0}
          data-tooltip="Export classroom notes"
        >
          <Download size={16} />
          <span>Export Board</span>
        </button>

        {/* PDF / Presentation Upload — Host only */}
        {isHost && (
          <button
            className="whiteboard-btn"
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              opacity: isProcessingPdf ? 0.6 : 1,
              cursor: isProcessingPdf ? 'not-allowed' : 'pointer'
            }}
            onClick={() => !isProcessingPdf && pdfInputRef.current?.click()}
            data-tooltip="Upload a PDF presentation and sync to all students"
            disabled={isProcessingPdf}
          >
            <MonitorPlay size={16} />
            <span>{isProcessingPdf ? `Importing ${pdfProgress.current}/${pdfProgress.total}…` : 'Upload Deck'}</span>
          </button>
        )}

        <button 
          className="whiteboard-btn danger" 
          onClick={() => setShowClearModal(true)}
          disabled={elements.length === 0 || (isCollaborating && !isHost)}
          data-tooltip={isHost ? "Wipe canvas board" : "Only the tutor can clear the board"}
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />

        {!isCollaborating ? (
          <button 
            className="whiteboard-btn" 
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}
            onClick={initiateRoomCollab}
            data-tooltip="Invite students to collaborate"
          >
            <Share2 size={16} />
            <span>Invite / Collaborate</span>
          </button>
        ) : (
          <>
            <button 
              className={`whiteboard-btn ${showCollabSidebar ? 'primary' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setShowCollabSidebar(prev => !prev)}
              data-tooltip="View online participants"
            >
              <Users size={16} />
              <span>Classroom ({Object.keys(participants).length})</span>
            </button>

            {/* Mic button with audio level ring */}
            <div className="mic-level-wrapper" data-tooltip={isMicOn ? "Mute Microphone" : "Unmute Microphone"}>
              {isMicOn && (
                <svg className="mic-level-ring" viewBox="0 0 44 44" width="44" height="44">
                  <circle
                    cx="22" cy="22" r="19"
                    fill="none"
                    stroke="rgba(52,211,153,0.25)"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="22" cy="22" r="19"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    strokeDasharray={`${(micLevel / 100) * 119.4} 119.4`}
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                    style={{ transition: 'stroke-dasharray 0.05s linear' }}
                  />
                </svg>
              )}
              <button 
                className={`whiteboard-btn-icon ${isMicOn ? 'active' : ''}`} 
                style={{ 
                  background: isMicOn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isMicOn ? '#34d399' : '#f87171',
                  borderColor: isMicOn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px'
                }}
                onClick={toggleMicrophone}
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
            </div>

            <button
              className={`whiteboard-btn-icon ${isVideoOn ? 'active' : ''}`}
              style={{
                background: isVideoOn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isVideoOn ? '#34d399' : '#f87171',
                borderColor: isVideoOn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                width: '38px',
                height: '38px',
                borderRadius: '10px'
              }}
              onClick={toggleCamera}
              data-tooltip={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            <button
              className="whiteboard-btn-icon"
              style={{
                background: showVideoGrid ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                color: showVideoGrid ? '#818cf8' : 'rgba(255,255,255,0.5)',
                borderColor: showVideoGrid ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255,255,255,0.1)',
                width: '38px',
                height: '38px',
                borderRadius: '10px'
              }}
              onClick={() => setShowVideoGrid(prev => !prev)}
              data-tooltip={showVideoGrid ? "Hide Video Grid" : "Show Video Grid"}
            >
              <MonitorPlay size={18} />
            </button>

            <button
              className="whiteboard-btn-icon"
              style={{
                background: showParticipantStrip ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                color: showParticipantStrip ? '#818cf8' : 'rgba(255,255,255,0.5)',
                borderColor: showParticipantStrip ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255,255,255,0.1)',
                width: '38px',
                height: '38px',
                borderRadius: '10px'
              }}
              onClick={() => setShowParticipantStrip(prev => !prev)}
              data-tooltip={showParticipantStrip ? "Hide Participant Strip" : "Show Participant Strip"}
            >
              <Users size={18} />
            </button>

            {!isHost && (
              <button
                className="whiteboard-btn-icon"
                style={{
                  background: isHandRaised ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.05)',
                  color: isHandRaised ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                  borderColor: isHandRaised ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.1)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px'
                }}
                onClick={toggleRaiseHand}
                data-tooltip={isHandRaised ? "Lower Hand" : "Raise Hand"}
              >
                <Hand size={18} style={isHandRaised ? { transform: 'scale(1.15)', transition: 'all 0.2s' } : {}} />
              </button>
            )}
          </>
        )}

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />

        <button 
          className="whiteboard-btn-icon" 
          onClick={() => setIsHeaderCollapsed(true)}
          data-tooltip="Collapse Header"
        >
          <ChevronUp size={18} />
        </button>
      </div>
    </header>
  );
}
