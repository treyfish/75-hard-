import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import GridView from './routes/GridView';
import DayView from './routes/DayView';
import OnboardingDialog from './components/OnboardingDialog';
import { getSettings, requestPersistence, setSettings } from './lib/db';
import type { Settings } from './types';
import { todayISO } from './lib/progress';

export default function App() {
  const [settings, setSettingsState] = useState<Settings | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getSettings();
      if (!cancelled) setSettingsState(s ?? null);
      requestPersistence().catch(() => {});
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStart(startDate: string) {
    const next: Settings = { startDate, theme: 'stoic-gold' };
    await setSettings(next);
    setSettingsState(next);
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
      <Route path="/" element={<GridView settings={settings} onSettingsChange={setSettingsState} />} />
      <Route path="/day/:n" element={<DayView settings={settings} onSettingsChange={setSettingsState} />} />
      <Route path="*" element={<GridView settings={settings} onSettingsChange={setSettingsState} />} />
    </Routes>
  );
}
