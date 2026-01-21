import { useState, useEffect, useCallback } from 'react';
import { SyncStatus } from '../db/sync.type';
import { syncService } from '../services/sync-service';

interface UseSyncReturn {
  status: SyncStatus;
  pendingItems: number;
  totalItems: number;
  lastSync: Date | null;
  sync: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSync(): UseSyncReturn {
  const [status, setStatus] = useState<SyncStatus>(SyncStatus.IDLE);
  const [pendingItems, setPendingItems] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { pending, total, lastSync } = await syncService.getSyncStatus();
      setPendingItems(pending);
      setTotalItems(total);
      setLastSync(lastSync);
    } catch (error) {
      console.error('Erreur rafraîchissement statut:', error);
    }
  }, []);

  const sync = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus(SyncStatus.OFFLINE);
      return;
    }

    setStatus(SyncStatus.SYNCING);
    
    try {
      await syncService.triggerSync();
    } catch (error) {
      setStatus(SyncStatus.ERROR);
      console.error('Erreur déclenchement synchronisation:', error);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);

    const handleSyncComplete = (event: Event) => {
      const customEvent = event as CustomEvent;
      setStatus(SyncStatus.SUCCESS);
      setLastSync(new Date(customEvent.detail.timestamp));
      refresh();
    };

    const handleSyncError = () => {
      setStatus(SyncStatus.ERROR);
      refresh();
    };

    const handleOnline = () => {
      setStatus(SyncStatus.IDLE);
      refresh();
    };

    const handleOffline = () => {
      setStatus(SyncStatus.OFFLINE);
    };

    window.addEventListener('sync:complete', handleSyncComplete);
    window.addEventListener('sync:error', handleSyncError);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sync:complete', handleSyncComplete);
      window.removeEventListener('sync:error', handleSyncError);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refresh]);

  return {
    status,
    pendingItems,
    totalItems,
    lastSync,
    sync,
    refresh
  };
}