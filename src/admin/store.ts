/**
 * Backed-by-API content store.
 *
 * Each entity store keeps an in-memory snapshot of its data. On first import,
 * a single ``/public/site`` request hydrates everything for the public site
 * (no auth needed). Admin mutations call the corresponding ``PUT /admin/*``
 * endpoint and update the snapshot on success.
 *
 * The hook surface (`useServices`, `useProjects`, …) matches the pre-API
 * version so existing components don't need to change. Each hook now also
 * exposes ``status`` and ``error`` for callers that care.
 */

import { useEffect, useReducer, useRef } from 'react';
import { ApiError, api } from '@/lib/api';
import {
  clearTokens,
  getStoredUser,
  hasRole,
  login as sessionLogin,
  logout as sessionLogout,
  type SessionUser as AdminUser,
} from '@/lib/session';
import { SERVICES as DEFAULT_SERVICES, type ServiceDetail } from '@/data/services';
import { PROJECTS as DEFAULT_PROJECTS, type ProjectDetail } from '@/data/projects';

type Listener = () => void;
type Status = 'idle' | 'loading' | 'ready' | 'error';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  tone: string;
}

export interface FAQItem {
  id: string;
  q: string;
  a: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  tone: string;
}

export interface MarqueeItem {
  id: string;
  label: string;
}

export interface AboutValue {
  id: string;
  icon: string;
  title: string;
  blurb: string;
  hue: string;
}

export interface AboutRole {
  id: string;
  title: string;
  location: string;
  href: string;
}

export interface AboutMilestone {
  id: string;
  year: string;
  what: string;
}

export interface AboutContent {
  values: AboutValue[];
  roles: AboutRole[];
  timeline: AboutMilestone[];
}

export interface SiteContent {
  hero: {
    badge: string;
    headline: string;
    rotatingWords: string[];
    sub: string;
    primaryCta: string;
    primaryCtaHref: string;
    secondaryCta: string;
    secondaryCtaHref: string;
    stats: Array<{ id: string; num: string; label: string }>;
  };
  cta: {
    eyebrow: string;
    title: string;
    accentTitle: string;
    sub: string;
    primary: string;
    primaryHref: string;
    secondary: string;
    secondaryHref: string;
  };
  faqs: FAQItem[];
  testimonials: TestimonialItem[];
  marquee: MarqueeItem[];
  contactEmail: string;
  about: AboutContent;
}

export interface BrandSettings {
  studioName: string;
  tagline: string;
  contactEmail: string;
  careersEmail: string;
  phone: string;
  address: string;
  locations: Array<{ id: string; city: string; tz: string; detail: string }>;
}

const DEFAULT_TEAM: TeamMember[] = [
  { id: 't1', name: 'Mira Aldana', role: 'Co-founder, Design', bio: 'Leads brand and product design. Previously at Linear.', initials: 'MA', tone: '#3a5bff' },
  { id: 't2', name: 'Tobias Reinhardt', role: 'Co-founder, Engineering', bio: 'Leads the build team. Previously at Stripe and Vercel.', initials: 'TR', tone: '#6d4cff' },
  { id: 't3', name: 'Suri Patel', role: 'Head of Growth', bio: 'Runs marketing, paid media and lifecycle programs.', initials: 'SP', tone: '#a855f7' },
  { id: 't4', name: 'Jordan Wei', role: 'Editorial Lead', bio: 'Heads up the content and brand voice work.', initials: 'JW', tone: '#7a55ff' },
];

