import React, { useEffect, useState } from 'react';

// Renders an uploaded HTML file safely: scripts run (so interactive slide decks work),
// but the frame gets no access to our cookies, localStorage, or the parent window —
// deliberately omitting `allow-same-origin` alongside `allow-scripts` is what makes that hold.
//
// We fetch the file ourselves and load it via `srcDoc` rather than pointing `src` straight
// at the storage URL. Supabase Storage (like most object storage) deliberately serves
// uploaded .html files as Content-Type: text/plain with a locked-down CSP, specifically to
// stop hosted files from executing as live pages when linked to directly - so `src={url}`
// would just show the raw source as text. `srcDoc` hands the browser literal HTML to
// render, bypassing whatever Content-Type the file was served with.
export default function SandboxedFrame({ src, title = 'Slide content', allowInteraction = true, style }) {
  const [html, setHtml] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    setFailed(false);
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch slide (' + res.status + ')');
        return res.text();
      })
      .then((text) => { if (!cancelled) setHtml(text); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [src]);

  if (failed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8', background: 'white', ...style }}>
        Failed to load slide content.
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html ?? ''}
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
