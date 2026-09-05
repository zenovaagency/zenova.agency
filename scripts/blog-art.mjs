/**
 * Rasterise the blog artwork sources in src/assets/blog/*.svg to
 * public/blog/*.png at their natural 1200x630 size.
 *
 * The PNGs are what ships: they are the frontmatter `image` on each post, so
 * they serve as og:image and Twitter card image (social scrapers do not
 * support SVG) as well as the visible artwork on the index and post pages.
 *
 * Run: node scripts/blog-art.mjs
 */
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const srcDir = fileURLToPath(new URL('../src/assets/blog/', import.meta.url));
const outDir = fileURLToPath(new URL('../public/blog/', import.meta.url));

await mkdir(outDir, { recursive: true });

for (const file of await readdir(srcDir)) {
  if (!file.endsWith('.svg')) continue;
  const out = path.join(outDir, file.replace(/\.svg$/, '.png'));
  await sharp(path.join(srcDir, file)).png().toFile(out);
  console.log(`${file} -> ${path.basename(out)}`);
}
