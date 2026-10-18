/**
 * Build the project showcase images in src/assets/works/.
 *
 * - NEXA, Savore and HomeEase are design showcases supplied as ~2 MB PNGs.
 *   They are resized to 1600px wide and written as WebP, which is what
 *   astro:assets then resizes again per srcset at build time.
 * - Truplexy is a live site, so its showcase is captured here: four pages
 *   are screenshotted with headless Edge and composed into the same
 *   one-big-plus-three-small collage the other showcases use.
 *
 * Run: node scripts/works-art.mjs <dir-with-the-original-pngs>
 * Edge is only needed for the Truplexy capture (EDGE_PATH overrides its location).
 */
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const originals = process.argv[2];
if (!originals) throw new Error('Usage: node scripts/works-art.mjs <dir-with-the-original-pngs>');

const outDir = fileURLToPath(new URL('../src/assets/works/', import.meta.url));
await mkdir(outDir, { recursive: true });

const webp = { quality: 82, effort: 6 };

/**
 * Each project gets three images, one per tile frame on /work (see .tile--img in
 * work/index.astro). The default is the full showcase; small and wide are crops
 * of the lead screen at the frame's ratio, so the picture fills its frame
 * instead of being cut by it. `-full` is the whole showcase at its own ratio,
 * for the detail page, where nothing should be cropped or padded.
 */
const FRAMES = { feature: 1.1, small: 1.8, wide: 1.5 };
const OUT_W = 1600;

/** Crop rects are [left, top, width] in source pixels; the height follows the frame ratio. */
const SHOWCASES = {
  'nexa-properties': {
    from: 'Nexa Properties Real Estate UI Showcase.png',
    small: [12, 12, 870],
    wide: [12, 12, 870],
  },
  savore: {
    from: 'Savoré Restaurant App Showcase.png',
    small: [0, 0, 1312],
    wide: [0, 0, 1312],
  },
  homeease: {
    from: 'HomeEase Services UI Showcase.png',
    small: [30, 14, 630],
    wide: [30, 14, 630],
  },
};

async function write(input, name, ratio) {
  const info = await sharp(input)
    .resize(OUT_W, Math.round(OUT_W / ratio), { fit: 'cover', position: 'top' })
    .webp(webp)
    .toFile(path.join(outDir, name));
  console.log(`${name}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
}

/** A crop of `file` at the frame's ratio. */
const crop = (file, [left, top, width], ratio) =>
  sharp(file).extract({ left, top, width, height: Math.round(width / ratio) }).toBuffer();

for (const [slug, { from, small, wide }] of Object.entries(SHOWCASES)) {
  const file = path.join(originals, from);
  const { width, height } = await sharp(file).metadata();
  // The full showcase, padded with its own background colour where its ratio
  // differs from the feature frame's, never cropped.
  const bg = await sharp(file).extract({ left: 1, top: 1, width: 1, height: 1 }).raw().toBuffer();
  const needH = Math.round(width / FRAMES.feature);
  const padded = await sharp(file)
    .extend({
      top: Math.max(0, Math.floor((needH - height) / 2)),
      bottom: Math.max(0, Math.ceil((needH - height) / 2)),
      background: { r: bg[0], g: bg[1], b: bg[2] },
    })
    .toBuffer();
  await write(padded, `${slug}.webp`, FRAMES.feature);
  await write(file, `${slug}-full.webp`, width / height);
  await write(await crop(file, small, FRAMES.small), `${slug}-small.webp`, FRAMES.small);
  await write(await crop(file, wide, FRAMES.wide), `${slug}-wide.webp`, FRAMES.wide);
}

// --- Truplexy ---------------------------------------------------------------

const EDGE =
  process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

/** Collage at 2x of the 1312x1199 the other showcases use; scaled down at the end. */
const W = 2624;
const H = 2398;
const GAP = 32;
const BG = '#e4e9f6';
const RADIUS = 28;

const COL_L = 1560;
const COL_R = W - GAP * 3 - COL_L;
const ROW_H = Math.floor((H - GAP * 4) / 3);

const shotsDir = await mkdtemp(path.join(os.tmpdir(), 'truplexy-'));

function capture(name, route, width, height) {
  const file = path.join(shotsDir, `${name}.png`);
  execFileSync(
    EDGE,
    [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      `--window-size=${width},${height}`,
      '--virtual-time-budget=10000',
      `--screenshot=${file}`,
      `https://truplexy.com${route}`,
    ],
    { stdio: 'ignore' },
  );
  return file;
}

/** A screenshot, cropped to the card's aspect, with rounded corners. */
async function card(file, w, h) {
  const mask = Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${RADIUS}"/></svg>`,
  );
  return sharp(file)
    .resize(w, h, { fit: 'cover', position: 'top' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

/** Soft drop shadow. PAD is the gap, so the padded shadow stays inside the canvas. */
const PAD = GAP;
const shadow = (w, h) =>
  sharp(
    Buffer.from(
    `<svg width="${w + PAD * 2}" height="${h + PAD * 2}">
      <filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter>
      <rect x="${PAD}" y="${PAD + 6}" width="${w}" height="${h}" rx="${RADIUS}" fill="#1b2559" fill-opacity="0.22" filter="url(#b)"/>
    </svg>`,
    ),
  )
    .png()
    .toBuffer();

const layers = [
  { file: capture('home', '/', 1440, Math.round((1440 * (H - GAP * 2)) / COL_L)), x: GAP, y: GAP, w: COL_L, h: H - GAP * 2 },
  { file: capture('pricing', '/pricing', 1440, Math.round((1440 * ROW_H) / COL_R)), x: COL_L + GAP * 2, y: GAP, w: COL_R, h: ROW_H },
  { file: capture('channels', '/channels', 1440, Math.round((1440 * ROW_H) / COL_R)), x: COL_L + GAP * 2, y: GAP * 2 + ROW_H, w: COL_R, h: ROW_H },
  { file: capture('docs', '/docs', 1440, Math.round((1440 * ROW_H) / COL_R)), x: COL_L + GAP * 2, y: GAP * 3 + ROW_H * 2, w: COL_R, h: ROW_H },
];

const composites = [];
for (const l of layers) {
  composites.push({ input: await shadow(l.w, l.h), left: l.x - PAD, top: l.y - PAD });
  composites.push({ input: await card(l.file, l.w, l.h), left: l.x, top: l.y });
}

// sharp resizes before it composites, so the collage is flattened first.
const collage = await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
  .composite(composites)
  .png()
  .toBuffer();

await write(collage, 'truplexy.webp', FRAMES.feature);

// The small and wide frames show the top of the home page, hero and headline.
const home = layers[0].file;
await write(await crop(home, [0, 0, 1440], FRAMES.small), 'truplexy-small.webp', FRAMES.small);
await write(await crop(home, [0, 0, 1440], FRAMES.wide), 'truplexy-wide.webp', FRAMES.wide);
