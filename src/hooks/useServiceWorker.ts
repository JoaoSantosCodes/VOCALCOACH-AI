import { useState, useEffect } from 'react';
import { Workbox } from 'workbox-window';

interface ServiceWorkerState {
  isRegistered: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    hasUpdate: false,
    registration: null,
  });

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = new Workbox('/service-worker.js');

      // Notifica quando há uma nova versão disponível
      wb.addEventListener('waiting', (event) => {
        setState((prev) => ({ ...prev, hasUpdate: true }));
      });

      // Notifica quando o service worker é instalado com sucesso
      wb.addEventListener('activated', (event) => {
        setState((prev) => ({ ...prev, isRegistered: true }));
      });

      // Notifica em caso de erro
      wb.addEventListener('controlling', (event) => {
        window.location.reload();
      });

      // Registra o service worker
      wb.register()
        .then((registration) => {
          setState((prev) => ({
            ...prev,
            isRegistered: true,
            registration,
          }));

          // Verifica atualizações a cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);

  const updateServiceWorker = async () => {
    if (state.registration && state.registration.waiting) {
      // Envia mensagem para o service worker atualizar
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
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

  return {
    ...state,
    updateServiceWorker,
    checkForUpdates,
  };
}; 