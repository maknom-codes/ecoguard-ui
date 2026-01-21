// Déclarations globales pour les APIs navigateur
interface ServiceWorkerRegistration {
  periodicSync?: {
    register(tag: string, options: { minInterval: number }): Promise<void>;
    unregister(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  };
};

interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
};

interface ServiceWorkerGlobalScopeEventMap {
  periodicsync: PeriodicSyncEvent;
};

interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string;
};

interface Window {
  __WB_MANIFEST?: Array<{ url: string; revision: string }>;
};

// Pour les événements personnalisés
interface SyncCompleteEvent extends CustomEvent {
  detail: {
    count: number;
    timestamp: string;
  };
};

interface Window {
  Dexie?: any;
};

interface Client {
  readonly id: string;
  readonly type: ClientTypes;
  readonly url: string;
  postMessage(message: any, transfer?: Transferable[]): void;
}

interface Navigator {
  storage?: StorageManager;
};

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PUBLIC_URL: string;
    REACT_APP_SYNC_ENABLED?: string;
    REACT_APP_WS_URL: string;
    REACT_APP_BASE_URL: string
  }
};