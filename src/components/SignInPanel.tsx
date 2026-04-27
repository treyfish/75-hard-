import { useState } from 'react';
import { signInWithEmail, signOut } from '../lib/cloud';
import type { Session } from '../lib/cloud';

interface Props {
  session: Session | null;
}

export default function SignInPanel({ session }: Props) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (session) {
    return (
      <div className="card p-4 space-y-3">
        <div>
          <div className="label">Cloud sync</div>
          <div className="text-sm">
            Signed in as <span className="text-gold-300">{session.user.email ?? 'you'}</span>
          </div>
          <div className="text-xs text-parchment/50 mt-1">
            Your data syncs automatically across every device you sign in on.
          </div>
        </div>
        <button
          className="btn-ghost w-full"
          onClick={async () => {
            setBusy(true);
            try {
              await signOut();
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          Sign out on this device
        </button>
      </div>
    );
  }

  async function send() {
    setMsg(null);
    setErr(null);
    if (!email || !email.includes('@')) {
      setErr('Enter a valid email.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await signInWithEmail(email.trim());
      if (error) setErr(error);
      else setMsg('Check your email for the sign-in link.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <div>
        <div className="label">Cloud sync</div>
        <div className="text-sm text-parchment/80">
          Sign in once to back up to the cloud and sync across devices. No password — we email you a one-tap link.
        </div>
      </div>
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        className="field"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn-primary w-full" onClick={send} disabled={busy || !email}>
        Send magic link
      </button>
      {msg && <div className="text-sm text-success">{msg}</div>}
      {err && <div className="text-sm text-red-300">{err}</div>}
    </div>
  );
}
