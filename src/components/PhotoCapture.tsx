import { useEffect, useRef, useState } from 'react';
import { compressImage } from '../lib/photos';
import { deletePhoto, getPhoto, setPhoto } from '../lib/db';

interface Props {
  dayNumber: number;
  onChange?: (hasPhoto: boolean) => void;
}

export default function PhotoCapture({ dayNumber, onChange }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const blob = await getPhoto(dayNumber);
      if (cancelled) return;
      revoke();
      if (blob) {
        const next = URL.createObjectURL(blob);
        lastUrl.current = next;
        setUrl(next);
      } else {
        setUrl(null);
      }
    })();
    return () => {
      cancelled = true;
      revoke();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayNumber]);

  function revoke() {
    if (lastUrl.current) {
      URL.revokeObjectURL(lastUrl.current);
      lastUrl.current = null;
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await compressImage(file);
      await setPhoto(dayNumber, blob);
      revoke();
      const next = URL.createObjectURL(blob);
      lastUrl.current = next;
      setUrl(next);
      onChange?.(true);
    } catch (err) {
      console.error(err);
      setError('Could not save photo. Try another image.');
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    setBusy(true);
    try {
      await deletePhoto(dayNumber);
      revoke();
      setUrl(null);
      onChange?.(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onPick}
      />
      {url ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="block w-full"
            aria-label="View photo full screen"
          >
            <img
              src={url}
              alt={`Day ${dayNumber} progress`}
              className="w-full h-64 sm:h-80 object-cover"
              loading="lazy"
            />
          </button>
          <div className="flex gap-2 p-3">
            <button
              type="button"
              className="btn-ghost flex-1"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              Replace
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={onRemove}
              disabled={busy}
              aria-label="Remove photo"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full h-44 sm:h-52 flex flex-col items-center justify-center gap-2 text-parchment/70 hover:text-parchment hover:bg-ink-600/50 transition"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="font-medium">{busy ? 'Saving…' : 'Add progress photo'}</span>
          <span className="text-xs text-parchment/45">Tap to use camera or pick a file</span>
        </button>
      )}

      {error && <div className="px-4 pb-3 text-sm text-red-300">{error}</div>}

      {fullscreen && url && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center pad-safe-top pad-safe-bottom"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal
        >
          <img src={url} alt="" className="max-w-full max-h-full object-contain" />
          <button
            type="button"
            className="absolute top-4 right-4 btn-ghost"
            onClick={() => setFullscreen(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
