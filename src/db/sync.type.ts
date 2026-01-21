export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export interface SyncState {
  status: SyncStatus;
  lastSync: Date | null;
  pendingItems: number;
  totalSynced: number;
  errors: Array<{ timestamp: Date; message: string }>;
}

export interface SyncOptions {
  immediate?: boolean;
  force?: boolean;
  silent?: boolean;
}