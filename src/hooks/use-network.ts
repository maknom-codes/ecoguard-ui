import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // 1. Détecteurs d'événements du navigateur
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // 2. Double vérification réelle (Heartbeat)
    // Utile si le garde est connecté au Wi-Fi mais que le Wi-Fi n'a pas internet
    // const checkActualConnection = async () => {
    //   try {
    //     const response = await fetch('http://localhost:8081/graphql', { 
    //       method: 'HEAD', 
    //       cache: 'no-store' 
    //     });
    //     setIsOnline(response.ok);
    //   } catch {
    //     setIsOnline(false);
    //   }
    // };

    // const interval = setInterval(checkActualConnection, 10000); // Test toutes les 10s

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    //   clearInterval(interval);
    };
  }, []);

  return isOnline;
}
