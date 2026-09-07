import { savePushSubscription, removePushSubscription } from '../services/dataService';

export const isPushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

// Web Push wants the VAPID key as a raw Uint8Array, not the base64url string it's stored as.
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

export const enablePushNotifications = async (userId) => {
  if (!isPushSupported()) throw new Error('Push notifications are not supported in this browser.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) throw new Error('Push notifications are not configured yet.');

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
  }

  await savePushSubscription(userId, subscription);
  return subscription;
};

export const disablePushNotifications = async () => {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await removePushSubscription(subscription.endpoint);
    await subscription.unsubscribe();
  }
};

export const getPushSubscriptionStatus = async () => {
  if (!isPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration) return 'default';
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? 'subscribed' : 'default';
};
