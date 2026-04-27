import { useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { SageFigure } from './Sage';
import type { DayRecord } from '../types';
import { quoteForDay } from '../lib/quotes';

interface Props {
  open: boolean;
  onClose: () => void;
  days: DayRecord[];
  startDate: string;
  finishDate: string;
}

export default function CongratsScreen({ open, onClose, days, startDate, finishDate }: Props) {
  const ranOnce = useRef(false);

  useEffect(() => {
    if (!open) {
      ranOnce.current = false;
      return;
    }
    if (ranOnce.current) return;
    ranOnce.current = true;

    const colors = ['#d4a85a', '#e6c37c', '#fbf6e8', '#5fb672'];
    const end = Date.now() + 5000;

    const tick = () => {
      confetti({
        particleCount: 4,
        startVelocity: 38,
        spread: 75,
        origin: { x: Math.random(), y: -0.05 },
        colors,
        gravity: 0.9,
        scalar: 1.05,
        ticks: 220,
      });
      if (Date.now() < end) requestAnimationFrame(tick);
    };

    confetti({
      particleCount: 160,
      spread: 110,
      origin: { y: 0.45 },
      colors,
      gravity: 1.05,
      scalar: 1.2,
      ticks: 280,
    });
    setTimeout(() => {
      confetti({
        particleCount: 90,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 90,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.6 },
        colors,
      });
    }, 380);

    requestAnimationFrame(tick);
  }, [open]);

  const stats = useMemo(() => buildStats(days, startDate, finishDate), [days, startDate, finishDate]);
  const finalQuote = useMemo(() => quoteForDay(75), []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/95 backdrop-blur pad-safe-top pad-safe-bottom">
      <div className="min-h-dvh flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-xl">
          <div className="text-center congrats-pop">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-300/80">Day 75 of 75</div>
            <h1 className="mt-2 font-serif italic text-7xl sm:text-8xl text-gold-500 leading-none drop-shadow-[0_0_30px_rgba(212,168,90,0.45)]">
              Forged.
            </h1>
            <p className="mt-3 text-parchment/85 text-lg">
              You finished what most won't even start.
            </p>
          </div>

          <div className="mt-6 flex justify-center congrats-fade-in">
            <div className="relative" style={{ width: 220, height: 260 }}>
              <div
                className="absolute inset-0 m-auto rounded-full"
                aria-hidden
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(212,168,90,0.45), rgba(212,168,90,0.05) 65%, transparent 75%)',
                  filter: 'blur(10px)',
                  animation: 'sage-aura-pulse 3.6s ease-in-out infinite',
                }}
              />
              <SageFigure level={6} />
            </div>
          </div>

          <figure className="mt-6 card p-5 sm:p-6 congrats-fade-in">
            <div className="absolute inset-y-0 left-0 w-1 bg-gold-500/70" aria-hidden />
            <blockquote className="font-serif italic text-lg sm:text-xl leading-snug text-parchment">
              “{finalQuote.text}”
            </blockquote>
            <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-gold-300/90">
              — {finalQuote.author}
            </figcaption>
          </figure>

          <dl className="mt-6 grid grid-cols-2 gap-3 congrats-fade-in">
            <Stat label="Days complete" value={`${stats.completed} / 75`} />
            <Stat label="Photos taken" value={String(stats.photoApprox)} accent />
            <Stat label="Workouts logged" value={String(stats.workouts)} />
            <Stat label="Pages read (≥)" value={String(stats.pagesMin)} />
            <Stat label="Started" value={stats.started} />
            <Stat label="Finished" value={stats.finished} />
          </dl>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 congrats-fade-in">
            <button className="btn-primary flex-1" onClick={onClose}>
              Return to journal
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-parchment/45 congrats-fade-in">
            This screen will reappear any time you re-open the app at 75/75.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`card px-4 py-3 ${accent ? 'border-gold-500/30' : ''}`}>
      <div className="text-[10px] uppercase tracking-[0.22em] text-parchment/55">{label}</div>
      <div className={`mt-1 font-serif italic text-2xl tabular-nums ${accent ? 'text-gold-300' : 'text-parchment'}`}>
        {value}
      </div>
    </div>
  );
}

function buildStats(days: DayRecord[], startDate: string, finishDate: string) {
  let completed = 0;
  let workouts = 0;
  let pagesMin = 0;
  let photoApprox = 0;
  for (const d of days) {
    if (d.water && d.workout1 && d.workout2 && d.outdoorWorkout && d.diet && d.read) completed += 1;
    if (d.workout1) workouts += 1;
    if (d.workout2) workouts += 1;
    if (d.read) pagesMin += 10;
  }
  // photo count comes from caller via a separate mechanism if available; approximate by completed days
  photoApprox = completed; // best-effort default
  return {
    completed,
    workouts,
    pagesMin,
    photoApprox,
    started: friendly(startDate),
    finished: friendly(finishDate),
  };
}

function friendly(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
