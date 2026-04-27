import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ChecklistItem from '../components/ChecklistItem';
import PhotoCapture from '../components/PhotoCapture';
import QuoteCard from '../components/QuoteCard';
import SettingsSheet from '../components/SettingsSheet';
import { getAllDays, getDay, setDay as saveDay } from '../lib/db';
import {
  currentDayNumber,
  dateForDay,
  formatFriendly,
  percentComplete,
  rulesCompletedCount,
  streak,
  toISODate,
  todayISO,
} from '../lib/progress';
import { quoteForDay } from '../lib/quotes';
import type { DayRecord, Settings } from '../types';
import { RULE_KEYS, TOTAL_DAYS } from '../types';

interface Props {
  settings: Settings;
  onSettingsChange: (s: Settings | null) => void;
}

const EMPTY = (n: number): DayRecord => ({
  dayNumber: n,
  water: false,
  workout1: false,
  workout2: false,
  outdoorWorkout: false,
  diet: false,
  read: false,
});

export default function DayView({ settings, onSettingsChange }: Props) {
  const params = useParams();
  const navigate = useNavigate();
  const requested = Number(params.n);
  const dayNumber = Number.isFinite(requested) && requested >= 1 && requested <= TOTAL_DAYS ? requested : 1;

  const [day, setDayState] = useState<DayRecord | null>(null);
  const [allDays, setAllDays] = useState<DayRecord[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [d, all] = await Promise.all([getDay(dayNumber), getAllDays()]);
      if (cancelled) return;
      setDayState(d ?? EMPTY(dayNumber));
      setAllDays(all);
    })();
    return () => {
      cancelled = true;
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [dayNumber]);

  const date = useMemo(() => dateForDay(settings.startDate, dayNumber), [settings.startDate, dayNumber]);
  const dateLabel = formatFriendly(date);
  const isFuture = toISODate(date) > todayISO();
  const today = currentDayNumber(settings.startDate);
  const quote = useMemo(() => quoteForDay(dayNumber), [dayNumber]);

  function persist(next: DayRecord) {
    setDayState(next);
    setAllDays((prev) => {
      const i = prev.findIndex((d) => d.dayNumber === next.dayNumber);
      if (i === -1) return [...prev, next];
      const copy = prev.slice();
      copy[i] = next;
      return copy;
    });
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveDay(next).catch(console.error);
    }, 250);
  }

  function flushAndGoBack() {
    if (saveTimer.current && day) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
      saveDay(day).catch(console.error);
    }
    navigate('/');
  }

  function toggle<K extends keyof DayRecord>(key: K, value: DayRecord[K]) {
    if (!day) return;
    const next: DayRecord = { ...day, [key]: value };
    const allDone = RULE_KEYS.every((k) => next[k]);
    next.completedAt = allDone ? (next.completedAt ?? Date.now()) : undefined;
    persist(next);
  }

  if (!day) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-parchment/50">
        <div className="font-serif italic">…</div>
      </div>
    );
  }

  const done = rulesCompletedCount(day);
  const total = RULE_KEYS.length;

  return (
    <div className="min-h-dvh">
      <TopBar
        currentDay={today}
        totalDays={TOTAL_DAYS}
        percent={percentComplete(allDays)}
        streak={streak(allDays, today)}
        onSettings={() => setSettingsOpen(true)}
        back={{ to: '/', label: 'Back to grid' }}
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 pad-safe-bottom space-y-5">
        <header className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-parchment/55">
              Day {dayNumber} of 75
              {isFuture && <span className="ml-2 text-gold-300/80">· upcoming</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{dateLabel}</h1>
          </div>
          <div className={`text-right tabular-nums font-serif italic ${done === total ? 'text-success' : 'text-parchment/70'}`}>
            <div className="text-3xl leading-none">{done}/{total}</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-parchment/50 mt-1">complete</div>
          </div>
        </header>

        <QuoteCard quote={quote} />

        <section className="space-y-2.5">
          <ChecklistItem
            label="Drank a gallon of water"
            description="128 oz / ~3.78 L"
            checked={day.water}
            onChange={(v) => toggle('water', v)}
          />
          <ChecklistItem
            label="Workout 1"
            description="45 minutes"
            checked={day.workout1}
            onChange={(v) => toggle('workout1', v)}
          />
          <ChecklistItem
            label="Workout 2"
            description="45 minutes — different session from #1"
            checked={day.workout2}
            onChange={(v) => toggle('workout2', v)}
          />
          <ChecklistItem
            label="One workout was outside"
            description="Rain, cold, heat — no excuses"
            checked={day.outdoorWorkout}
            onChange={(v) => toggle('outdoorWorkout', v)}
          />
          <ChecklistItem
            label="Followed my diet"
            description="No cheat meals, no alcohol"
            checked={day.diet}
            onChange={(v) => toggle('diet', v)}
          />
          <ChecklistItem
            label="Read 10 pages"
            description="Non-fiction, self-improvement"
            checked={day.read}
            onChange={(v) => toggle('read', v)}
          />
        </section>

        <section>
          <div className="label">Progress photo</div>
          <PhotoCapture dayNumber={dayNumber} />
        </section>

        <section>
          <label className="label" htmlFor="workout-notes">Workouts</label>
          <textarea
            id="workout-notes"
            className="field min-h-[96px] resize-y"
            placeholder="What workouts did you do? Lifts, runs, sets/reps, distance…"
            value={day.workoutNotes ?? ''}
            onChange={(e) => persist({ ...day, workoutNotes: e.target.value })}
          />
        </section>

        <section>
          <label className="label" htmlFor="feelings-notes">How I felt</label>
          <textarea
            id="feelings-notes"
            className="field min-h-[96px] resize-y"
            placeholder="Energy, mood, struggles, wins…"
            value={day.feelingsNotes ?? ''}
            onChange={(e) => persist({ ...day, feelingsNotes: e.target.value })}
          />
        </section>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => dayNumber > 1 && navigate(`/day/${dayNumber - 1}`)}
            disabled={dayNumber <= 1}
          >
            ← Day {Math.max(1, dayNumber - 1)}
          </button>
          <button type="button" className="btn-ghost" onClick={flushAndGoBack}>
            Done
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => dayNumber < TOTAL_DAYS && navigate(`/day/${dayNumber + 1}`)}
            disabled={dayNumber >= TOTAL_DAYS}
          >
            Day {Math.min(TOTAL_DAYS, dayNumber + 1)} →
          </button>
        </div>
      </main>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={(s) => {
          onSettingsChange(s);
          if (s === null) navigate('/');
        }}
      />
    </div>
  );
}
