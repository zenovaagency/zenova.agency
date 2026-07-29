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

import { useSyncExternalStore } from 'react';
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
import { JOBS as DEFAULT_JOBS, type JobDetail } from '@/data/jobs';
import {
  DEFAULT_BRAND,
  DEFAULT_CONTENT,
  DEFAULT_TEAM,
  type BrandSettings,
  type SiteContent,
  type TeamMember,
} from '@/data/site-content';

import { resolveSiteBundle, type SiteBundle } from '@/lib/siteBundle';

// The default content and its types live in a plain data module so that server
// code with no React in it — the /llms.txt route handlers, the sitemap — can
// read them without importing this client-only store. Re-exported here because
// a great many components already import them from '@/admin/store'.
export * from '@/data/site-content';
export type { SiteBundle } from '@/lib/siteBundle';
export type { PricingPlan, PricingService } from '@/data/pricing';

type Listener = () => void;
type Status = 'idle' | 'loading' | 'ready' | 'error';


interface StoreOptions<T> {
  defaults: T;
  /** Path used to PUT the full value back. Collection stores use the same path for GET. */
  resourcePath: string;
  cacheKey: string;
}

/** Immutable view handed to useSyncExternalStore. Identity changes only on emit. */
export interface StoreSnapshot<T> {
  value: T;
  status: Status;
  error: string | null;
}

class Store<T> {
  private value: T;
  private listeners = new Set<Listener>();
  private _status: Status = 'idle';
  private _error: string | null = null;
  private readonly defaults: T;
  private readonly resourcePath: string;
  private readonly cacheKey: string;
  /** Cached so getSnapshot() is referentially stable between emits. */
  private snapshot: StoreSnapshot<T>;
  /**
   * Deliberately the SAME OBJECT as the initial snapshot, not an equal copy.
   * useSyncExternalStore compares the two with Object.is: an equal-but-distinct
   * object still reads as "changed", so React schedules an update the instant
   * hydration starts. That update lands while the lazy route chunks are still
   * hydrating their Suspense boundaries, which React reports as error #421 and
   * recovers from by throwing away the server HTML for those boundaries — the
   * prerendered markup would be discarded on every single page load.
   */
  private serverSnapshot: StoreSnapshot<T>;
  /** localStorage value, held back until after hydration. See applyCache(). */
  private pendingCache: T | null;
  /** True once seed() has run — see seed() and applyCache(). */
  private seeded = false;

  constructor(opts: StoreOptions<T>) {
    this.defaults = opts.defaults;
    this.resourcePath = opts.resourcePath;
    this.cacheKey = opts.cacheKey;
    // Start on the defaults — the exact value the prerenderer rendered with,
    // since loadCache() returns null without `window`. Anything else would make
    // the first client render disagree with the shipped HTML.
    this.value = opts.defaults;
    this.pendingCache = this.loadCache();
    this.snapshot = { value: this.value, status: this._status, error: this._error };
    this.serverSnapshot = this.snapshot;
  }

  /**
   * Promote the cached value to the live one. Kept out of the constructor so
   * hydration can match the prerendered HTML first; call it once the tree is
   * hydrated (App does, inside startTransition) so the resulting re-render
   * cannot interrupt a Suspense boundary. hydrateSite() then supersedes this
   * with fresh API data a moment later.
   */
  applyCache(): void {
    const cached = this.pendingCache;
    this.pendingCache = null;
    if (cached === null) return;
    // A seeded store already holds live CMS data that the server rendered the
    // HTML from. localStorage is by definition older than that, so promoting it
    // would replace correct content with stale content and cause a visible
    // flicker on every page load.
    if (this.seeded) return;
    this.value = cached;
    this.emit();
  }

  /**
   * Install the value the server rendered this page with, before React's first
   * render on either side.
   *
   * This is what lets admin-edited content reach crawlers. Without it the server
   * renders the hardcoded src/data defaults and the live content only appears
   * after hydrateSite() resolves in the browser — so the HTML that search
   * engines and AI crawlers actually read was always the fallback copy.
   *
   * Both snapshots are replaced, and with the SAME object: getSnapshot() feeds
   * the server render, getServerSnapshot() feeds the client's hydration pass,
   * and useSyncExternalStore compares them with Object.is. Two equal-but-
   * distinct objects would read as "changed" and schedule an update the instant
   * hydration begins — React error #421, which it recovers from by discarding
   * the server HTML. Same object, no update, markup preserved.
   *
   * Idempotent: the client seeds once from the serialised bundle, and repeat
   * calls (React strict-mode double render, a re-render of the provider) must
   * not disturb a store that hydrateSite() has since updated.
   */
  isSeeded(): boolean {
    return this.seeded;
  }

