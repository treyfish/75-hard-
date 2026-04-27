import { useState } from 'react';

interface Props {
  defaultDate: string;
  onStart: (startDate: string) => void | Promise<void>;
}

export default function OnboardingDialog({ defaultDate, onStart }: Props) {
  const [date, setDate] = useState(defaultDate);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!date) return;
    setSubmitting(true);
    try {
      await onStart(date);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-5 pad-safe-top pad-safe-bottom">
      <div className="card max-w-md w-full p-7">
        <div className="text-gold-500 font-serif italic text-5xl leading-none mb-3">75</div>
        <h1 className="text-2xl font-semibold tracking-tight">Begin the challenge</h1>
        <p className="mt-2 text-parchment/70 leading-relaxed">
          Seventy-five days. Five rules every day. Pick a start date — today, tomorrow,
          or the day you've already begun.
        </p>

        <div className="mt-6">
          <label className="label" htmlFor="start-date">Start date</label>
          <input
            id="start-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field"
          />
        </div>

        <ul className="mt-6 space-y-1.5 text-sm text-parchment/75">
          <li>· Drink a gallon of water</li>
          <li>· Two workouts (one outside)</li>
          <li>· Take a progress photo</li>
          <li>· Follow your diet</li>
          <li>· Read 10 pages of non-fiction</li>
        </ul>

        <button
          className="btn-primary w-full mt-7"
          onClick={submit}
          disabled={submitting || !date}
        >
          Start Day 1
        </button>
      </div>
    </div>
  );
}
