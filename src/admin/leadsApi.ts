/**
 * Admin lead inbox — thin typed fetchers over /admin/leads.
 *
 * Like usersApi.ts (and unlike the public `Store`s in store.ts), leads are
 * admin-only and consumed by a single page, so they are never cached in
 * localStorage.
 */

import { api } from '@/lib/api';

/** Same shape as the backend's LeadOut. */
export interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function listLeads(): Promise<Lead[]> {
  return api<Lead[]>('/admin/leads', { auth: true });
}

export function markLeadRead(id: string, is_read: boolean): Promise<Lead> {
  return api<Lead>(`/admin/leads/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { is_read },
    auth: true,
  });
}

export function deleteLead(id: string): Promise<void> {
  return api<void>(`/admin/leads/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true });
}
