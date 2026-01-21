import { db } from "../db/db";
import { OfflineData } from "../components/type";
import { GraphQLClient } from "./api";

interface IIncident {
    category: string,
    description: string,
    urgency: 'normal' | 'medium' | 'high',
    latitude: number,
    longitude: number,
};

export const syncService = {
    saveIncident: async (formData: any, position: { lat: number, lng: number }) => {
        const incidentRequest = {
            ...formData,
            latitude: position.lat,
            longitude: position.lng
        } as IIncident;
        try {
            if (navigator.onLine) {
                await syncService.SendDataToBack(incidentRequest);
                console.log("Send to server");
            } else {
                await syncService.saveForSync(incidentRequest);
                console.log("Add to sync database");
                syncService.triggerSync();
                console.log("Synchronisation scheduled!");
            }
        } catch (error) {
            syncService.saveIncident(formData, position);
            console.log("retrying...");
        }
            
    },
    SendDataToBack: async (incidentRequest: IIncident ) => {
        const apiClient = new GraphQLClient();
        const mutation = `
            mutation CreateIncident($cat: String!, $urgency: String!, $desc: String!, $lat: Float!, $lng: Float!) {
                createIncident(input: { category: $cat, urgency: $urgency, description: $desc, latitude: $lat, longitude: $lng }) { id }
            }
        `;
        return apiClient.execute(mutation, { incidentRequest });
    },
    saveForSync: async <T> (data: T): Promise<number> => {
        const item: OfflineData<T> = {
            data,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            retryCount: 0
        };

        return await db.dataOffline.add(item);
    },
    triggerSync: async (): Promise<void> => {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if ('sync' in registration) {
                await (registration as any).sync.register('sync-data');
            };
            registration.active?.postMessage({
                type: 'TRIGGER_SYNC'
            });
        }
    },
    getSyncStatus: async (): Promise<{pending: number; total: number; lastSync: Date | null}> => {
        const pending = await db.dataOffline
            .where('status').equals('pending')
            .count();
        const total = await db.dataOffline.count();
        const lastSyncStr = await db.metadata.get('lastSync');
        const lastSync = lastSyncStr ? new Date(lastSyncStr.value) : null;
        return { pending, total, lastSync };
    },
    // syncAllPending: async () => {
    //     const pending = await db.pendingIncidents.where('status').equals('pending').toArray();
    //     for (const incident of pending) {
    //         try {

    //             const sucess = await syncService.SendDataToBack({ 
    //                 description: incident.description, 
    //                 latitude: incident.latitude, 
    //                 longitude: incident.longitude,
    //             urgency: incident.urgency, category: incident.category } as IIncident);
    //             if (sucess && incident.id) {
    //                 await db.pendingIncidents.delete(incident.id!);
    //                 console.log(`Incident ${incident.id} deleted .`);
    //             }
    //         } catch (e) {
    //             console.error("Echec de synchro pour l'incident", incident.id);
    //         }
    //     }
    // },
    // requestSync: async () => {
    //     const registration: any = await navigator.serviceWorker.ready;
    //     try {
    //         await registration.sync.register('send-incidents');
    //         console.log("Synchronisation scheduled!");
    //     } catch (error) {
    //             console.log("SBackground Sync Not Supported!");

    //     }
    // }
}