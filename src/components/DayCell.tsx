import { Link } from 'react-router-dom';
import type { DayRecord } from '../types';
import { RULE_KEYS } from '../types';
import { dayIsComplete, rulesCompletedCount } from '../lib/progress';

interface Props {
  dayNumber: number;
  day?: DayRecord;
  isToday: boolean;
  isFuture: boolean;
  hasPhoto: boolean;
}

export default function DayCell({ dayNumber, day, isToday, isFuture, hasPhoto }: Props) {
  const completed = dayIsComplete(day);
  const count = rulesCompletedCount(day);
  const total = RULE_KEYS.length;

  return (
    <Link
      to={`/day/${dayNumber}`}
      aria-label={`Day ${dayNumber}, ${count} of ${total} rules complete`}
      className={[
        'group relative aspect-square rounded-xl flex flex-col items-center justify-center select-none transition',
        'border',
        completed
          ? 'bg-success/15 border-success/40'
          : 'bg-ink-700/60 border-white/5 hover:bg-ink-600/70',
        isFuture && !completed ? 'opacity-55' : '',
        isToday ? 'ring-2 ring-gold-500/80 shadow-glow' : '',
      ].join(' ')}
    >
      <Ring count={count} total={total} complete={completed} />
      <span className={`relative font-serif italic text-lg leading-none ${completed ? 'text-success' : 'text-parchment/85'}`}>
        {dayNumber}
      </span>
      {hasPhoto && (
        <span
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(212,168,90,0.8)]"
          aria-label="Photo saved"
        />
      )}
    </Link>
  );
}

function Ring({ count, total, complete }: { count: number; total: number; complete: boolean }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : count / total;
  const dash = c * pct;
  return (
    <svg className="absolute inset-0 m-auto" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r={r} stroke="currentColor" className="text-white/8" strokeWidth="2.5" fill="none" />
      <circle
        cx="24"
        cy="24"
        r={r}
        stroke="currentColor"
        className={complete ? 'text-success' : 'text-gold-500'}
        strokeWidth="2.5"
        fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeDashoffset={c / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 250ms ease' }}
      />
    </svg>
  );
}