const DEFAULT_CONTENT: SiteContent = {
  hero: {
    badge: 'Available for new projects',
    headline: 'One team for',
    rotatingWords: ['Web Development', 'Marketing', 'Startup Launch', 'Operations', 'Content'],
    sub: 'Design, build, and grow — without juggling agencies. We handle the whole thing.',
    primaryCta: 'Start a project',
    primaryCtaHref: '/contact',
    secondaryCta: 'See our work',
    secondaryCtaHref: '#services',
    stats: [
      { id: 's1', num: '20+', label: 'Projects shipped' },
      { id: 's2', num: '8', label: 'Active clients' },
      { id: 's3', num: '4.9', label: 'Client rating' },
      { id: 's4', num: '2026', label: 'Since' },
    ],
  },
  cta: {
    eyebrow: 'Open for new projects',
    title: 'Got an idea?',
    accentTitle: "Let's talk.",
    sub: 'A quick 30-minute call. No pitch, just your project.',
    primary: 'Book a call',
    primaryHref: '/contact',
    secondary: 'hello@zenova.bd',
    secondaryHref: 'mailto:hello@zenova.bd',
  },
  faqs: [
    { id: 'f1', q: 'How are you different from an agency?', a: 'One team handles design, build, and growth. No handoffs between vendors — same people from start to finish.' },
    { id: 'f2', q: 'How long is a typical project?', a: '6 to 10 weeks for a build. Many clients stay on monthly for ongoing growth work.' },
    { id: 'f3', q: 'Do we own the code and designs?', a: 'Yes. Everything sits in your accounts from day one — your GitHub, your Figma, your domain.' },
    { id: 'f4', q: 'How does pricing work?', a: 'Flat fee per phase for builds. Flat monthly fee for ongoing work. No hourly billing.' },
    { id: 'f5', q: 'Can you work with our team?', a: 'Yes. We often plug into existing teams and follow your conventions.' },
    { id: 'f6', q: 'How soon can we start?', a: 'Usually 1 to 2 weeks after our intro call.' },
  ],
  testimonials: [
    { id: 'q1', quote: 'They replaced three of our vendors. One team, one channel, one invoice.', name: 'Maya Okafor', role: 'COO, Northwind', tone: '#3a5bff' },
    { id: 'q2', quote: 'A working prototype in eleven days. Best momentum we’ve had in years.', name: 'Daniel Reyes', role: 'CEO, Stellar', tone: '#6d4cff' },
    { id: 'q3', quote: 'We came in for a site. We left with a full growth plan and real pipeline.', name: 'Priya Nair', role: 'Head of Growth, Aperture', tone: '#a855f7' },
    { id: 'q4', quote: 'The cleanest handoff we’ve ever seen. Our team picked it up the next morning.', name: 'Jonas Weber', role: 'CTO, Cobalt', tone: '#5b6cff' },
    { id: 'q5', quote: 'Traffic up 4x. CAC down a third. They run growth like a product team.', name: 'Aisha Mensah', role: 'Founder, Mosaic', tone: '#7a55ff' },
    { id: 'q6', quote: 'Most agencies sell a deck. Zenova built us a system and taught us how to run it.', name: 'Leo Castelli', role: 'COO, Verge', tone: '#9a4dff' },
  ],
  marquee: [
    { id: 'm1', label: 'Branding' },
    { id: 'm2', label: 'Web Design' },
    { id: 'm3', label: 'SEO' },
    { id: 'm4', label: 'Paid Ads' },
    { id: 'm5', label: 'Email' },
    { id: 'm6', label: 'Content' },
    { id: 'm7', label: 'Strategy' },
    { id: 'm8', label: 'Operations' },
  ],
  contactEmail: 'hello@zenova.bd',
  about: {
    values: [
      { id: 'v1', icon: 'Layers', title: 'One team, start to finish', blurb: 'The people you meet on day one are the same people on day ninety. No handoffs.', hue: '#3a5bff' },
      { id: 'v2', icon: 'Spark', title: 'Build, then talk', blurb: 'We ship working things, not decks about working things.', hue: '#6d4cff' },
      { id: 'v3', icon: 'Compass', title: 'Outcomes over output', blurb: 'Every project ends with one number we agreed to move. We share it either way.', hue: '#a855f7' },
    ],
    roles: [
      { id: 'r1', title: 'Senior product designer', location: 'Remote', href: '' },
      { id: 'r2', title: 'Senior engineer', location: 'Remote', href: '' },
      { id: 'r3', title: 'Growth strategist', location: 'Remote', href: '' },
    ],
    timeline: [
      { id: 'tl1', year: '2019', what: 'Mira and Tobias start Zenova.' },
      { id: 'tl2', year: '2021', what: 'First long-term client. Growth becomes a core practice.' },
      { id: 'tl3', year: '2023', what: 'Content and operations teams join.' },
      { id: 'tl4', year: '2026', what: 'Working with 8 active clients across 3 continents.' },
    ],
  },
};

const DEFAULT_BRAND: BrandSettings = {
  studioName: 'Zenova',
  tagline: 'Design, build, and grow — one team.',
  contactEmail: 'hello@zenova.bd',
  careersEmail: 'careers@zenova.bd',
  phone: '+1 (555) 123-4567',
  address: '123 Atlantic Ave, Brooklyn, NY 11201',
  locations: [
    { id: 'l1', city: 'Brooklyn, NY', tz: 'EST', detail: 'Headquarters' },
    { id: 'l2', city: 'Berlin', tz: 'CET', detail: 'European hub' },
    { id: 'l3', city: 'Remote', tz: 'Global', detail: 'We hire worldwide' },
  ],
};

