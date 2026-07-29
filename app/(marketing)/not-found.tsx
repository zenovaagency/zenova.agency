import { NotFoundPage } from '@/views/NotFoundPage';

/**
 * Rendered for any unresolved URL under the marketing group — an unknown
 * service/project/job slug, a retired CMS page, or a plain typo — and served
 * with a real HTTP 404.
 *
 * It sits inside the (marketing) group so the 404 keeps the site nav and
 * footer. A dead end with no way back was the old behaviour and it stranded
 * both visitors and crawlers.
 */
export const metadata = {
  title: 'Page not found | Zenova',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundPage />;
}
