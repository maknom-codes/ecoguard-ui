/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

// @ts-nocheck
/// <reference lib="webworker" />

// Import Dexie via importScripts
importScripts('/dexie.min.js');


const API_URL = 'http://localhost:8081/grapql';
const DB_NAME = 'EcoGuardDB';
const STORE_NAME = 'dataOffline';
const SYNC_TAG = 'sync-data';
const VERSION = '1.0.0';
const db = new Dexie(DB_NAME);


db.version(1).stores({
    dataOffline: '++id, synced, createdAt',
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
 * @property {boolean} synced
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {number} retryCount
 * @property {Date} [lastRetry]
 */

/**
 * @returns {Promise<Dexie>}
 */
function openDatabase() {
  try {
    return new self.Dexie(DB_NAME).open();
  } catch (error) {
    console.error('[SW] Erreur ouverture DB:', error);
    throw error;
  }
}

/**
 * @returns {Promise<OfflineItem[]>}
 */
async function getUnsyncedData() {
  try {
    const db = await openDatabase();
    
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
      .sort((a, b) => a.data.urgency.localCompare(b.data.urgency))
      .limit(CONFIG.batchSize)
      .toArray();
    
    return unsynced;
  } catch (error) {
    console.error('[SW] Erreur récupération données:', error);
    return [];
  }
}

/**
 * @param {number[]} ids
 * @returns {Promise<void>}
 */
async function markAsSynced(ids) {
  try {
    const db = await openDatabase();
    await db.table(STORE_NAME)
      .where('id').anyOf(ids)
      .modify({ 
        synced: true, 
        syncedAt: new Date(),
        retryCount: 0
      });
  } catch (error) {
    console.error('[SW] Erreur marquage synchronisé:', error);
  }
}

/**
 * @param {number[]} ids
 * @returns {Promise<void>}
 */
async function incrementRetryCount(ids) {
  try {
    const db = await openDatabase();
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
 * @returns {Promise<{success: boolean, count: number}>}
 */
async function syncData() {
  console.log(`[SW v${VERSION}] Début synchronisation`);
  
  try {
    const data = await getUnsyncedData();
    
    if (data.length === 0) {
      console.log('[SW] Aucune donnée à synchroniser');
      return { success: true, count: 0 };
    }
    
    console.log(`[SW] ${data.length} données à synchroniser`);
    
    const batches = [];
    for (let i = 0; i < data.length; i += CONFIG.batchSize) {
      batches.push(data.slice(i, i + CONFIG.batchSize));
    }
    
    let totalSynced = 0;
    const token = localStorage.getItem('token');
    // const mutation = `
    //     mutation CreateIncident($cat: String!, $urgency: String!, $desc: String!, $lat: Float!, $lng: Float!) {
    //         createIncident(input: { category: $cat, urgency: $urgency, description: $desc, latitude: $lat, longitude: $lng }) { id }
    //     }
    // `;
    for (const batch of batches) {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Version': VERSION,
          'X-Client-ID': await getClientId(),
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          items: batch.map(item => item.data),
          metadata: {
            timestamp: new Date().toISOString(),
            count: batch.length,
            source: 'service-worker'
          }
        })
      });
      
      if (response.ok) {
        const ids = batch.map(item => item.id);
        await markAsSynced(ids);
        totalSynced += batch.length;
        
        console.log(`[SW] Lot synchronisé: ${batch.length} items`);
      } else {
        console.error(`[SW] Erreur serveur: ${response.status}`);
        
        const ids = batch.map(item => item.id);
        await incrementRetryCount(ids);
        
        throw new Error(`HTTP ${response.status}`);
      }
    }
    
    // Notifier tous les clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        payload: {
          count: totalSynced,
          timestamp: new Date().toISOString(),
          pending: data.length - totalSynced
        }
      });
    });
    
    console.log(`[SW] Synchronisation terminée: ${totalSynced}/${data.length}`);
    return { success: true, count: totalSynced };
    
  } catch (error) {
    console.error('[SW] Erreur synchronisation:', error);
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ERROR',
        payload: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    });
    
    return { success: false, count: 0 };
  }
}

/**
 * Génère ou récupère un ID client
 * @returns {Promise<string>}
 */
async function getClientId() {
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
    event.waitUntil(syncData());
  }
});

self.addEventListener('online', () => {
  console.log('[SW] Connexion rétablie');
  syncData().catch(console.error);
});

// Messages depuis l'application
self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch (data?.type) {
    case 'TRIGGER_SYNC':
      console.log('[SW] Synchronisation manuelle demandée');
      event.waitUntil(syncData());
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
    event.waitUntil(syncData());
  }
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('[SW] Erreur globale:', event.error);
});