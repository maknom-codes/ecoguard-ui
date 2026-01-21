export interface Config {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
    onOfflineReady?: () => void;
};


export function register(config?: Config) {
  if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    
    if (publicUrl.origin !== window.location.origin) {
      return;
    }
    
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sync-service-worker.js`;
      
      if (isLocalhost) {
        console.log(isLocalhost)
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('Service Worker prêt en développement');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('Nouveau contenu disponible');

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Application prête pour usage hors ligne');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
      
      // Configurer la synchronisation périodique
      setupPeriodicSync(registration);
      
      // Écouter les messages du Service Worker
      setupMessageListener(registration);
    })
    .catch((error) => {
      console.error('Erreur enregistrement Service Worker:', error);
    });
}

async function setupPeriodicSync(registration: ServiceWorkerRegistration) {
  if ('periodicSync' in registration) {
    try {
      await (registration as any).periodicSync.register('sync-data', {
        minInterval: 24 * 60 * 60 * 1000, // 24 heures
      });
      console.log('Synchronisation périodique configurée');
    } catch (error) {
      console.log('Synchronisation périodique non supportée:', error);
    }
  }
}

function setupMessageListener(registration: ServiceWorkerRegistration) {
  registration.addEventListener('message', (event: any) => {
    const { data } = event;
    
    switch (data.type) {
      case 'SYNC_COMPLETE':
        console.log(`Synchronisation réussie: ${data.payload.count} éléments`);
        
        // Émettre un événement personnalisé
        window.dispatchEvent(new CustomEvent('sync:complete', {
          detail: data.payload
        }));
        break;
        
      case 'SYNC_ERROR':
        console.error('Erreur synchronisation:', data.payload.error);
        
        window.dispatchEvent(new CustomEvent('sync:error', {
          detail: data.payload
        }));
        break;
    }
  });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('Pas de connexion Internet. Application en mode hors ligne.');
      
      if (config && config.onOfflineReady) {
        config.onOfflineReady();
      }
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);




