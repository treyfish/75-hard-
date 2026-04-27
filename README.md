# 75 Hard

A personal 75 Hard challenge tracker. Mobile-first, offline-capable, no accounts, no servers — your data lives in your browser.

## Features

- 75-day grid with per-day completion ring
- Daily checklist for all five 75 Hard rules:
  - Drank a gallon of water
  - Workout 1
  - Workout 2
  - One workout was outside
  - Followed diet
  - Read 10 pages
- Daily progress photo (camera capture on mobile, file picker on desktop) — compressed and stored locally in IndexedDB
- Workout notes + how-I-felt notes per day
- Daily motivational quote rotation (~150 stoic and great-minds quotes, deterministic per day, fully offline)
- Streak counter, % complete, current day
- Installable PWA — "Add to Home Screen" on iOS/Android for native-feel launch
- Export/import full backup as JSON (includes photos)
- Stoic gold-on-charcoal palette

## Tech

Vite + React + TypeScript + Tailwind. IndexedDB via [`idb`](https://github.com/jakearchibald/idb). PWA via `vite-plugin-pwa`. No backend.

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173.

## Build

```bash
pnpm build
pnpm preview
```

## Deploy

### Vercel (recommended)

```bash
npx vercel
```

`vercel.json` already configured for SPA rewrites. Zero env vars required.

### GitHub Pages

Push to `main`. The included workflow at `.github/workflows/deploy.yml` builds with `BASE_PATH=/<repo-name>/` and publishes to Pages. Enable Pages → "GitHub Actions" in the repo settings once.

The app uses hash-based routing (`#/day/3`) so it works on any static host without rewrite rules.

## Storage

- All data lives in IndexedDB on the device that opened the app.
- Photos are auto-resized to ≤ 1600 px and saved as JPEG (q 0.85), so 75 photos typically use ~20 MB.
- On first photo save, the app calls `navigator.storage.persist()` so the browser won't evict your data.
- Use **Settings → Export** regularly to back up everything as a JSON file (includes base64-encoded photos). Import restores it on any device.

## Mental model

- Set a start date once. Day 1 is that date. Each cell on the grid maps to a calendar date.
- Tap any day to view/edit it. Past, present, and future days are all editable (so you can backfill if you forgot to check off the night before).
- A day's cell turns green when all six checkboxes are ticked.
- The same quote appears on the same day every time you open it.

## License

Personal use.
