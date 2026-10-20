import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/**
 * The data attributes that turn an element into an image-viewer trigger
 * (see lib/viewer.ts). Build-time only: the image is re-encoded once at its
 * natural width, capped at 2000px, so the viewer always gets the sharpest
 * rendition there is.
 */
export async function viewerAttrs(image: ImageMetadata, alt: string) {
  const width = Math.min(image.width, 2000);
  const height = Math.round((image.height / image.width) * width);
  const out = await getImage({ src: image, width, format: 'webp', quality: 86 });
  return {
    'data-viewer': '',
    'data-viewer-src': out.src,
    'data-viewer-alt': alt,
    'data-viewer-w': String(width),
    'data-viewer-h': String(height),
  };
}
