/**
 * /rss.xml — the studio's feed.
 *
 * Reads through published() like every other surface, so drafts are excluded
 * by the same gate rather than a second filter that could drift. Items link
 * without the trailing slash — /blog/<slug> is the canonical form, matching
 * the sitemap, the page canonicals and vercel.json's trailingSlash: false.
 */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, PAGES } from '../data/site';
import { published } from '../lib/blog';

export async function GET(context: APIContext) {
  const posts = await published();

  return rss({
    title: `${SITE.name} — ${PAGES.blog.eyebrow}`,
    description: PAGES.blog.description,
    site: context.site ?? SITE.url,
    // @astrojs/rss appends a slash by default, which would undo the links below.
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}`,
    })),
    customData: '<language>en</language>',
  });
}
