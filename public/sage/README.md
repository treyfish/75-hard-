# Sage character art

Drop 7 portrait images here, named exactly:

```
level-0.webp
level-1.webp
level-2.webp
level-3.webp
level-4.webp
level-5.webp
level-6.webp
```

Recommended specs:
- 3:4 portrait (e.g. 768×1024)
- ≤200 KB each
- Dark/charcoal background so the figure floats against the app's UI

If you have PNG/JPEG, you can either:
- Convert them to WebP (any online converter, or `cwebp -q 85 in.png -o level-0.webp`), or
- Change the extension constant `SAGE_EXT` in `src/components/Sage.tsx` to `'png'` or `'jpg'`.

Missing images don't crash the app — the figure renders invisibly and the
card still shows level/title/progress.

Prompts to generate these are in the project plan under
"Realistic Sage character art".
