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

  // While the fetch is in flight, show something rather than a blank white pane -
  // otherwise a slower connection makes an in-progress load look like a broken/blank slide.
  if (html === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8', background: 'white', gap: '0.6rem', ...style }}>
        <div className="loading-spinner" style={{ borderColor: 'rgba(15, 44, 89, 0.15)', borderTopColor: 'var(--primary-color)', width: '20px', height: '20px' }} />
        Loading slide…
      </div>
    );
  }

  return (
    <iframe
      // Forces a full remount instead of React mutating srcDoc on an existing iframe -
      // some browsers don't reliably reload an iframe's document when only its srcDoc
      // property changes on an already-mounted element.
      key={src}
      srcDoc={html}
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
