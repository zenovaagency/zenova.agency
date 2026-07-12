import { Link } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import { useConfirm } from '@/admin/components/confirm-context';
import { jobsStore, useJobs } from '@/admin/store';
import type { JobDetail } from '@/data/jobs';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// eslint-disable-next-line react-refresh/only-export-components -- factory helper colocated with the admin page
export function emptyJob(): JobDetail {
  return {
    slug: 'new-role-' + Math.random().toString(36).slice(2, 6),
    title: 'Untitled role',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    summary: '',
    description: [],
    responsibilities: [],
    requirements: [],
    applyUrl: '',
    postedAt: todayISO(),
    tone: '#ff813a',
  };
}

export function JobsAdmin() {
  const [jobs] = useJobs();
  const confirm = useConfirm();

  const duplicate = (j: JobDetail) => {
    jobsStore.set([
      ...jobs,
      { ...j, slug: j.slug + '-copy', title: j.title + ' (copy)' },
    ]);
  };

  const remove = async (j: JobDetail) => {
    if (
      !(await confirm({
        title: `Delete "${j.title}"?`,
        body: 'This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      }))
    )
      return;
    jobsStore.set(jobs.filter((x) => x.slug !== j.slug));
  };

  return (
    <AdminShell
      crumbs={[{ label: 'Careers' }]}
      title="Job openings"
      sub="Open roles. Each entry lives at /careers/<slug> and is listed on /careers."
      actions={
        <>
          <button
            className="adm-btn"
            onClick={async () => {
              if (
                await confirm({
                  title: 'Reset job openings?',
                  body: 'Restores the factory defaults. Local edits will be lost.',
                  confirmLabel: 'Reset',
                  danger: true,
                })
              ) {
                jobsStore.reset();
              }
            }}
          >
            Reset
          </button>
          <Button asChild>
            <Link to="/admin/jobs/new">+ New opening</Link>
          </Button>
        </>
      }
    >
      <div className="adm-list">
        <div
          className="adm-list__row adm-list__row--head"
          style={{ gridTemplateColumns: '40px 1.4fr 0.9fr 0.9fr 0.7fr 0.7fr 200px' }}
        >
          <div></div>
          <div>Title</div>
          <div>Department</div>
          <div>Location</div>
          <div>Type</div>
          <div>Posted</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>
        {jobs.map((j) => (
          <div
            key={j.slug}
            className="adm-list__row"
            style={{ gridTemplateColumns: '40px 1.4fr 0.9fr 0.9fr 0.7fr 0.7fr 200px' }}
          >
            <div className="adm-list__cell adm-list__cell--lead">
              <span
                className="adm-badge__dot"
                style={{ background: j.tone, boxShadow: `0 0 8px ${j.tone}` }}
              />
            </div>
            <div className="adm-list__cell adm-list__cell--primary">
              <div style={{ fontSize: 14, fontWeight: 500 }}>{j.title}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>{j.summary}</div>
            </div>
            <div className="adm-list__cell" data-label="Department" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
              {j.department}
            </div>
            <div className="adm-list__cell" data-label="Location" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
              {j.location}
            </div>
            <div className="adm-list__cell" data-label="Type" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
              {j.type}
            </div>
            <div className="adm-list__cell" data-label="Posted" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
              {j.postedAt}
            </div>
            <div className="adm-list__cell adm-list__actions">
              <Link
                to={`/careers/${j.slug}`}
                target="_blank"
                rel="noreferrer"
                className="adm-btn adm-btn--sm"
              >
                Preview
              </Link>
              <Link to={`/admin/jobs/${j.slug}`} className="adm-btn adm-btn--sm">
                Edit
              </Link>
              <button className="adm-btn adm-btn--sm" onClick={() => duplicate(j)}>
                Duplicate
              </button>
              <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => remove(j)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="adm-list__row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="adm-list__cell" style={{ color: 'var(--fg-faint)', fontSize: 13 }}>
              No openings yet. Create one with “+ New opening”.
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
