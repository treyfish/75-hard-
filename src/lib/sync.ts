import {
  cloudConfigured,
  deletePhotoCloud,
  downloadPhoto,
  fetchAllDaysCloud,
  fetchPhotoPaths,
  fetchSettingsCloud,
  upsertDay,
  uploadPhoto,
  upsertSettings,
} from './cloud';
import {
  getAllDays,
  getAllPhotoKeys,
  getPhoto,
  setDay as setDayLocal,
  setPhoto as setPhotoLocal,
  setSettings as setSettingsLocal,
  deletePhoto as deletePhotoLocal,
} from './db';
import type { DayRecord, Settings } from '../types';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

type Listener = (s: SyncState) => void;
const listeners = new Set<Listener>();
let state: SyncState = 'idle';

function setState(s: SyncState) {
  state = s;
  for (const l of listeners) l(s);
}

export function onSyncState(l: Listener): () => void {
  l(state);
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getSyncState(): SyncState {
  return state;
}

export const syncEnabled = cloudConfigured;

let pullPromise: Promise<void> | null = null;

/**
 * Pull cloud → local on sign-in. Cloud wins for conflicts; downloads any photos
 * that are present in the cloud but missing locally.
 */
export async function pullFromCloud(userId: string): Promise<void> {
  if (!syncEnabled) return;
  if (pullPromise) return pullPromise;
  pullPromise = (async () => {
    setState('syncing');
    try {
      const [cloudSettings, cloudDays, cloudPhotos, localPhotoKeys] = await Promise.all([
        fetchSettingsCloud(userId),
        fetchAllDaysCloud(userId),
        fetchPhotoPaths(userId),
        getAllPhotoKeys(),
      ]);
      if (cloudSettings) await setSettingsLocal(cloudSettings);
      for (const d of cloudDays) await setDayLocal(d);

      const localSet = new Set(localPhotoKeys);
      for (const [dayNumber, path] of cloudPhotos) {
        if (localSet.has(dayNumber)) continue;
        const blob = await downloadPhoto(path);
        if (blob) await setPhotoLocal(dayNumber, blob);
      }

      // Push any local photos that exist locally but not in cloud
      for (const k of localPhotoKeys) {
        if (!cloudPhotos.has(k)) {
          const blob = await getPhoto(k);
          if (blob) {
            try {
              await uploadPhoto(userId, k, blob);
            } catch (e) {
              console.warn('photo upload during pull failed', k, e);
            }
          }
        }
      }

      // Push any local days/settings that don't exist in cloud (first-time signup)
      const cloudDayNums = new Set(cloudDays.map((d) => d.dayNumber));
      const localDays = await getAllDays();
      for (const d of localDays) {
        if (!cloudDayNums.has(d.dayNumber)) {
          try {
            await upsertDay(userId, d);
          } catch (e) {
            console.warn('day upload during pull failed', d.dayNumber, e);
          }
        }
      }

      setState('synced');
    } catch (e) {
      console.error('pullFromCloud failed', e);
      setState('error');
    } finally {
      pullPromise = null;
    }
  })();
  return pullPromise;
}

let activeUserId: string | null = null;
export function setActiveUser(userId: string | null) {
  activeUserId = userId;
  if (!userId) setState('idle');
}

let pendingDayWrites = new Map<number, DayRecord>();
let pendingFlush: number | null = null;

export function queueDayUpload(day: DayRecord) {
  if (!syncEnabled || !activeUserId) return;
  pendingDayWrites.set(day.dayNumber, day);
  if (pendingFlush) window.clearTimeout(pendingFlush);
  pendingFlush = window.setTimeout(flushDays, 600);
}

async function flushDays() {
  if (!activeUserId) return;
  const userId = activeUserId;
  const batch = Array.from(pendingDayWrites.values());
  pendingDayWrites = new Map();
  pendingFlush = null;
  if (batch.length === 0) return;
  setState('syncing');
  try {
    for (const d of batch) await upsertDay(userId, d);
    setState('synced');
  } catch (e) {
    console.error('day upload failed', e);
    setState('error');
  }
}

export async function pushSettings(s: Settings): Promise<void> {
  if (!syncEnabled || !activeUserId) return;
  setState('syncing');
  try {
    await upsertSettings(activeUserId, s);
    setState('synced');
  } catch (e) {
    console.error('settings upload failed', e);
    setState('error');
  }
}

export async function pushPhoto(dayNumber: number, blob: Blob): Promise<void> {
  if (!syncEnabled || !activeUserId) return;
  setState('syncing');
  try {
    await uploadPhoto(activeUserId, dayNumber, blob);
    setState('synced');
  } catch (e) {
    console.error('photo upload failed', e);
    setState('error');
  }
}

export async function dropPhoto(dayNumber: number): Promise<void> {
  if (!syncEnabled || !activeUserId) return;
  await deletePhotoLocal(dayNumber);
  setState('syncing');
  try {
    await deletePhotoCloud(activeUserId, dayNumber);
    setState('synced');
  } catch (e) {
    console.error('photo delete failed', e);
    setState('error');
  }
}
