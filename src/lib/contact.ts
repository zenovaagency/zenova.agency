/**
 * Public contact-form submission.
 *
 * Posts to the backend's unauthenticated `/contact` endpoint (rate-limited
 * server-side). Resolves on the 204 success; rejects with an `ApiError`
 * otherwise so the form can surface a message.
 */

import { api } from '@/lib/api';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  /** Honeypot — hidden from real users; leave empty. A non-empty value is spam. */
  company_website?: string;
}

export function submitContact(payload: ContactPayload): Promise<void> {
  return api<void>('/contact', { method: 'POST', body: payload });
}
