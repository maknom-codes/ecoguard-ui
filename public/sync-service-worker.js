/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

importScripts('/dexie.min.js');


const API_URL = 'http://localhost:8081/graphql';
const DB_NAME = 'EcoGuardDB';
const STORE_NAME = 'dataOffline';
const SYNC_TAG = 'sync-data';
const VERSION = '1.0.0';
const db = new Dexie(DB_NAME);

db.version(1).stores({
    dataOffline: '++id, createdAt, status',
    metadata: 'key'
}).upgrade((trans) => {
    return trans.dataOffline.toCollection().modify((item)=> {
        item.retryCount = 0;
        item.lastRetry = null;
        item.updateAt = new Date()
    });
});

db.open().then(() => {
    console.log("Base de données EcoGuardDB ouverte avec succès");
}).catch(err => {
    console.error("Erreur lors de l'ouverture de Dexie:", err);
});

// Configuration
const CONFIG = {
  maxRetries: 3,
  retryDelay: 5000,
  batchSize: 50,
  syncInterval: 60 * 60 * 1000 // 1 heure
};

/**
 * @typedef {Object} OfflineItem
 * @property {number} id
 * @property {any} data
 * @property {string} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {number} retryCount
 * @property {Date} [lastRetry]
 */


const SYNC_MUTATION = `
  mutation SyncOfflineData($items: [SyncItemInput!]!) {
    syncOfflineData(items: $items) {
      success
      syncedIds
      failedIds
      message
    }
  }
`;

const AUTH_CHECK_QUERY = `
  query AuthCheck {
    authCheck {
      authenticated
      message
    }
  }
`;


class GraphQLSyncManager {

  constructor() {
    this.isAuthenticated = false;
  }

  async executeGraphQL(query, variables = null) {
    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Source-SW': 'EcoGuard-Offline-Agent',
      },
      body: JSON.stringify({
        query,
        variables,
        operationName: this.getOperationName(query),
      }),
    });

    if (response.status === 401) {
      console.log('[SW] Non authentifié, tentative de refresh token...');
      await this.refreshToken();
      return this.executeGraphQL(query, variables);
    }

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('[SW] GraphQL errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  async checkAuthentication() {
    try {
      const data = await this.executeGraphQL(AUTH_CHECK_QUERY);
      this.isAuthenticated = data.authCheck.authenticated;
      return this.isAuthenticated;
    } catch (error) {
      console.log('[SW] Auth check failed:', error.message);
      this.isAuthenticated = false;
      return false;
    }
  }

  async refreshToken() {
    const REFRESH_MUTATION = `
      mutation RefreshToken {
        refreshToken {
          success
          message
        }
      }
    `;

    try {
      await this.executeGraphQL(REFRESH_MUTATION);
      console.log('[SW] Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[SW] Token refresh failed:', error);
      
      // Demander à l'application de se reconnecter
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'AUTH_REQUIRED',
          reason: 'refresh_failed',
          timestamp: new Date().toISOString(),
        });
      });
      
      return false;
    }
  }


  /**
 * Synchronise les données avec le backend
 * @returns {Promise<{success: boolean, count: number}>}
 */
  async syncData() {
    console.log('[SW] Début synchronisation GraphQL');
    
    if (!await this.checkAuthentication()) {
      console.log('[SW] Non authentifié, annulation');
      return { success: false, synced: 0 };
    }
    
    const unsyncedData = await this.getUnsyncedData();
    
    if (unsyncedData.length === 0) {
      console.log('[SW] Aucune donnée à synchroniser');
      return { success: true, synced: 0 };
    }
    
    console.log(`[SW] ${unsyncedData.length} données à synchroniser`);
    
    const variables = {
      items: unsyncedData.map(item => ({
        id: item.id,
        incidentRequest: {
          category: item.data.category,
          description: item.data.description,
          urgency: item.data.urgency,
          latitude: item.data.latitude,
          longitude: item.data.longitude,
          // reportDate: new Date().toISOString()
        },
        timestamp: item.createdAt
      })),
    };
    
    try {
      const result = await this.executeGraphQL(SYNC_MUTATION, { items: variables.items });
      
      if (result.syncOfflineData.success) {
        await this.markAsSynced(result.syncOfflineData.syncedIds);
        
        console.log(`[SW] ${result.syncOfflineData.syncedIds.length} données synchronisées`);
        
        await this.notifyClients({
          type: 'SYNC_COMPLETE',
          payload: {
            count: result.syncOfflineData.syncedIds.length,
            timestamp: new Date().toISOString(),
            message: result.syncOfflineData.message,
          },
        });
        
        return { 
          success: true, 
          synced: result.syncOfflineData.syncedIds.length 
        };
      } else {
        await this.handleSyncFailure(
          unsyncedData.map(item => item.id),
          result.syncOfflineData.failedIds
        );
        
        return { success: false, synced: 0 };
      }
      
    } catch (error) {
      console.error('[SW] Erreur synchronisation GraphQL:', error);
      return { success: false, synced: 0 };
    }
  }

  getOperationName(query) {
    const match = query.match(/(mutation|query|subscription)\s+(\w+)/);
    return match ? match[2] : null;
  }

  
