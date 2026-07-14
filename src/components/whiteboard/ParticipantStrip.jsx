import React from 'react';

export default function ParticipantStrip({
  isCollaborating,
  showParticipantStrip,
  participants,
  localUserId,
  userName,
  userColor,
  isMicOn,
  isVideoOn,
  isHandRaised,
  speakingPeers,
  micLevel,
  remoteVideoStreams,
  remoteVideoRefs,
  localVideoStripRef,
  localStreamRef,
  showVideoGrid
}) {
  if (!isCollaborating || !showParticipantStrip) return null;

  // Build participant list: local user first, then speaking peers, then rest
  const allPeers = Object.entries(participants);
  const sorted = [
    [localUserId, {
      userName: userName || 'You',
      color: userColor,
      isMicOn,
      isVideoOn,
      handRaised: isHandRaised,
      isLocal: true
    }],
    ...allPeers
      .filter(([pid]) => pid !== localUserId)
      .sort(([a], [b]) => {
        const aSpeak = speakingPeers.has(a) ? 0 : 1;
        const bSpeak = speakingPeers.has(b) ? 0 : 1;
        return aSpeak - bSpeak;
      })
  ];

  return (
    <div className="participant-strip">
      <div className="participant-strip-label">Participants</div>
      <div className="participant-strip-list">
        {sorted.map(([peerId, pData]) => {
          const pColor = pData?.color || '#6366f1';
          const pName = pData?.userName || 'User';
          const pMicOn = pData?.isMicOn;
          const pVideoOn = pData?.isVideoOn;
          const handRaised = pData?.handRaised;
          const isLocal = pData?.isLocal;
          const isSpeaking = speakingPeers.has(peerId) || (isLocal && micLevel > 5);
          const remoteStream = !isLocal && remoteVideoStreams[peerId];

          return (
            <div
              key={peerId}
              className={`pstrip-tile ${isSpeaking ? 'speaking' : ''}`}
              title={pName + (isLocal ? ' (You)' : '')}
            >
              <div className="pstrip-media">
                {/* Render local video or avatar based on state */}
                {isLocal && (
                  <>
                    <video
                      ref={(el) => {
                        localVideoStripRef.current = el;
                        if (el && localStreamRef.current) el.srcObject = localStreamRef.current;
                      }}
                      className="pstrip-video"
                      autoPlay muted playsInline
                      style={{ display: (isVideoOn && !showVideoGrid) ? 'block' : 'none' }}
                    />
                    {(!isVideoOn || showVideoGrid) && (
                      <div className="pstrip-avatar" style={{ background: pColor }}>
                        {pName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </>
                )}
                {!isLocal && remoteStream && !showVideoGrid ? (
                  <video
                    ref={(el) => {
                      if (el) {
                        remoteVideoRefs.current[peerId] = el;
                        if (el.srcObject !== remoteStream) el.srcObject = remoteStream;
                      }
                    }}
                    className="pstrip-video"
                    autoPlay playsInline
                  />
                ) : null}
                {!isLocal && (!remoteStream || showVideoGrid) && (
                  <div className="pstrip-avatar" style={{ background: pColor }}>
                    {pName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Speaking indicator pulse */}
                {isSpeaking && <div className="pstrip-speaking-ring" />}

                {/* Hand raised indicator badge */}
                {handRaised && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: '#f59e0b',
                    color: '#fff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    border: '1.5px solid #121212',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }} title="Hand Raised">
                    ✋
                  </div>
                )}
              </div>
              <div className="pstrip-name">{isLocal ? 'You' : pName.split(' ')[0]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
