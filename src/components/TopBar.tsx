import { Link } from 'react-router-dom';

interface Props {
  currentDay: number;
  totalDays: number;
  percent: number;
  streak: number;
  onSettings: () => void;
  back?: { to: string; label?: string };
  rightSlot?: React.ReactNode;
}

export default function TopBar({ currentDay, totalDays, percent, streak, onSettings, back, rightSlot }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-ink-900/85 backdrop-blur border-b border-white/5">
      <div className="max-w-3xl mx-auto px-4 pad-safe-top pb-3 pt-3 flex items-center gap-3">
        {back ? (
          <Link to={back.to} className="btn-ghost px-3 py-2 -ml-2" aria-label={back.label ?? 'Back'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        ) : (
          <div className="text-gold-500 font-serif italic text-3xl leading-none select-none">75</div>
        )}

        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-[0.2em] text-parchment/50">75 Hard</div>
          <div className="text-sm text-parchment/90 truncate">
            <span className="font-semibold">Day {currentDay}</span>
            <span className="text-parchment/50"> / {totalDays}</span>
            <span className="text-parchment/40 mx-2">·</span>
            <span>{percent}%</span>
            {streak > 0 && (
              <>
                <span className="text-parchment/40 mx-2">·</span>
                <span className="text-gold-300">{streak}🔥</span>
              </>
            )}
          </div>
        </div>

        {rightSlot}
        <button className="btn-ghost px-3 py-2" onClick={onSettings} aria-label="Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
