import { useState } from 'react';
import { AdminShell } from '@/admin/components/AdminShell';
import { RichTextEditor } from '@/admin/components/RichTextEditor';
import { TextField, Toast } from '@/admin/components/Form';
import { Button } from '@/admin/components/Button';
import {
  DEFAULT_CONTENT,
  patchContent,
  useContent,
  type LegalContent,
  type LegalDoc,
} from '@/admin/store';

type DocKey = 'privacy' | 'terms';

/** Seed an editable doc from published content, falling back to the SEO
 *  defaults whenever the backend hasn't stored rich body copy yet. */
function seedDoc(current: LegalDoc | undefined, fallback: LegalDoc): LegalDoc {
  const hasBody = !!current?.body?.trim();
  return {
    title: current?.title || fallback.title,
    updated: current?.updated || fallback.updated,
    body: hasBody ? current!.body : fallback.body,
  };
}

function seedLegal(content: ReturnType<typeof useContent>[0]): LegalContent {
  const fb = DEFAULT_CONTENT.legal!;
  return {
    privacy: seedDoc(content.legal?.privacy, fb.privacy),
    terms: seedDoc(content.legal?.terms, fb.terms),
  };
}

export function LegalAdmin() {
  const [content] = useContent();
  const [tab, setTab] = useState<DocKey>('privacy');
  const [draft, setDraft] = useState<LegalContent>(() => seedLegal(content));
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed the draft when published content changes (save, reset, cross-tab).
  // Reconciled during render — matches the ContentAdmin pattern.
  const [syncedContent, setSyncedContent] = useState(content);
  if (syncedContent !== content) {
    setSyncedContent(content);
    setDraft(seedLegal(content));
  }

  const published = seedLegal(content);
  const dirty = JSON.stringify(draft) !== JSON.stringify(published);

  const patchDoc = (key: DocKey, delta: Partial<LegalDoc>) =>
    setDraft((d) => ({ ...d, [key]: { ...d[key], ...delta } }));

  const save = async () => {
    setSaving(true);
    try {
      await patchContent({ legal: draft });
      setToast('Saved.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const doc = draft[tab];
  const tabs: Array<{ id: DocKey; label: string }> = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms & Conditions' },
  ];

  return (
    <AdminShell
      crumbs={[{ label: 'Legal pages' }]}
      title="Legal pages"
      sub="Edit the Privacy Policy and Terms & Conditions shown at /privacy and /terms. Use the toolbar for headings, lists, links, and code. Click Save to publish."
      actions={
        <>
          {dirty && (
            <button className="adm-btn" onClick={() => setDraft(published)} disabled={saving}>
              Discard
            </button>
          )}
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </Button>
        </>
      }
    >
      <div className="adm-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`adm-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="adm-row adm-row--2">
          <TextField
            label="Document title"
            hint="Shown as the page heading."
            value={doc.title}
            onChange={(v) => patchDoc(tab, { title: v })}
          />
          <TextField
            label="Last updated line"
            hint="e.g. “Last updated: January 2026”."
            value={doc.updated}
            onChange={(v) => patchDoc(tab, { updated: v })}
          />
        </div>

        {/* key by tab so the editor DOM resets cleanly when switching docs */}
        <RichTextEditor
          key={tab}
          value={doc.body}
          onChange={(html) => patchDoc(tab, { body: html })}
          placeholder="Write the policy…"
        />
      </div>

      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}
