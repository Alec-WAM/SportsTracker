import { Injectable } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb';


export const DB_STORE_JSON = "json";
export const DB_JSON_KEY_NBA_SCHEDULE = "nba_schedule";
export interface SportsAppDB extends DBSchema {
  'json': {
    key: string;
    value: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DBService {
  private dbPromise: Promise<IDBPDatabase<SportsAppDB>>;
  
  constructor() { 
    this.dbPromise = openDB<SportsAppDB>('SportsApp', 1, {
      upgrade(db) {
        db.createObjectStore(DB_STORE_JSON);
      },
    });
  }

  async saveJSONData(key: string, data: any): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(DB_STORE_JSON, 'readwrite');
    const store = tx.objectStore(DB_STORE_JSON);
    await store.put(data, key);
    await tx.done;
  }

  async getJSONData(key: string): Promise<any> {
    const db = await this.dbPromise;
    const tx = db.transaction(DB_STORE_JSON, 'readonly');
    const store = tx.objectStore(DB_STORE_JSON);
    return store.get(key);
  }
}
