/**
 * Shared client-project store.
 *
 * Hits the backend for source-of-truth (``/client/me/project`` for clients,
 * ``/team/project`` for the team). The local snapshot is cached in
 * localStorage so the dashboard renders instantly on reload and so a save in
 * one tab broadcasts to other open tabs via the ``storage`` event.
 */

import { useEffect, useReducer } from 'react';
import { api } from './api';
import { hasRole } from './session';

const STORAGE_KEY = 'zenova.project.snapshot.v1';

export interface ProjectPhase {
  id: string;
  n: string;
  title: string;
  status: 'done' | 'active' | 'next';
  pct: number;
  startedOn: string | null;
  endedOn: string | null;
  deliverables: Array<{ id: string; label: string; done: boolean }>;
}

export interface ProjectActivity {
  id: string;
  when: string;
  whoName: string;
  whoInitial: string;
  whoTone: string;
  what: string;
  kind: 'design' | 'build' | 'copy' | 'growth' | 'other';
}

export interface ProjectStat {
  id: string;
  label: string;
  value: string;
}

export interface ProjectSnapshot {
  client: string;
  projectName: string;
  slug: string;
  status: 'active' | 'paused' | 'wrapped';
  startedOn: string;
  targetOn: string;
  overallPct: number;
  currentPhaseId: string;
  stats: ProjectStat[];
  phases: ProjectPhase[];
  activity: ProjectActivity[];
  team: Array<{ id: string; name: string; role: string; initial: string; tone: string }>;
  nextMilestone: { title: string; date: string; note: string };
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

export const DEFAULT_PROJECT: ProjectSnapshot = {
  client: 'Northwind',
  projectName: 'Brand refresh + new marketing site',
  slug: 'northwind-2026',
  status: 'active',
  startedOn: '2026-04-08',
  targetOn: '2026-06-03',
  overallPct: 62,
  currentPhaseId: 'p3',
  stats: [
    { id: 's1', label: 'Phase', value: 'Build' },
    { id: 's2', label: 'On-time confidence', value: '94%' },
    { id: 's3', label: 'Items shipped', value: '12' },
    { id: 's4', label: 'Open items', value: '5' },
  ],
  phases: [
    {
      id: 'p1',
      n: '01',
      title: 'Discover',
      status: 'done',
      pct: 100,
      startedOn: '2026-04-08',
      endedOn: '2026-04-15',
      deliverables: [
        { id: 'd1', label: 'Goals workshop', done: true },
        { id: 'd2', label: 'Project plan', done: true },
        { id: 'd3', label: 'Timeline', done: true },
        { id: 'd4', label: 'Success metrics', done: true },
      ],
    },
    {
      id: 'p2',
      n: '02',
      title: 'Design',
      status: 'done',
      pct: 100,
      startedOn: '2026-04-15',
      endedOn: '2026-05-06',
      deliverables: [
        { id: 'd5', label: 'Brand identity', done: true },
        { id: 'd6', label: 'Page designs', done: true },
        { id: 'd7', label: 'Prototype', done: true },
        { id: 'd8', label: 'Design review', done: true },
      ],
    },
    {
      id: 'p3',
      n: '03',
      title: 'Build',
      status: 'active',
      pct: 62,
      startedOn: '2026-05-06',
      endedOn: null,
      deliverables: [
        { id: 'd9', label: 'Working website', done: true },
        { id: 'd10', label: 'CMS setup', done: true },
        { id: 'd11', label: 'Speed optimization', done: false },
        { id: 'd12', label: 'Handoff docs', done: false },
      ],
    },
    {
      id: 'p4',
      n: '04',
      title: 'Grow',
      status: 'next',
      pct: 0,
      startedOn: null,
      endedOn: null,
      deliverables: [
        { id: 'd13', label: 'Ad campaigns', done: false },
        { id: 'd14', label: 'SEO & content', done: false },
        { id: 'd15', label: 'Email automation', done: false },
        { id: 'd16', label: 'Monthly report', done: false },
      ],
    },
  ],
  activity: [
    { id: 'a1', when: '2026-05-23T13:46:00Z', whoName: 'Mira', whoInitial: 'M', whoTone: '#ff813a', what: 'pushed v0.9 of the homepage hero', kind: 'design' },
    { id: 'a2', when: '2026-05-23T12:30:00Z', whoName: 'Tobias', whoInitial: 'T', whoTone: '#e06820', what: 'shipped the CMS schema for case studies', kind: 'build' },
    { id: 'a3', when: '2026-05-23T10:10:00Z', whoName: 'Suri', whoInitial: 'S', whoTone: '#ff9a5c', what: 'queued 4 emails in the launch sequence', kind: 'growth' },
    { id: 'a4', when: '2026-05-22T17:02:00Z', whoName: 'Jordan', whoInitial: 'J', whoTone: '#cc6622', what: 'wrote the about-page copy (draft 2)', kind: 'copy' },
    { id: 'a5', when: '2026-05-22T14:18:00Z', whoName: 'Tobias', whoInitial: 'T', whoTone: '#e06820', what: 'fixed a regression in the case-study filter', kind: 'build' },
    { id: 'a6', when: '2026-05-21T19:00:00Z', whoName: 'Mira', whoInitial: 'M', whoTone: '#ff813a', what: 'shared 3 hero variants for review', kind: 'design' },
  ],
  team: [
    { id: 't1', name: 'Mira Aldana', role: 'Design lead', initial: 'M', tone: '#ff813a' },
    { id: 't2', name: 'Tobias Reinhardt', role: 'Engineering lead', initial: 'T', tone: '#e06820' },
    { id: 't3', name: 'Suri Patel', role: 'Growth', initial: 'S', tone: '#ff9a5c' },
  ],
  nextMilestone: {
    title: 'Speed-pass review',
    date: '2026-05-28',
    note: 'Mira + Tobias walk through the build perf wins. Recording shared after.',
  },
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();
let snapshot: ProjectSnapshot = load();

function load(): ProjectSnapshot {
  if (typeof window === 'undefined') return DEFAULT_PROJECT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROJECT;
    const parsed = JSON.parse(raw) as ProjectSnapshot;
    // Defensive: fill missing arrays / fields from defaults so a stale cache
    // doesn't blow up the UI when we add new fields.
    return {
      ...DEFAULT_PROJECT,
      ...parsed,
      stats: parsed.stats ?? DEFAULT_PROJECT.stats,
      phases: parsed.phases ?? DEFAULT_PROJECT.phases,
      activity: parsed.activity ?? DEFAULT_PROJECT.activity,
      team: parsed.team ?? DEFAULT_PROJECT.team,
      nextMilestone: parsed.nextMilestone ?? DEFAULT_PROJECT.nextMilestone,
    };
  } catch {
    return DEFAULT_PROJECT;
  }
}

function save() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore (quota / private mode) */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  // Cross-tab sync: when one tab saves, every open tab re-reads.
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      snapshot = JSON.parse(e.newValue) as ProjectSnapshot;
      emit();
    } catch {
      /* ignore */
    }
  });
}

