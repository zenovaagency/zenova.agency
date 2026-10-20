/**
 * Capture the social share card to public/og-card.png.
 *
 * The card is a dev-only page (src/pages/dev/og/[card].astro), so it uses the
 * site's real fonts, logo and drawings. Headless Chrome screenshots it at 2x and
 * sharp scales it down to 1200x630, which keeps type edges crisp.
 *
 * Run with the dev server up (astro dev --background):
 *   node scripts/og-card.mjs [base-url]
 * BROWSER_PATH overrides the browser; base-url defaults to http://localhost:4321.
 */
import { execFileSync } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Chrome by default: current Edge builds exit without writing a headless
// screenshot. BROWSER_PATH points at any Chromium-based browser instead.
const BROWSER = process.env.BROWSER_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = process.argv[2] ?? 'http://localhost:4321';
const out = fileURLToPath(new URL('../public/og-card.png', import.meta.url));

const W = 1200;
const H = 630;

const tmp = await mkdtemp(path.join(os.tmpdir(), 'og-'));
const shot = path.join(tmp, 'card.png');
execFileSync(
  BROWSER,
  [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${path.join(tmp, 'profile')}`,
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    `--window-size=${W},${H}`,
    '--virtual-time-budget=8000',
    `--screenshot=${shot}`,
    `${base}/dev/og/default`,
  ],
  { stdio: 'ignore' },
);

const info = await sharp(shot)
  .extract({ left: 0, top: 0, width: W * 2, height: H * 2 })
  .resize(W, H)
  .png({ compressionLevel: 9 })
  .toFile(out);

console.log(`og-card.png: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