  seed(value: T): void {
    if (this.seeded) return;
    this.seeded = true;
    this.value = value;
    this._status = 'ready';
    this._error = null;
    this.snapshot = { value, status: 'ready', error: null };
    this.serverSnapshot = this.snapshot;
  }

  // Bound so they keep a stable identity across renders — useSyncExternalStore
  // resubscribes whenever `subscribe` changes identity.
  readonly subscribeBound = (listener: Listener): (() => void) => this.subscribe(listener);
  readonly getSnapshot = (): StoreSnapshot<T> => this.snapshot;
  readonly getServerSnapshot = (): StoreSnapshot<T> => this.serverSnapshot;

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
    // Rebuild first: subscribers read getSnapshot() synchronously on notify.
    this.snapshot = { value: this.value, status: this._status, error: this._error };
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
export const jobsStore = new Store<JobDetail[]>({
  defaults: DEFAULT_JOBS,
  resourcePath: '/admin/jobs',
  cacheKey: 'zenova.cache.jobs',
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

const SITE_STORES = [
  servicesStore,
  projectsStore,
  jobsStore,
  teamStore,
  contentStore,
  brandStore,
] as const;

/**
 * Promote every store's localStorage cache to its live value. Must run after
 * hydration — see Store.applyCache() — and callers should wrap it in
 * startTransition so the re-render cannot tear a hydrating Suspense boundary.
 */
export function applyCachedSite(): void {
  for (const store of SITE_STORES) store.applyCache();
}

/**
 * Seed every public store from a `/public/site` bundle fetched on the server.
 *
 * Called from app/_components/SiteStoreProvider.tsx during render — on the
 * server with the freshly fetched bundle, and in the browser with the same
 * bundle serialised into the HTML. Both sides therefore render identical markup
 * from identical data, which is the only way the seeding can be invisible to
 * hydration.
 *
 * A partial bundle is tolerated field by field: an older backend that does not
 * return `jobs` leaves that store on its defaults rather than wiping it.
 */
export function seedSite(bundle: Partial<SiteBundle> | null | undefined): void {
  if (!bundle) return;
  // resolveSiteBundle is shared with app/_lib/detail-routes.ts, which decides
  // which detail-page slugs exist. Both must apply the same defaults or a route
  // will advertise a slug whose page renders nothing — see the note there.
  const site = resolveSiteBundle(bundle);
  servicesStore.seed(site.services);
  projectsStore.seed(site.projects);
  jobsStore.seed(site.jobs);
  teamStore.seed(site.team);
  contentStore.seed(site.content);
  brandStore.seed(site.brand);
}

/**
 * True once the server has seeded the public stores for this page.
 *
 * The browser uses this to skip hydrateSite(): the server fetched
 * `/public/site` no more than CONTENT_REVALIDATE seconds ago and rendered the
 * HTML from it, so refetching the same bundle on every page load would spend a
 * request on the critical path to arrive at the data already on screen — and
 * hydrateSite() assigns the raw payload without the defaults merge above.
 */
export function isSiteSeeded(): boolean {
  return contentStore.isSeeded();
}

let hydrationPromise: Promise<void> | null = null;

/** Public site bootstrap. Idempotent — safe to call multiple times. */
export function hydrateSite(force = false): Promise<void> {
  if (!force && hydrationPromise) return hydrationPromise;
  servicesStore.markLoading();
  projectsStore.markLoading();
  jobsStore.markLoading();
  teamStore.markLoading();
  contentStore.markLoading();
  brandStore.markLoading();

  hydrationPromise = (async () => {
    try {
      const bundle = await api<SiteBundle>('/public/site');
      servicesStore.hydrateFrom(bundle.services);
      projectsStore.hydrateFrom(bundle.projects);
      // Guard: older backends may not include jobs in the bundle yet — keep
      // the cached/default value in that case rather than wiping it.
      if (bundle.jobs) jobsStore.hydrateFrom(bundle.jobs);
      teamStore.hydrateFrom(bundle.team);
      contentStore.hydrateFrom(bundle.content);
      brandStore.hydrateFrom(bundle.brand);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load site data.';
      servicesStore.markError(message);
      projectsStore.markError(message);
      jobsStore.markError(message);
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
  const snap = useSyncExternalStore(
    store.subscribeBound,
    store.getSnapshot,
    // Hydration snapshot — see Store.serverSnapshot.
    store.getServerSnapshot,
  );
  return [
    snap.value,
    (v: T | ((prev: T) => T)) => store.set(v),
    { status: snap.status, error: snap.error },
  ] as const;
}

export function useServices() {
  return useStore(servicesStore);
}
export function useProjects() {
  return useStore(projectsStore);
}
export function useJobs() {
  return useStore(jobsStore);
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

export function findJobLive(slug: string): JobDetail | undefined {
  return jobsStore.get().find((j) => j.slug === slug);
}

export async function resetAll(): Promise<void> {
  await Promise.all([
    servicesStore.reset(),
    projectsStore.reset(),
    jobsStore.reset(),
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

export async function createService(service: ServiceDetail): Promise<ServiceDetail> {
  const prev = servicesStore.get();
  if (prev.some((s) => s.slug === service.slug)) {
    throw new Error(`Service '${service.slug}' already exists.`);
  }
  const optimistic = [...prev, service];
  servicesStore.setLocal(optimistic);
  try {
    const saved = await api<ServiceDetail>('/admin/services', {
      method: 'POST',
      body: service,
      auth: true,
    });
    const next = servicesStore.get().slice();
    const j = next.findIndex((s) => s.slug === saved.slug);
    if (j >= 0) next[j] = saved;
    else next.push(saved);
    servicesStore.setLocal(next);
    return saved;
  } catch (err) {
    servicesStore.setLocal(prev);
    throw err;
  }
}

export async function deleteService(slug: string): Promise<void> {
  const prev = servicesStore.get();
  const optimistic = prev.filter((s) => s.slug !== slug);
  servicesStore.setLocal(optimistic);
  try {
    await api<void>(`/admin/services/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      auth: true,
    });
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

export async function patchJob(
  slug: string,
  partial: Partial<JobDetail>,
): Promise<JobDetail> {
  const prev = jobsStore.get();
  const idx = prev.findIndex((j) => j.slug === slug);
  if (idx < 0) throw new Error(`Job '${slug}' is not in the local store.`);
  const optimistic = prev.slice();
  optimistic[idx] = { ...optimistic[idx], ...partial };
  jobsStore.setLocal(optimistic);
  try {
    const saved = await api<JobDetail>(
      `/admin/jobs/${encodeURIComponent(slug)}`,
      { method: 'PATCH', body: partial, auth: true },
    );
    const next = jobsStore.get().slice();
    const j = next.findIndex((job) => job.slug === slug || job.slug === saved.slug);
    if (j >= 0) next[j] = saved;
    else next.push(saved);
    jobsStore.setLocal(next);
    return saved;
  } catch (err) {
    jobsStore.setLocal(prev);
    throw err;
  }
}

export async function createJob(job: JobDetail): Promise<JobDetail> {
  const prev = jobsStore.get();
  if (prev.some((j) => j.slug === job.slug)) {
    throw new Error(`Job '${job.slug}' already exists.`);
  }
  const optimistic = [...prev, job];
  jobsStore.setLocal(optimistic);
  try {
    const saved = await api<JobDetail>('/admin/jobs', {
      method: 'POST',
      body: job,
      auth: true,
    });
    const next = jobsStore.get().slice();
    const j = next.findIndex((item) => item.slug === saved.slug);
    if (j >= 0) next[j] = saved;
    else next.push(saved);
    jobsStore.setLocal(next);
    return saved;
  } catch (err) {
    jobsStore.setLocal(prev);
    throw err;
  }
}

export async function deleteJob(slug: string): Promise<void> {
  const prev = jobsStore.get();
  const optimistic = prev.filter((j) => j.slug !== slug);
  jobsStore.setLocal(optimistic);
  try {
    await api<void>(`/admin/jobs/${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      auth: true,
    });
  } catch (err) {
    jobsStore.setLocal(prev);
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
    jobs: jobsStore.get(),
    team: teamStore.get(),
    content: contentStore.get(),
    brand: brandStore.get(),
  };
}

export function importAll(data: ReturnType<typeof exportAll>) {
  // Only adopt the known top-level collections. A stale or foreign dump can't
  // smuggle extra top-level keys into a store that would later be PUT wholesale
  // and rejected by the backend's `extra="forbid"` schemas.
  if (!data || typeof data !== 'object') return;
  if (data.services) servicesStore.setLocal(data.services);
  if (data.projects) projectsStore.setLocal(data.projects);
  if (data.jobs) jobsStore.setLocal(data.jobs);
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

export async function uploadVideo(
  file: File,
  opts: { prefix?: string; force?: boolean } = {},
): Promise<UploadedImage> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('prefix', opts.prefix ?? 'services');
  if (opts.force) fd.append('force', 'true');
  return api<UploadedImage>('/admin/uploads/video', {
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
