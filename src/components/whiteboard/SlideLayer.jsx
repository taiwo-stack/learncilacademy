import React from 'react';
import SandboxedFrame from '../SandboxedFrame';

// Live HTML teaching slide, rendered behind the drawing canvas so the tutor can
// annotate directly on top of it with the existing pen/highlighter/shape tools.
// `interactive` toggles whether clicks reach the slide (for using its own buttons/
// links) or pass through to nothing so the canvas underneath can be drawn on instead.
export default function SlideLayer({ slideUrl, interactive }) {
  if (!slideUrl) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <SandboxedFrame src={slideUrl} title="Teaching slide" allowInteraction={interactive} />
    </div>
  );
}
