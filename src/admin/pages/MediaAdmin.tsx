import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import { Toast } from '@/admin/components/Form';
import { Dropdown } from '@/components/ui/inputs';
import { ApiError } from '@/lib/api';
import {
  deleteUpload,
  listUploads,
  uploadImage,
  uploadVideo,
  type UploadListItem,
} from '@/admin/store';
import { bumpLibraryCache } from '@/admin/components/ImageField';

const PREFIX_OPTIONS = ['projects', 'services', 'team', 'content', 'brand'] as const;
type Prefix = (typeof PREFIX_OPTIONS)[number];

interface PendingDuplicate {
  file: File;
  prefix: Prefix;
  existingUrl: string;
  existingKey: string;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export function MediaAdmin() {
  const [items, setItems] = useState<UploadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefix, setPrefix] = useState<Prefix>('projects');
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingDup, setPendingDup] = useState<PendingDuplicate | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showError = (e: unknown, fallback = 'Something went wrong.') =>
    setToast(e instanceof Error ? e.message : fallback);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUploads();
      setItems(res.items);
    } catch (e) {
      showError(e, 'Failed to load media library.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const doUpload = useCallback(
    async (file: File, atPrefix: Prefix, force = false) => {
      setUploading(true);
      try {
        const isVideo = file.type.startsWith('video/');
        const uploadFn = isVideo ? uploadVideo : uploadImage;
        const result = await uploadFn(file, { prefix: atPrefix, force });
        setToast(
          result.renamed
            ? `Uploaded as "${result.name}".`
            : `Uploaded "${result.name}".`,
        );
        setPendingDup(null);
        bumpLibraryCache();
        await refresh();
      } catch (e) {
        if (e instanceof ApiError && e.code === 'duplicate_upload') {
          const details = e.details as
            | { existing_key?: string; existing_url?: string }
            | undefined;
          setPendingDup({
            file,
            prefix: atPrefix,
            existingKey: details?.existing_key ?? '',
            existingUrl: details?.existing_url ?? '',
          });
        } else {
          showError(e, 'Upload failed.');
        }
      } finally {
        setUploading(false);
      }
    },
    [refresh],
  );

  const onPick = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    void doUpload(files[0], prefix, false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onConfirmDuplicate = () => {
    if (!pendingDup) return;
    void doUpload(pendingDup.file, pendingDup.prefix, true);
  };

  const onCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setToast('URL copied to clipboard.');
    } catch {
      setToast('Could not copy. Select the URL manually.');
    }
  };

  const onDelete = async (item: UploadListItem) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteUpload(item.key);
      setItems((prev) => prev.filter((it) => it.key !== item.key));
      bumpLibraryCache();
      setToast(`Deleted "${item.name}".`);
    } catch (e) {
      showError(e, 'Delete failed.');
    }
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void doUpload(file, prefix, false);
  };

  return (
    <AdminShell
      crumbs={[{ label: 'Media' }]}
      title="Media library"
      sub="Images and videos uploaded to Cloudflare R2. Filenames are kept so duplicates can be spotted before they pile up."
      actions={
        <>
          <button className="adm-btn" onClick={() => void refresh()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </>
      }
    >
      <div className="adm-card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <label className="adm-label" style={{ margin: 0 }}>
            Folder
          </label>
          <div style={{ width: 220 }}>
            <Dropdown
              value={prefix}
              options={PREFIX_OPTIONS.map((p) => ({ value: p, label: p }))}
              onChange={(v) => setPrefix(v as Prefix)}
              disabled={uploading}
            />
          </div>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--fg-faint)' }}>
            {items.length} {items.length === 1 ? 'file' : 'files'}
            {items.length > 0 && (
              <span>
                {' · '}
                {items.filter((it) => it.content_type.startsWith('image/')).length} images
                {' / '}
                {items.filter((it) => it.content_type.startsWith('video/')).length} videos
              </span>
            )}
          </span>
        </div>

        <label
          className={`adm-drop${dragOver ? ' is-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          style={{ marginTop: 14 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/ogg"
            style={{ display: 'none' }}
            onChange={(e) => onPick(e.target.files)}
          />
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {uploading ? 'Uploading…' : 'Click or drop an image or video here'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 4 }}>
            Up to 100 MB · jpg, png, webp, gif, avif, svg, mp4, webm, mov · saved as <code>{prefix}/&lt;filename&gt;</code>
          </div>
        </label>
      </div>

      {pendingDup && (
        <div className="adm-card adm-callout" style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>
            A file named <code>{pendingDup.file.name}</code> already exists.
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-dim)', marginBottom: 12 }}>
            Use the existing file, or upload this one as a new copy — it will be
            saved with a <code>(1)</code> / <code>(2)</code> suffix so both stay in
            the library.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a
              className="adm-btn adm-btn--sm"
              href={pendingDup.existingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open existing
            </a>
            <button
              className="adm-btn adm-btn--sm"
              onClick={() => void onCopy(pendingDup.existingUrl)}
            >
              Copy existing URL
            </button>
            <Button
              size="sm"
              onClick={onConfirmDuplicate}
              disabled={uploading}
            >
              Upload as new copy
            </Button>
            <button
              className="adm-btn adm-btn--sm adm-btn--ghost"
              onClick={() => setPendingDup(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="adm-card" style={{ textAlign: 'center', color: 'var(--fg-faint)' }}>
          Loading library…
        </div>
      ) : items.length === 0 ? (
        <div className="adm-card" style={{ textAlign: 'center', color: 'var(--fg-faint)' }}>
          No files yet. Upload one above to get started.
        </div>
      ) : (
        <div className="adm-media-grid">
          {items.map((item) => (
            <article key={item.key} className="adm-media-card">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="adm-media-card__thumb"
                title={`Open ${item.name}`}
              >
                {item.content_type.startsWith('video/') ? (
                  <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : item.content_type.startsWith('image/svg') ? (
                  <img src={item.url} alt={item.name} />
                ) : (
                  <img src={item.url} alt={item.name} loading="lazy" />
                )}
              </a>
              <div className="adm-media-card__body">
                <div className="adm-media-card__name" title={item.name}>
                  {item.name}
                </div>
                <div className="adm-media-card__meta">
                  <span>{item.content_type.startsWith('video/') ? '🎬' : '🖼️'}</span>
                  <span>{formatBytes(item.size)}</span>
                  <span>·</span>
                  <span>{formatWhen(item.uploaded_at)}</span>
                </div>
                <div className="adm-media-card__key" title={item.key}>
                  {item.key}
                </div>
                <div className="adm-media-card__actions">
                  <button
                    className="adm-btn adm-btn--sm"
                    onClick={() => void onCopy(item.url)}
                  >
                    Copy URL
                  </button>
                  <a
                    className="adm-btn adm-btn--sm"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => void onDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}
