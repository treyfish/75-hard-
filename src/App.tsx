import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import GridView from './routes/GridView';
import DayView from './routes/DayView';
import OnboardingDialog from './components/OnboardingDialog';
import { getSettings, requestPersistence, setSettings } from './lib/db';
import type { Settings } from './types';
import { todayISO } from './lib/progress';
import { getSession, onAuthChange, type Session } from './lib/cloud';
import { pullFromCloud, pushSettings, setActiveUser, syncEnabled } from './lib/sync';

export default function App() {
  const [settings, setSettingsState] = useState<Settings | null | undefined>(undefined);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getSettings();
      if (!cancelled) setSettingsState(s ?? null);
      requestPersistence().catch(() => {});
      if (syncEnabled) {
        const sess = await getSession();
        if (!cancelled) setSession(sess);
        if (sess) {
          setActiveUser(sess.user.id);
          pullFromCloud(sess.user.id)
            .then(async () => {
              const fresh = await getSettings();
              if (!cancelled && fresh) setSettingsState(fresh);
            })
            .catch(console.error);
        }
      }
    })();
    const off = onAuthChange((sess) => {
      setSession(sess);
      setActiveUser(sess?.user.id ?? null);
      if (sess) {
        pullFromCloud(sess.user.id)
          .then(async () => {
            const fresh = await getSettings();
            if (fresh) setSettingsState(fresh);
          })
          .catch(console.error);
      }
    });
    return () => {
      cancelled = true;
      off();
    };
  }, []);

  async function handleStart(startDate: string) {
    const next: Settings = { startDate, theme: 'stoic-gold' };
    await setSettings(next);
    setSettingsState(next);
    pushSettings(next).catch(console.error);
  }

  function handleSettingsChange(s: Settings | null) {
    setSettingsState(s);
    if (s) pushSettings(s).catch(console.error);
  }

  if (settings === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-parchment/60">
        <div className="font-serif italic text-xl">75</div>
      </div>
    );
  }

  if (settings === null) {
    return <OnboardingDialog defaultDate={todayISO()} onStart={handleStart} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<GridView settings={settings} session={session} onSettingsChange={handleSettingsChange} />}
      />
      <Route
        path="/day/:n"
        element={<DayView settings={settings} session={session} onSettingsChange={handleSettingsChange} />}
      />
      <Route
        path="*"
        element={<GridView settings={settings} session={session} onSettingsChange={handleSettingsChange} />}
      />
    </Routes>
  );
}
