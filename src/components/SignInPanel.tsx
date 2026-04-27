import { useState } from 'react';
import {
  cloudConfigured,
  cloudSource,
  clearRuntimeCloudConfig,
  saveRuntimeCloudConfig,
  signInWithEmail,
  signOut,
} from '../lib/cloud';
import type { Session } from '../lib/cloud';

interface Props {
  session: Session | null;
}

export default function SignInPanel({ session }: Props) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Stage 1: not configured at all (no env vars, no runtime config) -> show paste form
  if (!cloudConfigured) {
    return <ConfigureForm />;
  }

  if (session) {
    return (
      <div className="card p-4 space-y-3">
        <div>
          <div className="label">Cloud sync</div>
          <div className="text-sm">
            Signed in as <span className="text-gold-300">{session.user.email ?? 'you'}</span>
          </div>
          <div className="text-[11px] text-parchment/45 mt-1">
            Source: {cloudSource === 'env' ? 'Vercel env vars' : 'on-device config'}
          </div>
          <div className="text-xs text-parchment/55 mt-2">
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
        {cloudSource === 'runtime' && (
          <button
            className="btn-ghost w-full text-parchment/70"
            onClick={() => {
              if (!confirm('Remove the on-device cloud config? You will be signed out and the form will reappear.')) return;
              clearRuntimeCloudConfig();
              location.reload();
            }}
          >
            Forget cloud config on this device
          </button>
        )}
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
        <div className="text-[11px] text-parchment/45 mt-1">
          Source: {cloudSource === 'env' ? 'Vercel env vars' : 'on-device config'}
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

function ConfigureForm() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setErr(null);
    const cleanUrl = url.trim().replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '');
    const cleanKey = key.trim();
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cleanUrl)) {
      setErr('URL should look like https://your-project.supabase.co');
      return;
    }
    if (!cleanKey.startsWith('eyJ')) {
      setErr('Anon key should be a long token starting with "eyJ"');
      return;
    }
    saveRuntimeCloudConfig(cleanUrl, cleanKey);
    location.reload();
  }

  return (
    <div className="card p-4 space-y-3">
      <div>
        <div className="label">Cloud sync — set up</div>
        <div className="text-sm text-parchment/80">
          Paste your Supabase project URL and anon public key. They live on this device only and unlock cloud sync immediately — no rebuild needed.
        </div>
      </div>
      <div>
        <label className="label" htmlFor="sb-url">Project URL</label>
        <input
          id="sb-url"
          type="url"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="field font-mono text-xs"
          placeholder="https://xxxx.supabase.co"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="sb-key">Anon public key</label>
        <textarea
          id="sb-key"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="field font-mono text-xs min-h-[110px] resize-y"
          placeholder="eyJhbGciOiJI…"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </div>
      <button className="btn-primary w-full" onClick={save} disabled={!url || !key}>
        Save & enable cloud sync
      </button>
      {err && <div className="text-sm text-red-300">{err}</div>}
      <details className="text-xs text-parchment/55">
        <summary className="cursor-pointer">Where do I get these?</summary>
        <ol className="list-decimal pl-4 mt-2 space-y-1">
          <li>Open your Supabase project.</li>
          <li>Project Settings → API Keys → "Legacy" tab.</li>
          <li>Copy the <span className="text-parchment">anon public</span> key (long <code>eyJ…</code> token).</li>
          <li>For the URL, use the bare project URL like <code>https://xxxx.supabase.co</code> — no <code>/rest/v1</code>.</li>
        </ol>
      </details>
    </div>
  );
}
