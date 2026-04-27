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

export function SageFigure({ level }: { level: number }) {
  // 200x300 viewBox, drawn from the ground up. Each level reveals more elements.
  const showSandals = level >= 1;
  const showStaff = level >= 1;
  const showBelt = level >= 2;
  const showCloak = level >= 2;
  const showBracers = level >= 3;
  const showBeard = level >= 3;
  const showLaurel = level >= 4;
  const showLongCloak = level >= 4;
  const showSword = level >= 5;
  const showTrim = level >= 5;
  const showCrown = level >= 6;
  const showRobeGold = level >= 6;

  const skin = '#cbb89a';
  const robe = level >= 6 ? '#1a1d22' : level >= 4 ? '#22262d' : level >= 2 ? '#2a2e36' : '#363b44';
  const robeShade = level >= 6 ? '#0d0f12' : '#181b21';
  const gold = '#d4a85a';
  const goldDim = '#b88a3d';
  const cloak = level >= 4 ? '#2c1e16' : '#3a2a20';

  return (
    <svg viewBox="0 0 200 300" width="100%" height="100%" aria-hidden role="img" className="drop-shadow-xl">
      <defs>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0f12" stopOpacity="0" />
          <stop offset="100%" stopColor="#0d0f12" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="robeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={robe} />
          <stop offset="100%" stopColor={robeShade} />
        </linearGradient>
      </defs>

      {/* ground halo */}
      <ellipse cx="100" cy="282" rx="62" ry="6" fill="url(#ground)" />

      {/* long cloak draped behind */}
      {showLongCloak && (
        <path d="M55 110 C 40 200, 35 260, 50 282 L 150 282 C 165 260, 160 200, 145 110 Z" fill={cloak} opacity="0.85" />
      )}

      {/* legs */}
      <rect x="86" y="220" width="11" height="55" rx="3" fill={robe} />
      <rect x="103" y="220" width="11" height="55" rx="3" fill={robeShade} />

      {/* sandals */}
      {showSandals ? (
        <>
          <rect x="82" y="272" width="20" height="6" rx="2" fill={goldDim} />
          <rect x="98" y="272" width="20" height="6" rx="2" fill={goldDim} />
        </>
      ) : (
        <>
          <ellipse cx="91" cy="277" rx="9" ry="3" fill="#1a1d22" />
          <ellipse cx="109" cy="277" rx="9" ry="3" fill="#1a1d22" />
        </>
      )}

      {/* main robe / tunic */}
      <path
        d="M70 130 Q 70 120 80 116 L 120 116 Q 130 120 130 130 L 138 230 Q 100 240, 62 230 Z"
        fill="url(#robeGrad)"
      />
      {showRobeGold && (
        <path
          d="M70 130 Q 70 120 80 116 L 120 116 Q 130 120 130 130 L 138 230 Q 100 240, 62 230 Z"
          fill="none"
          stroke={gold}
          strokeWidth="0.8"
          strokeOpacity="0.55"
        />
      )}

      {/* belt */}
      {showBelt && (
        <>
          <rect x="68" y="178" width="64" height="8" fill="#1a1d22" />
          <rect x="68" y="178" width="64" height="2" fill={goldDim} opacity="0.7" />
          <circle cx="100" cy="182" r="3.2" fill={gold} />
        </>
      )}

      {/* gold trim */}
      {showTrim && (
        <>
          <path d="M70 130 L 130 130" stroke={gold} strokeWidth="1.4" />
          <path d="M70 230 L 130 230" stroke={goldDim} strokeWidth="1" opacity="0.6" />
        </>
      )}

      {/* cloak shoulders */}
      {showCloak && (
        <path
          d="M62 130 Q 80 110 100 110 Q 120 110 138 130 L 132 150 Q 100 138 68 150 Z"
          fill={cloak}
        />
      )}

      {/* arms */}
      <rect x="58" y="130" width="14" height="70" rx="6" fill={robeShade} />
      <rect x="128" y="130" width="14" height="70" rx="6" fill={robeShade} />
      {/* hands */}
      <circle cx="65" cy="200" r="6.5" fill={skin} />
      <circle cx="135" cy="200" r="6.5" fill={skin} />

      {/* bracers */}
      {showBracers && (
        <>
          <rect x="56" y="186" width="18" height="12" rx="3" fill="#2b2f37" stroke={goldDim} strokeWidth="0.7" />
          <rect x="126" y="186" width="18" height="12" rx="3" fill="#2b2f37" stroke={goldDim} strokeWidth="0.7" />
        </>
      )}

      {/* staff */}
      {showStaff && !showSword && (
        <>
          <line x1="155" y1="80" x2="155" y2="270" stroke="#5a4632" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="155" cy="80" r="6" fill={gold} />
        </>
      )}

      {/* sword */}
      {showSword && (
        <>
          <line x1="155" y1="120" x2="155" y2="252" stroke="#c9c9d0" strokeWidth="3.4" strokeLinecap="round" />
          <line x1="148" y1="120" x2="162" y2="120" stroke={gold} strokeWidth="3.4" strokeLinecap="round" />
          <rect x="153" y="118" width="4" height="12" fill={gold} />
          <circle cx="155" cy="115" r="3.4" fill={gold} />
        </>
      )}

      {/* head */}
      <circle cx="100" cy="92" r="22" fill={skin} />
      {/* hair */}
      {level >= 1 ? (
        <path d="M78 86 Q 100 60 122 86 L 120 78 Q 100 66 80 78 Z" fill="#3a2a20" />
      ) : (
        <path d="M82 86 Q 100 70 118 86" fill="none" stroke="#3a2a20" strokeWidth="3" />
      )}

      {/* beard */}
      {showBeard && (
        <path d="M86 100 Q 100 120 114 100 Q 114 112 100 116 Q 86 112 86 100 Z" fill="#3a2a20" />
      )}

      {/* eyes (closed, meditative) */}
      <line x1="89" y1="92" x2="95" y2="92" stroke="#0d0f12" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="105" y1="92" x2="111" y2="92" stroke="#0d0f12" strokeWidth="1.5" strokeLinecap="round" />

      {/* laurel */}
      {showLaurel && !showCrown && (
        <g fill={gold}>
          <ellipse cx="84" cy="74" rx="5" ry="3" transform="rotate(-25 84 74)" />
          <ellipse cx="92" cy="68" rx="5" ry="3" transform="rotate(-15 92 68)" />
          <ellipse cx="108" cy="68" rx="5" ry="3" transform="rotate(15 108 68)" />
          <ellipse cx="116" cy="74" rx="5" ry="3" transform="rotate(25 116 74)" />
          <ellipse cx="100" cy="65" rx="4" ry="2.5" />
        </g>
      )}

      {/* crown of laurel + gold */}
      {showCrown && (
        <g>
          <g fill={gold}>
            <ellipse cx="80" cy="74" rx="5.5" ry="3" transform="rotate(-25 80 74)" />
            <ellipse cx="90" cy="66" rx="6" ry="3.2" transform="rotate(-15 90 66)" />
            <ellipse cx="110" cy="66" rx="6" ry="3.2" transform="rotate(15 110 66)" />
            <ellipse cx="120" cy="74" rx="5.5" ry="3" transform="rotate(25 120 74)" />
          </g>
          <path d="M82 64 Q 100 52 118 64" fill="none" stroke={gold} strokeWidth="2.2" />
          <circle cx="100" cy="55" r="3" fill={gold} />
        </g>
      )}
    </svg>
  );
}

export const STAGE_LABELS = STAGES.map((s: SageStage) => s.title);
