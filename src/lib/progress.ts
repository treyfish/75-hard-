import { RULE_KEYS, TOTAL_DAYS, type DayRecord, type ISODate } from '../types';

export function todayISO(): ISODate {
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function dateForDay(start: ISODate, dayNumber: number): Date {
  const d = parseISODate(start);
  d.setDate(d.getDate() + (dayNumber - 1));
  return d;
}

export function currentDayNumber(start: ISODate, today: ISODate = todayISO()): number {
  const ms = parseISODate(today).getTime() - parseISODate(start).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(days, 1), TOTAL_DAYS);
}

export function rulesCompletedCount(day: DayRecord | undefined): number {
  if (!day) return 0;
  return RULE_KEYS.reduce((acc, k) => acc + (day[k] ? 1 : 0), 0);
}

export function dayIsComplete(day: DayRecord | undefined): boolean {
  return rulesCompletedCount(day) === RULE_KEYS.length;
}

export function percentComplete(days: DayRecord[]): number {
  const done = days.filter(dayIsComplete).length;
  return Math.round((done / TOTAL_DAYS) * 100);
}

export function streak(days: DayRecord[], today: number): number {
  const byNumber = new Map(days.map((d) => [d.dayNumber, d]));
  let s = 0;
  for (let n = today; n >= 1; n--) {
    if (dayIsComplete(byNumber.get(n))) s += 1;
    else break;
  }
  return s;
}

const FRIENDLY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export function formatFriendly(d: Date): string {
  return FRIENDLY_FORMATTER.format(d);
}
