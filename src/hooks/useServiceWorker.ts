import { useState, useEffect } from 'react';
import { Workbox, messageSW } from 'workbox-window';

interface ServiceWorkerState {
  isRegistered: boolean;
  hasUpdate: boolean;
  isOffline: boolean;
  registration: ServiceWorkerRegistration | null;
  installPrompt: any;
}

interface CacheStatus {
  isCached: boolean;
  lastUpdated: number | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    hasUpdate: false,
    isOffline: !navigator.onLine,
    registration: null,
    installPrompt: null,
  });

  const [cacheStatus, setCacheStatus] = useState<Record<string, CacheStatus>>({});

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setState(prev => ({ ...prev, installPrompt: e }));
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = new Workbox('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      // Listen for new service worker waiting
      wb.addEventListener('waiting', (event) => {
        setState((prev) => ({ ...prev, hasUpdate: true }));
      });

      // Listen for successful activation
      wb.addEventListener('activated', (event) => {
        setState((prev) => ({ ...prev, isRegistered: true }));
        // Check cache status after activation
        checkCacheStatus();
      });

      // Listen for controlling change (after skip waiting)
      wb.addEventListener('controlling', (event) => {
        window.location.reload();
      });

      // Listen for service worker messages
      wb.addEventListener('message', (event) => {
        if (event.data.type === 'CACHE_UPDATED') {
          const { cacheName, updatedURL } = event.data.payload;
          setCacheStatus(prev => ({
            ...prev,
            [updatedURL]: {
              isCached: true,
              lastUpdated: Date.now(),
            },
          }));
        }
      });

      // Register service worker
      wb.register()
        .then((registration) => {
          setState((prev) => ({
            ...prev,
            isRegistered: true,
            registration,
          }));

          // Check for updates periodically
          const updateInterval = setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Every hour

          return () => clearInterval(updateInterval);
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);

  const updateServiceWorker = async () => {
    if (state.registration && state.registration.waiting) {
      // Send skip waiting message
      await messageSW(state.registration.waiting, { type: 'SKIP_WAITING' });
    }
  };

  const checkForUpdates = async () => {
    if (state.registration) {
      try {
        await state.registration.update();
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  };

  const checkCacheStatus = async () => {
    if (!state.registration) return;

    try {
      const keys = await caches.keys();
      const status: Record<string, CacheStatus> = {};

      for (const key of keys) {
        const cache = await caches.open(key);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            status[request.url] = {
              isCached: true,
              lastUpdated: new Date(response.headers.get('date') || Date.now()).getTime(),
            };
          }
        }
      }

      setCacheStatus(status);
    } catch (error) {
      console.error('Failed to check cache status:', error);
    }
  };

  const installPWA = async () => {
    if (state.installPrompt) {
      try {
        const result = await state.installPrompt.prompt();
        console.log('Install prompt result:', result);
        setState(prev => ({ ...prev, installPrompt: null }));
      } catch (error) {
        console.error('Failed to install PWA:', error);
      }
    }
  };

  const clearCache = async (cacheName?: string) => {
    try {
      if (cacheName) {
        await caches.delete(cacheName);
      } else {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      await checkCacheStatus();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  return {
    ...state,
    cacheStatus,
    updateServiceWorker,
    checkForUpdates,
    checkCacheStatus,
    installPWA,
    clearCache,
  };
}; 