import { useEffect, useRef, useState } from 'react';
import {
  clearAll,
  exportAll,
  importAll,
  setSettings,
  type ExportPayload,
} from '../lib/db';
import { clearCloud } from '../lib/cloud';
import { pushSettings } from '../lib/sync';
import type { Session } from '../lib/cloud';
import type { Settings } from '../types';
import SignInPanel from './SignInPanel';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  session: Session | null;
  onSettingsChange: (s: Settings | null) => void;
}

export default function SettingsSheet({ open, onClose, settings, session, onSettingsChange }: Props) {
  const [startDate, setStartDate] = useState(settings.startDate);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStartDate(settings.startDate);
  }, [settings.startDate, open]);

  if (!open) return null;

  async function saveStartDate() {
    if (!startDate || startDate === settings.startDate) return;
    setBusy('saving');
    try {
      const next: Settings = { ...settings, startDate };
      await setSettings(next);
      pushSettings(next).catch(console.error);
      onSettingsChange(next);
      setMsg('Start date updated.');
    } finally {
      setBusy(null);
    }
  }

  async function doExport() {
    setBusy('export');
    try {
      const payload = await exportAll();
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `75hard-backup-${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Backup downloaded.');
    } finally {
      setBusy(null);
    }
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('Import will replace all current data. Continue?')) return;
    setBusy('import');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ExportPayload;
      await importAll(parsed);
      onSettingsChange(parsed.settings ?? settings);
      setMsg('Backup restored.');
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      console.error(err);
      setMsg('Import failed — file may be corrupt.');
    } finally {
      setBusy(null);
    }
  }

  async function doReset() {
    const cloudWarning = session
      ? '\n\nThis will also delete all cloud-synced data for your account.'
      : '';
    if (!confirm(`Erase all checks, photos, and notes? This cannot be undone.${cloudWarning}`)) return;
    setBusy('reset');
    try {
      await clearAll();
      if (session) await clearCloud(session.user.id).catch(console.error);
      localStorage.removeItem('congrats-dismissed-v1');
      onSettingsChange(null);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className="card w-full sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-b-none sm:rounded-2xl pad-safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="btn-ghost px-3 py-1.5 text-sm">Close</button>
        </div>

        <div className="px-5 py-5 space-y-6">
          <SignInPanel session={session} />

          <section>
            <label className="label" htmlFor="settings-start">Start date</label>
            <div className="flex gap-2">
              <input
                id="settings-start"
                type="date"
                className="field flex-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={saveStartDate}
                disabled={busy !== null || startDate === settings.startDate}
              >
                Save
              </button>
            </div>
            <p className="mt-2 text-xs text-parchment/50">
              Day 1 is your start date. Changing it shifts every day's date but keeps your checks and photos.
            </p>
          </section>

          <section className="space-y-3">
            <div className="label">Backup</div>
            <button className="btn-ghost w-full" onClick={doExport} disabled={busy !== null}>
              Export all data (.json)
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={onImportFile}
            />
            <button className="btn-ghost w-full" onClick={() => fileRef.current?.click()} disabled={busy !== null}>
              Import backup…
            </button>
            <p className="text-xs text-parchment/50">
              The export file contains every check, note, and photo (base64-encoded). Save it to your cloud drive
              for peace of mind.
            </p>
          </section>

          <section>
            <div className="label">Danger zone</div>
            <button className="btn-danger w-full" onClick={doReset} disabled={busy !== null}>
              Reset everything
            </button>
          </section>

          {msg && <div className="text-sm text-gold-300">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
