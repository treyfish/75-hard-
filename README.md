# 75 Hard

A personal 75 Hard challenge tracker. Mobile-first, offline-capable, optional cloud sync.

## Features

- 75-day grid with per-day completion ring
- Daily checklist for all five 75 Hard rules:
  - Drank a gallon of water
  - Workout 1
  - Workout 2
  - One workout was outside
  - Followed diet
  - Read 10 pages
- Daily progress photo (camera capture on mobile, file picker on desktop) — compressed and stored locally + cloud
- Workout notes + how-I-felt notes per day
- Daily motivational quote rotation (~150 stoic and great-minds quotes, deterministic per day, fully offline)
- **Stoic Sage character** that visibly evolves through 7 stages as you complete days — from a barefoot Seeker on Day 0 to a crowned, glowing Sage at Day 75
- **Day 75 celebration screen** with confetti, full-stage Sage, final stoic quote, and your stats
- Streak counter, % complete, current day
- Optional Supabase cloud sync — sign in once per device with an email magic link, data syncs everywhere
- Installable PWA — "Add to Home Screen" on iOS/Android for native-feel launch
- Export/import full backup as JSON (includes photos)
- Stoic gold-on-charcoal palette

## Tech

Vite + React + TypeScript + Tailwind. IndexedDB via [`idb`](https://github.com/jakearchibald/idb). Supabase (Postgres + Storage) for optional cloud sync. Confetti via `canvas-confetti`. PWA via `vite-plugin-pwa`.

## Local development

```bash
pnpm install
pnpm dev          # local-only, no cloud
pnpm dev --host   # accept iPhone connections on the same Wi-Fi
```

Open http://localhost:5173.

## Build

```bash
pnpm build
pnpm preview
```

## Cloud sync (Supabase) — recommended

Without these env vars, the app runs fully offline (IndexedDB only). Add them to enable cross-device sync.

### One-time setup (5 minutes, all from your phone or laptop)

1. **Create a Supabase project**: [supabase.com](https://supabase.com) → sign up with GitHub → **New Project**. Free tier is fine. Wait ~90 seconds while it provisions.
2. **Run the schema**: Open the project → **SQL Editor** → **New query** → paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**. This creates the tables, row-level-security policies, and the photo storage bucket.
3. **Grab your keys**: **Project Settings → API** → copy the **Project URL** and the **anon public** key.
4. **Add to Vercel**: Vercel project → **Settings → Environment Variables** → add:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public key
5. **Allow your domain to receive magic-link redirects**: Supabase → **Authentication → URL Configuration** → set **Site URL** to your Vercel URL (e.g. `https://75-hard-xxxx.vercel.app`) and add the same URL to **Redirect URLs**.
6. **Redeploy** the Vercel project (one click in the Deployments tab).
7. Open the app → Settings → enter your email → tap the link in your inbox. You're synced. Sign in on any other device the same way.

After setup, your check-marks, notes, and photos write to both your phone (instant, works offline) and Supabase (durable, multi-device). The header shows a tiny dot: gold = saving, green = synced, red = error.

### Local sync setup (optional)

Copy `.env.example` to `.env.local` and fill in the same two values to test sync against the dev server.

## Deploy

### Vercel (recommended)

```bash
npx vercel
```

`vercel.json` is preconfigured. Add the two `VITE_SUPABASE_*` env vars in the Vercel dashboard for cloud sync.

### GitHub Pages

Push to `main`. The workflow at `.github/workflows/deploy.yml` builds and publishes. Add the two env vars as repository **Actions secrets** if using cloud sync, then reference them in the workflow `env:` block.

The app uses hash-based routing (`#/day/3`) so it works on any static host without rewrite rules.

## How storage works

- **Local**: every check, note, and photo writes to IndexedDB on the device first, so the app is instant and works offline. Photos are auto-resized to ≤ 1600 px and saved as JPEG (q 0.85), so 75 photos use ~20 MB.
- **Cloud (if signed in)**: writes are mirrored to Supabase. Photos go to a private storage bucket; only the path is stored in the row. Row-level-security enforces that each authenticated user can only see their own data.
- **First sign-in on a fresh device**: the app pulls everything from the cloud and downloads your photos into local IndexedDB. From then on, the device is fully usable offline.
- **Backup/restore**: Settings → Export/Import gives you a JSON archive (with base64-encoded photos) regardless of cloud setup.

## The Stoic Sage

A quietly satisfying way to see your progress. Unlocked stages:

| Stage | Days complete | Title |
| --- | --- | --- |
| 0 | 0 | The Seeker |
| 1 | 13 | The Apprentice |
| 2 | 26 | The Initiate |
| 3 | 38 | The Guardian |
| 4 | 51 | The Stoic |
| 5 | 63 | The Master |
| 6 | 75 | **The Sage** |

Each new stage triggers a level-up flourish on the home screen. Day 75 unlocks the celebration screen with confetti and the full-form Sage.

## License

Personal use.
