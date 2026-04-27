import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { DayRecord, ISODate, Settings } from '../types';
import { TOTAL_DAYS } from '../types';

const RT_URL_KEY = '75hard.supabase.url';
const RT_KEY_KEY = '75hard.supabase.anonKey';

function readRuntimeConfig(): { url: string; key: string } | null {
  try {
    const url = (localStorage.getItem(RT_URL_KEY) ?? '').trim();
    const key = (localStorage.getItem(RT_KEY_KEY) ?? '').trim();
    if (url && key) return { url, key };
  } catch {
    // localStorage unavailable (private mode? shouldn't happen here)
  }
  return null;
}

const ENV_URL = ((import.meta.env.VITE_SUPABASE_URL ?? '') as string).trim();
const ENV_KEY = ((import.meta.env.VITE_SUPABASE_ANON_KEY ?? '') as string).trim();
const envConfig = ENV_URL && ENV_KEY ? { url: ENV_URL, key: ENV_KEY } : null;
const runtimeConfig = envConfig ? null : readRuntimeConfig();
const activeConfig = envConfig ?? runtimeConfig;

export type CloudSource = 'env' | 'runtime' | 'none';
export const cloudSource: CloudSource = envConfig
  ? 'env'
  : runtimeConfig
    ? 'runtime'
    : 'none';

let client: SupabaseClient | null = null;
if (activeConfig) {
  client = createClient(activeConfig.url, activeConfig.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const cloudConfigured = !!client;

export function saveRuntimeCloudConfig(url: string, key: string): void {
  localStorage.setItem(RT_URL_KEY, url.trim());
  localStorage.setItem(RT_KEY_KEY, key.trim());
}

export function clearRuntimeCloudConfig(): void {
  localStorage.removeItem(RT_URL_KEY);
  localStorage.removeItem(RT_KEY_KEY);
}

interface DayRow {
  user_id: string;
  day_number: number;
  water: boolean;
  workout1: boolean;
  workout2: boolean;
  outdoor_workout: boolean;
  diet: boolean;
  read: boolean;
  workout_notes: string | null;
  feelings_notes: string | null;
  completed_at: string | null;
  photo_path: string | null;
  updated_at: string;
}

interface SettingsRow {
  user_id: string;
  start_date: ISODate;
  theme: string;
  updated_at: string;
}

function rowToDay(r: DayRow): DayRecord {
  return {
    dayNumber: r.day_number,
    water: r.water,
    workout1: r.workout1,
    workout2: r.workout2,
    outdoorWorkout: r.outdoor_workout,
    diet: r.diet,
    read: r.read,
    workoutNotes: r.workout_notes ?? undefined,
    feelingsNotes: r.feelings_notes ?? undefined,
    completedAt: r.completed_at ? new Date(r.completed_at).getTime() : undefined,
  };
}

function dayToRow(userId: string, d: DayRecord, photoPath: string | null = null): Omit<DayRow, 'updated_at'> {
  return {
    user_id: userId,
    day_number: d.dayNumber,
    water: d.water,
    workout1: d.workout1,
    workout2: d.workout2,
    outdoor_workout: d.outdoorWorkout,
    diet: d.diet,
    read: d.read,
    workout_notes: d.workoutNotes ?? null,
    feelings_notes: d.feelingsNotes ?? null,
    completed_at: d.completedAt ? new Date(d.completedAt).toISOString() : null,
    photo_path: photoPath,
  };
}

export async function getSession(): Promise<Session | null> {
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (session: Session | null) => void): () => void {
  if (!client) return () => {};
  const { data } = client.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail(email: string): Promise<{ error?: string }> {
  if (!client) return { error: 'Cloud sync is not configured.' };
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
  return error ? { error: error.message } : {};
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  if (!client) return { error: 'Cloud sync is not configured.' };
  const { error } = await client.auth.signInWithPassword({ email, password });
  return error ? { error: error.message } : {};
}

export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<{ error?: string; needsConfirmation?: boolean }> {
  if (!client) return { error: 'Cloud sync is not configured.' };
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) return { error: error.message };
  if (!data.session) return { needsConfirmation: true };
  return {};
}

export async function signOut(): Promise<void> {
  if (!client) return;
  await client.auth.signOut();
}

export async function fetchAllDaysCloud(userId: string): Promise<DayRecord[]> {
  if (!client) return [];
  const { data, error } = await client.from('days').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data as DayRow[]).map(rowToDay);
}

export async function fetchSettingsCloud(userId: string): Promise<Settings | null> {
  if (!client) return null;
  const { data, error } = await client
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as SettingsRow;
  return { startDate: row.start_date, theme: 'stoic-gold' };
}

export async function fetchPhotoPaths(userId: string): Promise<Map<number, string>> {
  if (!client) return new Map();
  const { data, error } = await client
    .from('days')
    .select('day_number, photo_path')
    .eq('user_id', userId);
  if (error) throw error;
  const map = new Map<number, string>();
  for (const r of (data ?? []) as Array<{ day_number: number; photo_path: string | null }>) {
    if (r.photo_path) map.set(r.day_number, r.photo_path);
  }
  return map;
}

export async function downloadPhoto(path: string): Promise<Blob | null> {
  if (!client) return null;
  const { data, error } = await client.storage.from('photos').download(path);
  if (error) {
    console.warn('photo download failed', error);
    return null;
  }
  return data;
}

export async function uploadPhoto(userId: string, dayNumber: number, blob: Blob): Promise<string> {
  if (!client) throw new Error('Cloud sync is not configured.');
  const path = `${userId}/${dayNumber}.jpg`;
  const { error } = await client.storage.from('photos').upload(path, blob, {
    cacheControl: '3600',
    upsert: true,
    contentType: blob.type || 'image/jpeg',
  });
  if (error) throw error;
  await client
    .from('days')
    .upsert({ user_id: userId, day_number: dayNumber, photo_path: path }, { onConflict: 'user_id,day_number' });
  return path;
}

export async function deletePhotoCloud(userId: string, dayNumber: number): Promise<void> {
  if (!client) return;
  const path = `${userId}/${dayNumber}.jpg`;
  await client.storage.from('photos').remove([path]);
  await client
    .from('days')
    .upsert({ user_id: userId, day_number: dayNumber, photo_path: null }, { onConflict: 'user_id,day_number' });
}

export async function upsertDay(userId: string, day: DayRecord): Promise<void> {
  if (!client) return;
  const { error } = await client
    .from('days')
    .upsert(dayToRow(userId, day), { onConflict: 'user_id,day_number' });
  if (error) throw error;
}

export async function upsertSettings(userId: string, s: Settings): Promise<void> {
  if (!client) return;
  const { error } = await client
    .from('settings')
    .upsert(
      { user_id: userId, start_date: s.startDate, theme: s.theme },
      { onConflict: 'user_id' },
    );
  if (error) throw error;
}

export async function clearCloud(userId: string): Promise<void> {
  if (!client) return;
  await client.from('days').delete().eq('user_id', userId);
  await client.from('settings').delete().eq('user_id', userId);
  // Best-effort: list and remove user photos
  const paths = Array.from({ length: TOTAL_DAYS }, (_, i) => `${userId}/${i + 1}.jpg`);
  await client.storage.from('photos').remove(paths);
}

export type { Session };