interface StoreOptions<T> {
  defaults: T;
  /** Path used to PUT the full value back. Collection stores use the same path for GET. */
  resourcePath: string;
  cacheKey: string;
}

class Store<T> {
  private value: T;
  private listeners = new Set<Listener>();
  private _status: Status = 'idle';
  private _error: string | null = null;
  private readonly defaults: T;
  private readonly resourcePath: string;
  private readonly cacheKey: string;

  constructor(opts: StoreOptions<T>) {
    this.defaults = opts.defaults;
    this.resourcePath = opts.resourcePath;
    this.cacheKey = opts.cacheKey;
    this.value = this.loadCache() ?? opts.defaults;
  }

  private loadCache(): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(this.cacheKey);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private saveCache() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(this.cacheKey, JSON.stringify(this.value));
    } catch {
      /* ignore (quota, private mode) */
    }
  }

  get(): T {
    return this.value;
  }

  get status(): Status {
    return this._status;
  }

  get error(): string | null {
    return this._error;
  }

  setLocal(updater: T | ((prev: T) => T)) {
    this.value =
      typeof updater === 'function' ? (updater as (p: T) => T)(this.value) : updater;
    this.saveCache();
    this.emit();
  }

  /**
   * Optimistically update locally, then persist via PUT. On error the value
   * rolls back to the previous snapshot and the error is rethrown.
   */
  async set(updater: T | ((prev: T) => T)): Promise<T> {
    const prev = this.value;
    const next =
      typeof updater === 'function' ? (updater as (p: T) => T)(this.value) : updater;
    this.value = next;
    this.saveCache();
    this.emit();
    try {
      const saved = await api<T>(this.resourcePath, {
        method: 'PUT',
        body: next,
        auth: true,
      });
      if (saved && saved !== this.value) {
        this.value = saved;
        this.saveCache();
        this.emit();
      }
      this._error = null;
      return this.value;
    } catch (err) {
      this.value = prev;
      this.saveCache();
      this._error = err instanceof Error ? err.message : 'Save failed.';
      this.emit();
      throw err;
    }
  }

  /** Persist the defaults to the server. Local-only via setLocal() for offline-style resets. */
  async reset(): Promise<T> {
    return this.set(this.defaults);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getDefaults(): T {
    return this.defaults;
  }

  hydrateFrom(value: T) {
    this.value = value;
    this._status = 'ready';
    this._error = null;
    this.saveCache();
    this.emit();
  }

  markLoading() {
    this._status = 'loading';
    this.emit();
  }

  markError(message: string) {
    this._status = 'error';
    this._error = message;
    this.emit();
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }
}

export const servicesStore = new Store<ServiceDetail[]>({
  defaults: DEFAULT_SERVICES,
  resourcePath: '/admin/services',
  cacheKey: 'zenova.cache.services',
});
export const projectsStore = new Store<ProjectDetail[]>({
  defaults: DEFAULT_PROJECTS,
  resourcePath: '/admin/projects',
  cacheKey: 'zenova.cache.projects',
});
export const teamStore = new Store<TeamMember[]>({
  defaults: DEFAULT_TEAM,
  resourcePath: '/admin/team',
  cacheKey: 'zenova.cache.team',
});
export const contentStore = new Store<SiteContent>({
  defaults: DEFAULT_CONTENT,
  resourcePath: '/admin/content',
  cacheKey: 'zenova.cache.content',
});
export const brandStore = new Store<BrandSettings>({
  defaults: DEFAULT_BRAND,
  resourcePath: '/admin/brand',
  cacheKey: 'zenova.cache.brand',
});

interface SiteBundle {
  services: ServiceDetail[];
  projects: ProjectDetail[];
  team: TeamMember[];
  content: SiteContent;
  brand: BrandSettings;
}

let hydrationPromise: Promise<void> | null = null;

