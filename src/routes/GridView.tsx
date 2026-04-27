import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import DayCell from '../components/DayCell';
import SettingsSheet from '../components/SettingsSheet';
import { getAllDays, getAllPhotoKeys } from '../lib/db';
import type { DayRecord, Settings } from '../types';
import { TOTAL_DAYS } from '../types';
import {
  currentDayNumber,
  dateForDay,
  formatFriendly,
  percentComplete,
  streak,
  toISODate,
  todayISO,
} from '../lib/progress';

interface Props {
  settings: Settings;
  onSettingsChange: (s: Settings | null) => void;
}

export default function GridView({ settings, onSettingsChange }: Props) {
  const [days, setDays] = useState<DayRecord[]>([]);
  const [photoSet, setPhotoSet] = useState<Set<number>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [all, keys] = await Promise.all([getAllDays(), getAllPhotoKeys()]);
      if (cancelled) return;
      setDays(all);
      setPhotoSet(new Set(keys));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = todayISO();
  const currentDay = currentDayNumber(settings.startDate, today);
  const percent = percentComplete(days);
  const fire = streak(days, currentDay);
  const todayDate = formatFriendly(new Date());

  const byNumber = useMemo(() => new Map(days.map((d) => [d.dayNumber, d])), [days]);

  return (
    <div className="min-h-dvh">
      <TopBar
        currentDay={currentDay}
        totalDays={TOTAL_DAYS}
        percent={percent}
        streak={fire}
        onSettings={() => setSettingsOpen(true)}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pad-safe-bottom">
        <section className="mb-6 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-parchment/50">Today</div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{todayDate}</h1>
            <p className="text-parchment/60 text-sm mt-1">
              You're on <span className="text-gold-300 font-medium">Day {currentDay}</span> of 75.
            </p>
          </div>
          <Link to={`/day/${currentDay}`} className="btn-primary whitespace-nowrap">
            Open today
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-[0.2em] text-parchment/55">All days</h2>
            <span className="text-xs text-parchment/45">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 align-middle mr-1.5" />
              has photo
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5">
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((n) => {
              const date = dateForDay(settings.startDate, n);
              const isToday = toISODate(date) === today;
              const isFuture = toISODate(date) > today;
              return (
                <DayCell
                  key={n}
                  dayNumber={n}
                  day={byNumber.get(n)}
                  isToday={isToday}
                  isFuture={isFuture}
                  hasPhoto={photoSet.has(n)}
                />
              );
            })}
          </div>
        </section>
      </main>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
}
