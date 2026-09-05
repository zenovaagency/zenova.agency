/**
 * Blog collection access.
 *
 * The TS data modules (projects.ts, jobs.ts) own their own `published()`
 * helpers; this is the same gate for the content collection. Everything that
 * surfaces a post — routes, the index, the RSS feed — reads through here, so
 * a draft cannot leak into any of them by one path being forgotten.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Published posts, newest first. Drafts never leave this file. */
export async function published(): Promise<Post[]> {
  const all = await getCollection('blog', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
