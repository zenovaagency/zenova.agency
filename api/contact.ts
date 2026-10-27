/**
 * POST /api/contact — receives the project brief from src/islands/ContactForm.tsx
 * and emails it to us through Resend.
 *
 * A Vercel Function living beside the static site; Astro does not build or know
 * about it. Needs RESEND_API_KEY in the Vercel project's environment variables
 * (see .env.example). The sending domain, zenova.agency, is verified in Resend.
 */

const TO = process.env.CONTACT_TO ?? 'hello@zenova.agency';
const FROM = process.env.CONTACT_FROM ?? 'Zenova Website <website@zenova.agency>';
const MIN_FILL_MS = 3000; // faster than this is a bot
const SITE_HOSTS = new Set(['zenova.agency', 'www.zenova.agency']);

const MAX_LEN = {
  name: 120,
  email: 200,
  company: 200,
  service: 120,
  plan: 200,
  budget: 60,
  timeline: 60,
  message: 5000,
  page: 300,
} as const;

type Field = keyof typeof MAX_LEN;

const json = (body: { ok: boolean; error?: string }, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** No CR/LF in anything that ends up in a mail header. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ');

/** Same-site posts only: the site itself, or a Vercel preview of it. */
function sameSite(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser caller; the other checks still apply
  try {
    const host = new URL(origin).hostname;
    return SITE_HOSTS.has(host) || host.endsWith('.vercel.app') || host === 'localhost';
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!sameSite(request)) return json({ ok: false, error: 'forbidden' }, 403);

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  // Bots: reply "ok" so they learn nothing, but send nothing.
  if (data.website || !(Number(data.elapsedMs) >= MIN_FILL_MS)) return json({ ok: true });

  const f = {} as Record<Field, string>;
  for (const key of Object.keys(MAX_LEN) as Field[]) {
    f[key] = String(data[key] ?? '').slice(0, MAX_LEN[key]).trim();
  }

  if (
    !f.name ||
    !f.service ||
    f.message.length < 10 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)
  ) {
    return json({ ok: false, error: 'invalid' }, 400);
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('RESEND_API_KEY is not set');
    return json({ ok: false, error: 'server' }, 500);
  }

  const text = [
    'Name: ' + f.name,
    'Email: ' + f.email,
    f.company ? 'Company: ' + f.company : null,
    'Service: ' + f.service,
    f.plan ? 'Scope option: ' + f.plan : null,
    f.budget ? 'Budget: ' + f.budget : null,
    f.timeline ? 'Timeline: ' + f.timeline : null,
    f.page ? 'Sent from: ' + f.page : null,
    '',
    f.message,
  ]
    .filter((line) => line !== null)
    .join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: oneLine(f.email),
        subject: 'New project enquiry from ' + oneLine(f.name),
        text,
      }),
    });
    if (!res.ok) {
      console.error('Resend rejected the email', res.status, await res.text());
      return json({ ok: false, error: 'server' }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server' }, 502);
  }
}

export function GET(): Response {
  return json({ ok: false, error: 'method' }, 405);
}
