import { useEffect, useRef, useState } from 'react';
import { progressToNext, STAGES, type SageStage } from '../lib/sage';

interface Props {
  completed: number;
  size?: number;
  showCard?: boolean;
}

export default function Sage({ completed, size = 180, showCard = true }: Props) {
  const { current, next, pct } = progressToNext(completed);
  const [bumping, setBumping] = useState(false);
  const lastLevel = useRef(current.level);

  useEffect(() => {
    if (current.level !== lastLevel.current) {
      lastLevel.current = current.level;
      setBumping(true);
      const t = window.setTimeout(() => setBumping(false), 1400);
      return () => window.clearTimeout(t);
    }
  }, [current.level]);

  const figure = (
    <div className={`relative flex items-end justify-center ${bumping ? 'sage-bump' : ''}`} style={{ width: size, height: size }}>
      {current.level >= 6 && <Aura />}
      <SageFigure level={current.level} />
    </div>
  );

  if (!showCard) return figure;

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6 flex items-center gap-4 sm:gap-6">
      <div className="flex-none">{figure}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-[0.22em] text-parchment/55">
          Level {current.level} {next ? `· ${current.threshold}–${next.threshold} days` : '· complete'}
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-parchment mt-0.5">
          {current.title}
        </h2>
        <p className="text-parchment/65 italic font-serif text-sm sm:text-base mt-1">
          {current.subtitle}
        </p>

        <div className="mt-4">
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full bg-gold-500 transition-[width] duration-700 ease-out"
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-parchment/55">
            <span>{completed} day{completed === 1 ? '' : 's'} complete</span>
            <span>
              {next ? `${next.threshold - completed} to ${next.title}` : 'Final form reached'}
            </span>
          </div>
        </div>
      </div>

      {bumping && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="font-serif italic text-gold-300 text-2xl level-up-toast">Level up</div>
        </div>
      )}
    </div>
  );
}

function Aura() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 m-auto rounded-full"
      style={{
        background:
          'radial-gradient(closest-side, rgba(212,168,90,0.35), rgba(212,168,90,0.05) 60%, transparent 70%)',
        filter: 'blur(8px)',
        animation: 'sage-aura-pulse 3.6s ease-in-out infinite',
      }}
    />
  );
}

const SAGE_EXT = 'webp';

export function sageImageUrl(level: number): string {
  const clamped = Math.max(0, Math.min(6, level));
  return `${import.meta.env.BASE_URL}sage/level-${clamped}.${SAGE_EXT}`;
}

export function preloadSageImages(): void {
  if (typeof Image === 'undefined') return;
  for (let i = 0; i <= 6; i++) {
    const img = new Image();
    img.src = sageImageUrl(i);
  }
}

export function SageFigure({ level }: { level: number }) {
  const clamped = Math.max(0, Math.min(6, level));
  return (
    <img
      src={sageImageUrl(clamped)}
      alt={STAGES[clamped]?.title ?? 'Sage'}
      width={200}
      height={300}
      draggable={false}
      onError={(e) => {
        // If the painting hasn't been generated yet, fall back to a transparent
        // placeholder so the layout doesn't collapse. The Sage card still shows
        // level/title/progress.
        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
      }}
      className="w-full h-full object-contain select-none drop-shadow-[0_8px_28px_rgba(0,0,0,0.5)]"
    />
  );
}

export const STAGE_LABELS = STAGES.map((s: SageStage) => s.title);