export function getProject(): ProjectSnapshot {
  return snapshot;
}

function applyLocal(next: ProjectSnapshot) {
  snapshot = next;
  save();
  emit();
}

/**
 * Persist via PUT /team/project (team or admin only). The promise resolves
 * with the server-validated snapshot, which is also written into the local
 * cache so other open tabs see the change on the next storage event.
 */
export async function setProject(
  next: ProjectSnapshot | ((prev: ProjectSnapshot) => ProjectSnapshot),
): Promise<ProjectSnapshot> {
  const value = typeof next === 'function' ? next(snapshot) : next;
  const saved = await api<ProjectSnapshot>('/team/project', {
    method: 'PUT',
    body: value,
    auth: true,
  });
  applyLocal(saved);
  return saved;
}

/** Restore the seed snapshot. Convenience for the demo Reset button. */
export async function resetProject(): Promise<ProjectSnapshot> {
  return setProject(DEFAULT_PROJECT);
}

/**
 * Fetch from the backend and update the local cache. Picks the endpoint based
 * on the caller's role — team/admin reads ``/team/project`` so they get the
 * mutable snapshot, clients read ``/client/me/project``.
 */
export async function fetchProjectSnapshot(): Promise<ProjectSnapshot> {
  const path = hasRole('team', 'admin') ? '/team/project' : '/client/me/project';
  const data = await api<ProjectSnapshot>(path, { auth: true });
  applyLocal(data);
  return data;
}

export function useProjectSnapshot(): ProjectSnapshot {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const l: Listener = () => force();
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return snapshot;
}
