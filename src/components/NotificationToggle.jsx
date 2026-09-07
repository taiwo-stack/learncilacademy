import React, { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { enablePushNotifications, disablePushNotifications, getPushSubscriptionStatus, isPushSupported } from '../utils/push';

// Lets a tutor/student opt in to OS-level push notifications for new chat messages.
export default function NotificationToggle({ userId }) {
  const [status, setStatus] = useState('checking'); // checking | unsupported | denied | default | subscribed
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) { setStatus('unsupported'); return; }
    getPushSubscriptionStatus().then(setStatus);
  }, []);

  if (status === 'unsupported' || status === 'checking') return null;

  const handleClick = async () => {
    setBusy(true);
    try {
      if (status === 'subscribed') {
        await disablePushNotifications();
        setStatus('default');
      } else {
        await enablePushNotifications(userId);
        setStatus('subscribed');
      }
    } catch (err) {
      alert(err.message);
      setStatus(await getPushSubscriptionStatus());
    } finally {
      setBusy(false);
    }
  };

  const label = status === 'subscribed' ? 'Notifications on' : status === 'denied' ? 'Notifications blocked' : 'Enable notifications';
  const Icon = status === 'subscribed' ? BellRing : status === 'denied' ? BellOff : Bell;

  return (
    <button
      onClick={handleClick}
      disabled={busy || status === 'denied'}
      title={status === 'denied' ? 'Notifications are blocked in your browser settings' : label}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: status === 'subscribed' ? 'rgba(16,185,129,0.12)' : 'rgba(15,44,89,0.06)',
        color: status === 'subscribed' ? '#059669' : 'var(--primary-color)',
        border: '1px solid ' + (status === 'subscribed' ? 'rgba(16,185,129,0.3)' : 'rgba(15,44,89,0.15)'),
        borderRadius: '8px', padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: 700,
        cursor: status === 'denied' ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1
      }}
    >
      <Icon size={15} /> {label}
    </button>
  );
}
