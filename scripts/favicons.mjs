/**
 * Build every favicon and app icon in public/ from public/favicon.svg.
 *
 * The SVG is the one source: the black mark on a solid white rounded square.
 * The white tile is there on purpose. A black mark on transparency vanishes
 * on dark backgrounds (dark-mode search results, dark browser tabs), and
 * Google Search wants a square icon at a multiple of 48px that reads on its
 * own. Only the tile's rounded corners are transparent.
 *
 *   favicon.ico            16, 32 and 48 px PNG entries, packed by hand
 *                          (sharp cannot write ICO)
 *   favicon-48x48.png      Google Search sizes: multiples of 48
 *   favicon-96x96.png
 *   favicon-192x192.png    also the manifest icon
 *   favicon-512x512.png    manifest
 *   icon-maskable-512.png  manifest, mark shrunk into the 80% safe zone
 *   apple-touch-icon.png   180 px, square corners: iOS rounds it itself
 *
 * Run: node scripts/favicons.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const pub = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
const svg = await readFile(pub('favicon.svg'), 'utf8');

// The same drawing with square corners, for icons the platform masks itself.
const square = svg.replace(/<rect([^>]*?) rx="[\d.]+"/, '<rect$1');

const png = (source, size) =>
  sharp(Buffer.from(source), { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

for (const size of [48, 96, 192, 512]) {
  await writeFile(pub(`favicon-${size}x${size}.png`), await png(svg, size));
}
await writeFile(pub('apple-touch-icon.png'), await png(square, 180));

// Maskable: launchers crop to any shape inside an 80% circle, so the mark is
// drawn at 78% on a full-bleed white square.
const inner = await png(square, Math.round(512 * 0.78));
await writeFile(
  pub('icon-maskable-512.png'),
  await sharp({ create: { width: 512, height: 512, channels: 3, background: '#ffffff' } })
    .composite([{ input: inner, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer(),
);

// ICO: a 6-byte header, a 16-byte directory entry per image, then the PNGs.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => png(svg, s)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const at = 6 + 16 * i;
  header.writeUInt8(s, at);
  header.writeUInt8(s, at + 1);
  header.writeUInt8(0, at + 2);
  header.writeUInt8(0, at + 3);
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(images[i].length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += images[i].length;
});
await writeFile(pub('favicon.ico'), Buffer.concat([header, ...images]));

console.log('Wrote favicon.ico, favicon-{48,96,192,512}.png, icon-maskable-512.png, apple-touch-icon.png');
