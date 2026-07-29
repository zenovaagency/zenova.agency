import { llmsFullTxt } from '@/seo/llms';

/** /llms-full.txt — the long-form reference: services, tech, portfolio, pricing, FAQs. */
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(llmsFullTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