/** Public site bootstrap. Idempotent — safe to call multiple times. */
export function hydrateSite(force = false): Promise<void> {
  if (!force && hydrationPromise) return hydrationPromise;
  servicesStore.markLoading();
  projectsStore.markLoading();
  teamStore.markLoading();
  contentStore.markLoading();
  brandStore.markLoading();

  hydrationPromise = (async () => {
    try {
      const bundle = await api<SiteBundle>('/public/site');
      servicesStore.hydrateFrom(bundle.services);
      projectsStore.hydrateFrom(bundle.projects);
      teamStore.hydrateFrom(bundle.team);
      contentStore.hydrateFrom(bundle.content);
      brandStore.hydrateFrom(bundle.brand);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load site data.';
      servicesStore.markError(message);
      projectsStore.markError(message);
      teamStore.markError(message);
      contentStore.markError(message);
      brandStore.markError(message);
      // Don't rethrow — the UI falls back to cached/default data.
    } finally {
      hydrationPromise = null;
    }
  })();
  return hydrationPromise;
}

function useStore<T>(store: Store<T>) {
  const [, force] = useReducer((x: number) => x + 1, 0);
  const ref = useRef(store);
  useEffect(() => ref.current.subscribe(force), []);
  return [
    store.get(),
    (v: T | ((prev: T) => T)) => store.set(v),
    { status: store.status, error: store.error },
  ] as const;
}

export function useServices() {
  return useStore(servicesStore);
}
export function useProjects() {
  return useStore(projectsStore);
}
export function useTeam() {
  return useStore(teamStore);
}
export function useContent() {
  return useStore(contentStore);
}
export function useBrand() {
  return useStore(brandStore);
}

export function findServiceLive(slug: string): ServiceDetail | undefined {
  return servicesStore.get().find((s) => s.slug === slug);
}

export function findProjectLive(slug: string): ProjectDetail | undefined {
  return projectsStore.get().find((p) => p.slug === slug);
}

export async function resetAll(): Promise<void> {
  await Promise.all([
    servicesStore.reset(),
    projectsStore.reset(),
    teamStore.reset(),
    contentStore.reset(),
    brandStore.reset(),
  ]);
}

// ---------------------------------------------------------------------------
// Partial updates (PATCH)
//
// `set()` PUTs the entire document and is right for bulk-array edits, JSON
// import and the "reset to defaults" flow. For everything else — editing a
// single field, renaming a slug, toggling a flag — these helpers send only
// the changed fields over the wire and merge the server response back into
// the local store.
//
// All five do the same dance:
//   1. Snapshot the current value.
//   2. Optimistically apply the partial locally so the UI updates instantly.
//   3. PATCH the resource with just the partial.
//   4. On success, write the server's canonical response into the store.
//   5. On error, restore the snapshot and rethrow so callers can toast.
// ---------------------------------------------------------------------------

export async function patchBrand(partial: Partial<BrandSettings>): Promise<BrandSettings> {
  const prev = brandStore.get();
  brandStore.setLocal({ ...prev, ...partial });
  try {
    const saved = await api<BrandSettings>('/admin/brand', {
      method: 'PATCH',
      body: partial,
      auth: true,
    });
    brandStore.setLocal(saved);
    return saved;
  } catch (err) {
    brandStore.setLocal(prev);
    throw err;
  }
}

export async function patchContent(partial: Partial<SiteContent>): Promise<SiteContent> {
  const prev = contentStore.get();
  contentStore.setLocal({ ...prev, ...partial });
  try {
    const saved = await api<SiteContent>('/admin/content', {
      method: 'PATCH',
      body: partial,
      auth: true,
    });
    contentStore.setLocal(saved);
    return saved;
  } catch (err) {
    contentStore.setLocal(prev);
    throw err;
  }
}

export async function patchService(
  slug: string,
  partial: Partial<ServiceDetail>,
): Promise<ServiceDetail> {
  const prev = servicesStore.get();
  const idx = prev.findIndex((s) => s.slug === slug);
  if (idx < 0) throw new Error(`Service '${slug}' is not in the local store.`);
  const optimistic = prev.slice();
  optimistic[idx] = { ...optimistic[idx], ...partial };
  servicesStore.setLocal(optimistic);
  try {
    const saved = await api<ServiceDetail>(
      `/admin/services/${encodeURIComponent(slug)}`,
      { method: 'PATCH', body: partial, auth: true },
    );
    const next = servicesStore.get().slice();
    const j = next.findIndex((s) => s.slug === slug || s.slug === saved.slug);
    if (j >= 0) next[j] = saved;
    else next.push(saved);
    servicesStore.setLocal(next);
    return saved;
  } catch (err) {
    servicesStore.setLocal(prev);
    throw err;
  }
}

