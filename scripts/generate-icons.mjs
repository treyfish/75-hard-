import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/icons');
mkdirSync(outDir, { recursive: true });

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1a1d22"/>
      <stop offset="100%" stop-color="#0a0c0f"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#g)"/>
  <rect x="32" y="32" width="448" height="448" rx="80" fill="none" stroke="#d4a85a" stroke-opacity="0.35" stroke-width="4"/>
  <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle"
        font-family="Cormorant Garamond, Georgia, serif" font-style="italic"
        font-weight="500" font-size="240" fill="#d4a85a">75</text>
  <text x="50%" y="80%" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter, system-ui, sans-serif" font-weight="600"
        letter-spacing="14" font-size="36" fill="#e8e3d6" fill-opacity="0.7">HARD</text>
</svg>`;

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg(size)))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(resolve(outDir, `icon-${size}.png`));
  console.log(`wrote public/icons/icon-${size}.png`);
}

await sharp(Buffer.from(svg(180)))
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(resolve(outDir, 'apple-touch-icon.png'));
console.log('wrote public/icons/apple-touch-icon.png');
