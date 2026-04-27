export type ISODate = string; // YYYY-MM-DD

export interface DayRecord {
  dayNumber: number; // 1..75
  water: boolean;
  workout1: boolean;
  workout2: boolean;
  outdoorWorkout: boolean;
  diet: boolean;
  read: boolean;
  workoutNotes?: string;
  feelingsNotes?: string;
  completedAt?: number; // ms epoch
}

export interface Settings {
  startDate: ISODate;
  theme: 'stoic-gold';
  remindersEnabled?: boolean;
}

export interface Quote {
  text: string;
  author: string;
}

export const TOTAL_DAYS = 75;

export const RULE_KEYS = [
  'water',
  'workout1',
  'workout2',
  'outdoorWorkout',
  'diet',
  'read',
] as const;

export type RuleKey = (typeof RULE_KEYS)[number];
