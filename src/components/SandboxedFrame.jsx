import React from 'react';

// Renders an uploaded HTML file safely: scripts run (so interactive slide decks work),
// but the frame gets no access to our cookies, localStorage, or the parent window —
// deliberately omitting `allow-same-origin` alongside `allow-scripts` is what makes that hold.
export default function SandboxedFrame({ src, title = 'Slide content', allowInteraction = true, style }) {
  return (
    <iframe
      src={src}
      title={title}
      sandbox="allow-scripts"
      style={{
        border: 'none',
        width: '100%',
        height: '100%',
        background: 'white',
        pointerEvents: allowInteraction ? 'auto' : 'none',
        ...style
      }}
    />
  );
}
