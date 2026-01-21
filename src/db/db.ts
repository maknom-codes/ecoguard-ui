import Dexie, { Table } from "dexie";
import { OfflineData } from "../components/type";


export interface IEcoGuardDatabase extends Dexie {
  dataOffline: Table<OfflineData, number>;
  metadata: Table<{ key: string; value: any }, string>;
}

export class EcoGuardDatabase extends Dexie implements IEcoGuardDatabase {
    dataOffline!: Table<OfflineData, number>;
    metadata!: Table<{ key: string; value: any }, string>;

    constructor() {
        super('EcoGuardDB');
        this.version(1).stores({
            dataOffline: '++id, status, createdAt',
            metadata: 'key'
        }).upgrade((trans: any) => {
            return trans.dataOffline.toCollection().modify((item: any )=> {
                item.retryCount = 0;
                item.lastRetry = null;
                item.updateAt = new Date()
            });
        });
    }
};

export const db = new EcoGuardDatabase();