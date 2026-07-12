import { useEffect, useRef, useState } from 'react';
import { Field } from './Form';
import { ApiError } from '@/lib/api';
import {
  listUploads,
  uploadImage,
  type UploadListItem,
} from '@/admin/store';

/**
 * One reusable image input. It combines three ways to set a URL:
 *
 *   1. Type / paste any URL into the text input.
 *   2. Pick an already-uploaded image from the dropdown (server-side list).
 *   3. Upload a new file — same name as an existing one triggers a confirm
 *      that re-uploads with ``(1)`` / ``(2)`` suffix.
 */

let libraryCache: { items: UploadListItem[]; loadedAt: number } | null = null;
const subs = new Set<() => void>();
const CACHE_MS = 60_000;

async function ensureLibrary(force = false): Promise<UploadListItem[]> {
  if (!force && libraryCache && Date.now() - libraryCache.loadedAt < CACHE_MS) {
    return libraryCache.items;
  }
  const res = await listUploads();
  libraryCache = { items: res.items, loadedAt: Date.now() };
  subs.forEach((s) => s());
  return res.items;
}

// eslint-disable-next-line react-refresh/only-export-components -- shared media-library hook colocated with the field
export function useLibrary(): {
  items: UploadListItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [items, setItems] = useState<UploadListItem[]>(libraryCache?.items ?? []);
  const [loading, setLoading] = useState(!libraryCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (libraryCache) setItems(libraryCache.items);
    };
    subs.add(tick);

    (async () => {
      try {
        const fresh = await ensureLibrary();
        if (!cancelled) setItems(fresh);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load media library.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      subs.delete(tick);
    };
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const fresh = await ensureLibrary(true);
      setItems(fresh);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load media library.');
    } finally {
      setLoading(false);
    }
  };

  return { items, loading, error, refresh };
}

// eslint-disable-next-line react-refresh/only-export-components -- cache helper colocated with the field
export function bumpLibraryCache(item?: UploadListItem) {
  if (!libraryCache) return;
  if (item) {
    libraryCache = {
      items: [item, ...libraryCache.items.filter((it) => it.key !== item.key)],
      loadedAt: Date.now(),
    };
    subs.forEach((s) => s());
  } else {
    libraryCache = null;
  }
}

export interface ImageFieldProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  /** R2 folder used for new uploads. */
  prefix?: string;
  /** Set ``false`` to suppress the small preview below the input (e.g. when the
   * caller already shows a larger thumbnail). Defaults to ``true``. */
  showPreview?: boolean;
}

export function ImageField({
  label = 'Image URL',
  hint = 'Paste a URL, pick an existing image, or upload a new file (max 10 MB).',
  value,
  onChange,
  prefix = 'projects',
  showPreview = true,
}: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerFilter, setPickerFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, loading, refresh } = useLibrary();

  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPickerOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  const filtered = pickerFilter
    ? items.filter((it) => it.name.toLowerCase().includes(pickerFilter.toLowerCase()))
    : items;

  const handleFile = async (file: File, force = false) => {
    setBusy(true);
    setError(null);
    try {
      const res = await uploadImage(file, { prefix, force });
      onChange(res.url);
      bumpLibraryCache({
        url: res.url,
        key: res.key,
        name: res.name,
        content_type: res.content_type,
        size: res.size,
        uploaded_at: new Date().toISOString(),
      });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'duplicate_upload') {
        const details = err.details as
          | { existing_key?: string; existing_url?: string }
          | undefined;
        const useExisting = window.confirm(
          `An image named "${file.name}" already exists.\n\n` +
            'OK: reuse the existing image.\n' +
            'Cancel: upload as a new copy with a (1)/(2) suffix.',
        );
        if (useExisting && details?.existing_url) {
          onChange(details.existing_url);
        } else {
          await handleFile(file, true);
          return;
        }
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="adm-input"
          value={value}
          placeholder="https://… or pick from the library"
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: '1 1 200px', minWidth: 0 }}
        />
        <div className="adm-image-picker" ref={pickerRef}>
          <button
            type="button"
            className="adm-btn adm-btn--sm"
            onClick={() => {
              setPickerOpen((o) => !o);
              if (!libraryCache) void refresh();
            }}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            title="Choose an existing image"
          >
            Library ({items.length}) ▾
          </button>
          {pickerOpen && (
            <div className="adm-image-picker__panel" role="listbox">
              <div className="adm-image-picker__search">
                <input
                  type="search"
                  className="adm-input"
                  placeholder="Filter by name…"
                  value={pickerFilter}
                  onChange={(e) => setPickerFilter(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="adm-btn adm-btn--sm adm-btn--ghost"
                  onClick={() => void refresh()}
                  disabled={loading}
                  title="Refresh library"
                >
                  ↻
                </button>
              </div>
              {loading && items.length === 0 ? (
                <div className="adm-image-picker__empty">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="adm-image-picker__empty">
                  {items.length === 0
                    ? 'No uploads yet. Use the Upload button to add one.'
                    : 'No matches.'}
                </div>
              ) : (
                <ul className="adm-image-picker__list">
                  {filtered.slice(0, 60).map((it) => {
                    const isActive = value === it.url;
                    return (
                      <li key={it.key}>
                        <button
                          type="button"
                          className={`adm-image-picker__item${isActive ? ' is-active' : ''}`}
                          onClick={() => {
                            onChange(it.url);
                            setPickerOpen(false);
                          }}
                          role="option"
                          aria-selected={isActive}
                        >
                          <span className="adm-image-picker__thumb">
                            {it.content_type.startsWith('video/') ? (
                              <video src={it.url} style={{ width: 48, height: 36, objectFit: 'cover' }} />
                            ) : (
                              <img src={it.url} alt="" loading="lazy" />
                            )}
                          </span>
                          <span className="adm-image-picker__meta">
                            <span className="adm-image-picker__name" title={it.name}>
                              {it.name}
                            </span>
                            <span className="adm-image-picker__sub">{it.key}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {filtered.length > 60 && (
                <div className="adm-image-picker__more">
                  Showing 60 of {filtered.length}. Type to filter.
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className="adm-btn adm-btn--sm"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {showPreview && value && (
        <div className="adm-image-field__preview">
          {value.match(/\.(mp4|webm|ogv|mov)(\?|$)/i) ? (
            <video src={value} style={{ maxHeight: 180, width: '100%', objectFit: 'contain' }} />
          ) : (
            <img src={value} alt="" />
          )}
        </div>
      )}
      {error && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' }}>{error}</p>}
    </Field>
  );
}