/**
 * @returns {Promise<OfflineItem[]>}
*/
  async getUnsyncedData() {
    try {
        const db = await this.openDatabase();
        
        if (!db.tables.some(table => table.name === STORE_NAME)) {
            console.log('[SW] Store non trouvé:', STORE_NAME);
            return [];
        }
        
        const unsynced = await db.table(STORE_NAME)
            .where('status').equals('pending')
            .filter(item => {
                if (item.retryCount >= CONFIG.maxRetries) return false;
                if (item.lastRetry) {
                const timeSinceLastRetry = Date.now() - new Date(item.lastRetry).getTime();
                return timeSinceLastRetry > CONFIG.retryDelay;
                }
                return true;
            })
            .toArray();
        unsynced.sort((a, b) => a.data.urgency.localeCompare(b.data.urgency));
        return unsynced.slice(0, CONFIG.batchSize);
    } catch (error) {
        console.error('[SW] Erreur récupération données:', error);
        return [];
    }

  }

  /**
 * Marque les données comme synchronisées
 * @param {number[]} ids
 * @returns {Promise<void>}
 */
  async markAsSynced(ids) {
    try {
        const db = await this.openDatabase();
        const numericIds = ids.map(id => Number(id));

        const count = await db.table(STORE_NAME)
            .where('id').anyOf(numericIds)
            .modify({ 
                status: 'synced', 
                syncedAt: new Date(),
                retryCount: 0
            });
        console.log(`[SW] ${count} enregistrement(s) marqué(s) comme synchronisé(s).`);

    } catch (error) {
        console.error('[SW] Erreur marquage synchronisé:', error);
    }
  }



/**
 * @param {number[]} ids
 * @returns {Promise<void>}
 */
async incrementRetryCount(ids) {
  try {
    const db = await this.openDatabase();
    await db.table(STORE_NAME)
      .where('id').anyOf(ids)
      .modify(item => {
        item.retryCount = (item.retryCount || 0) + 1;
        item.lastRetry = new Date();
      });
  
  } catch (error) {
    console.error('[SW] Erreur incrémentation retry:', error);
  }
}


/**
 * @param {number[]} allIds 
 * @param {number[]} failedIds 
 */
async handleSyncFailure(allIds, failedIds) {
  const successfulIds = allIds.filter(id => !failedIds.includes(id));
    if (failedIds.length > 0) {
    await this.incrementRetryCount(failedIds);
  }
  if (successfulIds.length > 0) {
    await db.dataOffline.bulkUpdate(successfulIds.map(id => ({
      key: id,
      changes: {
        status: 'synced',
        syncedAt: new Date().toISOString(),
        retryCount: 0, 
        lastRetry: null 
      }
    })));
    console.log(`[SW] Marqué ${successfulIds.length} éléments comme synchronisés.`);
  }

  // if (successfulIds.length > 0) {
  //   await db.dataOffline.bulkDelete(successfulIds);
  // }
}

  /**
 * @returns {Promise<Dexie>}
 */
  async openDatabase() {
    try {
        return new self.Dexie(DB_NAME).open();
    } catch (error) {
        console.error('[SW] Erreur ouverture DB:', error);
        throw error;
    }

  }

  async notifyClients(message) {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage(message);
    });
  }

/**
 * Génère ou récupère un ID client
 * @returns {Promise<string>}
 */
async getClientId() {
  try {
    const db = await openDatabase();
    let clientId = await db.table('metadata').get('clientId');
    
    if (!clientId) {
      clientId = 'client_' + Math.random().toString(36).substr(2, 9);
      await db.table('metadata').put({ key: 'clientId', value: clientId });
    }
    
    return clientId.value;
  } catch (error) {
    return 'unknown_client';
  }
}

}


const syncManager = new GraphQLSyncManager();

self.addEventListener('install', (event) => {
  console.log('[SW] Installation');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activation');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === SYNC_TAG) {
    console.log('[SW] Synchronisation périodique');
    event.waitUntil(syncManager.syncData());
  }
});

self.addEventListener('online', () => {
  console.log('[SW] Connexion rétablie');
  syncManager.syncData().catch(console.error);
});

self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch (data?.type) {
    case 'TRIGGER_SYNC':
      console.log('[SW] Synchronisation manuelle demandée');
      event.waitUntil(syncManager.syncData());
      break;
      
    case 'GET_SYNC_STATUS':
      event.source.postMessage({
        type: 'SYNC_STATUS',
        payload: { status: 'active', version: VERSION }
      });
      break;
      
    default:
      console.log('[SW] Message inconnu:', data);
  }
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    console.log('[SW] Background Sync déclenché');
    event.waitUntil(syncManager.syncData());
  }
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('[SW] Erreur globale:', event.error);
});

