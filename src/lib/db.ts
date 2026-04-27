import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DayRecord, Settings } from '../types';

interface SeventyFiveDB extends DBSchema {
  settings: {
    key: 'app';
    value: Settings;
  };
  days: {
    key: number;
    value: DayRecord;
  };
  photos: {
    key: number;
    value: Blob;
  };
}

const DB_NAME = 'seventyfive';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SeventyFiveDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SeventyFiveDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('days')) {
          db.createObjectStore('days', { keyPath: 'dayNumber' });
        }
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos');
        }
      },
    });
  }
  return dbPromise;
}

export async function getSettings(): Promise<Settings | undefined> {
  const db = await getDB();
  return db.get('settings', 'app');
}

export async function setSettings(s: Settings): Promise<void> {
  const db = await getDB();
  await db.put('settings', s, 'app');
}

export async function getDay(n: number): Promise<DayRecord | undefined> {
  const db = await getDB();
  return db.get('days', n);
}

export async function getAllDays(): Promise<DayRecord[]> {
  const db = await getDB();
  return db.getAll('days');
}

export async function setDay(day: DayRecord): Promise<void> {
  const db = await getDB();
  await db.put('days', day);
}

export async function getPhoto(n: number): Promise<Blob | undefined> {
  const db = await getDB();
  return db.get('photos', n);
}

export async function getAllPhotoKeys(): Promise<number[]> {
  const db = await getDB();
  const keys = await db.getAllKeys('photos');
  return keys as number[];
}

export async function setPhoto(n: number, blob: Blob): Promise<void> {
  const db = await getDB();
  await db.put('photos', blob, n);
}

export async function deletePhoto(n: number): Promise<void> {
  const db = await getDB();
  await db.delete('photos', n);
}

export async function clearAll(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['settings', 'days', 'photos'], 'readwrite');
  await Promise.all([
    tx.objectStore('settings').clear(),
    tx.objectStore('days').clear(),
    tx.objectStore('photos').clear(),
  ]);
  await tx.done;
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  settings?: Settings;
  days: DayRecord[];
  photos: Array<{ dayNumber: number; mime: string; dataBase64: string }>;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  return btoa(binary);
}

function base64ToBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function exportAll(): Promise<ExportPayload> {
  const db = await getDB();
  const settings = await db.get('settings', 'app');
  const days = await db.getAll('days');
  const photoKeys = (await db.getAllKeys('photos')) as number[];
  const photos: ExportPayload['photos'] = [];
  for (const k of photoKeys) {
    const blob = await db.get('photos', k);
    if (!blob) continue;
    photos.push({
      dayNumber: k,
      mime: blob.type || 'image/jpeg',
      dataBase64: await blobToBase64(blob),
    });
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    days,
    photos,
  };
}

export async function importAll(payload: ExportPayload): Promise<void> {
  if (payload.version !== 1) throw new Error('Unsupported backup version');
  const db = await getDB();
  const tx = db.transaction(['settings', 'days', 'photos'], 'readwrite');
  await tx.objectStore('settings').clear();
  await tx.objectStore('days').clear();
  await tx.objectStore('photos').clear();
  if (payload.settings) await tx.objectStore('settings').put(payload.settings, 'app');
  for (const d of payload.days) await tx.objectStore('days').put(d);
  for (const p of payload.photos) {
    await tx.objectStore('photos').put(base64ToBlob(p.dataBase64, p.mime), p.dayNumber);
  }
  await tx.done;
}

export async function requestPersistence(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
