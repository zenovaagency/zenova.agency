import { llmsTxt } from '@/seo/llms';

/**
 * /llms.txt — the concise, agent-readable map of the site.
 *
 * Served from a route handler rather than checked into public/ so it cannot
 * drift from the real service, project, pricing and route data: llmsTxt()
 * builds it from the same modules that drive the pages themselves. robots.txt
 * points AI agents here.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(llmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
