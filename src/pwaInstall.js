let deferredPrompt = null;
const listeners = new Set();

const notify = () => listeners.forEach((cb) => cb(deferredPrompt !== null));

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export const isRunningStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);

export const isInstallAvailable = () => deferredPrompt !== null;

export const subscribeToInstallAvailability = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const promptInstall = async () => {
  if (!deferredPrompt) return null;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify();
  return choice;
};