export async function patchProject(
  slug: string,
  partial: Partial<ProjectDetail>,
): Promise<ProjectDetail> {
  const prev = projectsStore.get();
  const idx = prev.findIndex((p) => p.slug === slug);
  if (idx < 0) throw new Error(`Project '${slug}' is not in the local store.`);
  const optimistic = prev.slice();
  optimistic[idx] = { ...optimistic[idx], ...partial };
  projectsStore.setLocal(optimistic);
  try {
    const saved = await api<ProjectDetail>(
      `/admin/projects/${encodeURIComponent(slug)}`,
      { method: 'PATCH', body: partial, auth: true },
    );
    const next = projectsStore.get().slice();
    const j = next.findIndex((p) => p.slug === slug || p.slug === saved.slug);
    if (j >= 0) next[j] = saved;
    else next.push(saved);
    projectsStore.setLocal(next);
    return saved;
  } catch (err) {
    projectsStore.setLocal(prev);
    throw err;
  }
}

export async function patchTeamMember(
  memberId: string,
  partial: Partial<TeamMember>,
): Promise<TeamMember> {
  const prev = teamStore.get();
  const idx = prev.findIndex((m) => m.id === memberId);
  if (idx < 0) throw new Error(`Team member '${memberId}' is not in the local store.`);
  const optimistic = prev.slice();
  optimistic[idx] = { ...optimistic[idx], ...partial };
  teamStore.setLocal(optimistic);
  try {
    const saved = await api<TeamMember>(
      `/admin/team/${encodeURIComponent(memberId)}`,
      { method: 'PATCH', body: partial, auth: true },
    );
    const next = teamStore.get().slice();
    const j = next.findIndex((m) => m.id === memberId || m.id === saved.id);
    if (j >= 0) next[j] = saved;
    else next.push(saved);
    teamStore.setLocal(next);
    return saved;
  } catch (err) {
    teamStore.setLocal(prev);
    throw err;
  }
}

export function exportAll() {
  return {
    services: servicesStore.get(),
    projects: projectsStore.get(),
    team: teamStore.get(),
    content: contentStore.get(),
    brand: brandStore.get(),
  };
}

export function importAll(data: ReturnType<typeof exportAll>) {
  if (data.services) servicesStore.setLocal(data.services);
  if (data.projects) projectsStore.setLocal(data.projects);
  if (data.team) teamStore.setLocal(data.team);
  if (data.content) contentStore.setLocal(data.content);
  if (data.brand) brandStore.setLocal(data.brand);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginResult {
  user: AdminUser;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await sessionLogin(email, password);
  return { user };
}

export function logout(): void {
  sessionLogout();
}

/** True only when an admin is signed in (the admin shell is admin-only). */
export function isAuthed(): boolean {
  return hasRole('admin');
}

/** Re-export so legacy imports keep working. */
export type { AdminUser };
export { type SessionUser, type Role } from '@/lib/session';

export function currentUser(): AdminUser | null {
  return getStoredUser();
}

export async function refreshCurrentUser(): Promise<AdminUser | null> {
  try {
    const user = await api<AdminUser>('/auth/me', { auth: true });
    return user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearTokens();
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Image uploads (Cloudflare R2)
// ---------------------------------------------------------------------------

export interface UploadedImage {
  url: string;
  key: string;
  name: string;
  content_type: string;
  size: number;
  renamed: boolean;
}

export interface UploadListItem {
  url: string;
  key: string;
  name: string;
  content_type: string;
  size: number;
  uploaded_at: string | null;
}

export interface UploadListResponse {
  items: UploadListItem[];
  count: number;
}

/**
 * Upload an image to R2. Without ``force`` the server rejects a same-named
 * upload with ``409 duplicate_upload`` (and returns the existing URL/key in
 * ``error.details``). Pass ``force: true`` to instead store the file with a
 * ``(1)`` / ``(2)`` suffix.
 */
export async function uploadImage(
  file: File,
  opts: { prefix?: string; force?: boolean } = {},
): Promise<UploadedImage> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('prefix', opts.prefix ?? 'projects');
  if (opts.force) fd.append('force', 'true');
  return api<UploadedImage>('/admin/uploads/image', {
    method: 'POST',
    formData: fd,
    auth: true,
  });
}

export async function listUploads(prefix?: string): Promise<UploadListResponse> {
  const q = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
  return api<UploadListResponse>(`/admin/uploads${q}`, { auth: true });
}

export async function deleteUpload(key: string): Promise<void> {
  await api<void>(`/admin/uploads/image?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
    auth: true,
  });
}
