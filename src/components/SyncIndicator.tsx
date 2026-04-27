import { useEffect, useState } from 'react';
import { onSyncState, syncEnabled, type SyncState } from '../lib/sync';

interface Props {
  signedIn: boolean;
}

export default function SyncIndicator({ signedIn }: Props) {
  const [state, setState] = useState<SyncState>('idle');

  useEffect(() => onSyncState(setState), []);

  if (!syncEnabled || !signedIn) return null;

  const map: Record<SyncState, { dot: string; label: string; pulse?: boolean }> = {
    idle: { dot: 'bg-parchment/30', label: 'Idle' },
    syncing: { dot: 'bg-gold-400', label: 'Saving…', pulse: true },
    synced: { dot: 'bg-success', label: 'Synced' },
    error: { dot: 'bg-red-400', label: 'Sync error' },
    offline: { dot: 'bg-parchment/30', label: 'Offline' },
  };
  const v = map[state];

  return (
    <div className="hidden sm:flex items-center gap-2 text-xs text-parchment/60 mr-2" title={v.label} aria-live="polite">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${v.dot} ${v.pulse ? 'animate-pulse' : ''}`} />
      <span className="hidden md:inline">{v.label}</span>
    </div>
  );
}
