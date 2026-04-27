import type { DayRecord } from '../types';
import { dayIsComplete } from './progress';

export interface SageStage {
  level: number; // 0..6
  title: string;
  subtitle: string;
  threshold: number; // min completed days
}

export const STAGES: SageStage[] = [
  { level: 0, title: 'The Seeker', subtitle: 'The journey begins.', threshold: 0 },
  { level: 1, title: 'The Apprentice', subtitle: 'Sandals on, staff in hand.', threshold: 13 },
  { level: 2, title: 'The Initiate', subtitle: 'The cloak is earned.', threshold: 26 },
  { level: 3, title: 'The Guardian', subtitle: 'Iron in the bones.', threshold: 38 },
  { level: 4, title: 'The Stoic', subtitle: 'Crowned with laurel.', threshold: 51 },
  { level: 5, title: 'The Master', subtitle: 'Steel and scroll, balanced.', threshold: 63 },
  { level: 6, title: 'The Sage', subtitle: 'Forged in seventy-five days.', threshold: 75 },
];

export function completedDays(days: DayRecord[]): number {
  return days.filter(dayIsComplete).length;
}

export function stageFor(completed: number): SageStage {
  let s = STAGES[0];
  for (const stage of STAGES) {
    if (completed >= stage.threshold) s = stage;
  }
  return s;
}

export function nextStage(completed: number): SageStage | null {
  for (const stage of STAGES) {
    if (completed < stage.threshold) return stage;
  }
  return null;
}

export function progressToNext(completed: number): { current: SageStage; next: SageStage | null; pct: number } {
  const current = stageFor(completed);
  const next = nextStage(completed);
  if (!next) return { current, next: null, pct: 1 };
  const span = next.threshold - current.threshold;
  const into = completed - current.threshold;
  return { current, next, pct: span > 0 ? Math.max(0, Math.min(1, into / span)) : 1 };
}
