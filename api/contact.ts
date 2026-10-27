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

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * The notification as an HTML email: table layout and inline styles, because
 * mail clients ignore most <style> blocks and all flexbox. Colours are the
 * site's tokens. Every visitor-supplied value is escaped before it is placed.
 */
function renderHtml(f: Record<Field, string>): string {
  const e = escapeHtml;
  const first = f.name.split(/\s+/)[0];
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const reply =
    'mailto:' +
    encodeURIComponent(oneLine(f.email)).replace(/%40/g, '@') +
    '?subject=' +
    encodeURIComponent('Re: your project enquiry');

  const rows: [string, string][] = [
    ['Name', e(f.name)],
    ['Email', `<a href="${e(reply)}" style="color:#0060e6;text-decoration:none;">${e(f.email)}</a>`],
    ['Company', e(f.company)],
    ['Service', e(f.service)],
    ['Scope option', e(f.plan)],
    ['Budget', e(f.budget)],
    ['Timeline', e(f.timeline)],
  ];
  const details = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
          <tr>
            <td style="padding:10px 16px 10px 0;width:112px;vertical-align:top;border-top:1px solid #e4e7eb;font:600 11px/1.4 ${font};letter-spacing:.06em;text-transform:uppercase;color:#5a6b7d;">${label}</td>
            <td style="padding:10px 0;vertical-align:top;border-top:1px solid #e4e7eb;font:15px/1.5 ${font};color:#0b3558;">${value}</td>
          </tr>`,
    )
    .join('');

  const preheader = e(
    [f.service, f.budget].filter(Boolean).join(' · ') + ': ' + f.message.replace(/\s+/g, ' ').slice(0, 90),
  );
  const page = /^https?:\/\//.test(f.page)
    ? `<a href="${e(f.page)}" style="color:#5a6b7d;">${e(f.page)}</a>`
    : e(f.page);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>New project enquiry from ${e(f.name)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f9ff;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9ff;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e4e7eb;border-radius:16px;">
      <tr><td style="padding:28px 32px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;"><img src="https://zenova.agency/assets/zenova-mark.png" width="32" height="32" alt="Zenova" style="display:block;border-radius:8px;"></td>
          <td style="padding-left:12px;vertical-align:middle;font:600 12px/1.4 ${font};letter-spacing:.08em;text-transform:uppercase;color:#0060e6;">New project enquiry</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:20px 32px 4px;font:600 24px/1.3 ${font};color:#0b3558;">${e(f.name)} wants to talk about ${e(f.service)}</td></tr>
      <tr><td style="padding:12px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #e4e7eb;">${details}
        </table>
      </td></tr>
      <tr><td style="padding:24px 32px 0;">
        <div style="font:600 11px/1.4 ${font};letter-spacing:.06em;text-transform:uppercase;color:#5a6b7d;padding-bottom:8px;">Brief</div>
        <div style="padding:16px 18px;background:#f6f9ff;border:1px solid #e4e7eb;border-radius:12px;font:15px/1.6 ${font};color:#0b3558;white-space:pre-wrap;word-wrap:break-word;">${e(f.message)}</div>
      </td></tr>
      <tr><td style="padding:28px 32px 0;">
        <a href="${e(reply)}" style="display:inline-block;padding:13px 22px;background:#0060e6;border-radius:999px;font:600 15px/1 ${font};color:#ffffff;text-decoration:none;">Reply to ${e(first)}</a>
      </td></tr>
      <tr><td style="padding:28px 32px 28px;font:12px/1.5 ${font};color:#5a6b7d;">${f.page ? `Sent from ${page} via the contact form.` : 'Sent via the contact form.'}</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

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
        html: renderHtml(f),
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
