import { useState, useEffect, useCallback } from 'react';
import {
  isPWAInstallable,
  isServiceWorkerSupported,
  isNotificationSupported,
  isPushSupported,
  isBackgroundSyncSupported,
  isOfflineSupported,
  registerServiceWorker,
  unregisterServiceWorker,
  checkForServiceWorkerUpdate,
  skipServiceWorkerWaiting,
  requestNotificationPermission,
} from '../utils/serviceWorker';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAResult {
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  promptInstall: () => Promise<void>;
  features: {
    serviceWorker: boolean;
    notifications: boolean;
    push: boolean;
    backgroundSync: boolean;
    offline: boolean;
  };
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  applyUpdate: () => Promise<void>;
  error: string | null;
}

export const usePWA = (): UsePWAResult => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check PWA features
  const features = {
    serviceWorker: isServiceWorkerSupported(),
    notifications: isNotificationSupported(),
    push: isPushSupported(),
    backgroundSync: isBackgroundSyncSupported(),
    offline: isOfflineSupported(),
  };

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Check if PWA is already installed
  useEffect(() => {
    const checkInstalled = () => {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    };

    checkInstalled();
    window.addEventListener('appinstalled', checkInstalled);
    return () => window.removeEventListener('appinstalled', checkInstalled);
  }, []);

  // Register service worker
  useEffect(() => {
    const init = async () => {
      try {
        if (features.serviceWorker) {
          const reg = await registerServiceWorker();
          if (reg) {
            setRegistration(reg);

            // Check for updates
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setUpdateAvailable(true);
                  }
                });
              }
            });

            // Request notification permission
            if (features.notifications) {
              const permission = await requestNotificationPermission();
              if (permission !== 'granted') {
                console.warn('Notification permission not granted');
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize PWA');
      }
    };

    init();
  }, [features.serviceWorker, features.notifications]);

  // Prompt installation
  const promptInstall = useCallback(async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setInstallPrompt(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to install PWA');
      }
    }
  }, [installPrompt]);

  // Apply service worker update
  const applyUpdate = useCallback(async () => {
    try {
      if (registration?.waiting) {
        await skipServiceWorkerWaiting();
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update PWA');
    }
  }, [registration]);

  return {
    isInstallable,
    isInstalled,
    installPrompt,
    promptInstall,
    features,
    registration,
    updateAvailable,
    applyUpdate,
    error,
  };
};
