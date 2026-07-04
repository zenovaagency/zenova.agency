import { useRef, useState } from 'react';
import { Field } from './Form';
import { uploadImage, uploadVideo } from '@/admin/store';
import { ApiError } from '@/lib/api';
import { bumpLibraryCache, useLibrary } from './ImageField';

export interface MediaFieldProps {
  label?: string;
  hint?: string;
  image: string;
  video: string;
  onImageChange: (next: string | undefined) => void;
  onVideoChange: (next: string | undefined) => void;
  prefix?: string;
}

export function MediaField({
  label = 'Card media',
  hint = 'Upload or pick an image (poster/fallback) and optionally add a video that plays on hover.',
  image,
  video,
  onImageChange,
  onVideoChange,
  prefix = 'services',
}: MediaFieldProps) {
  const imageFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerFilter, setPickerFilter] = useState('');
  const [pickerTab, setPickerTab] = useState<'all' | 'images' | 'videos'>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { items, loading, refresh } = useLibrary();
  const [showVideo, setShowVideo] = useState(!!video);

  const imageItems = items.filter((it) => it.content_type.startsWith('image/'));
  const videoItems = items.filter((it) => it.content_type.startsWith('video/'));

  const pickerItems = pickerTab === 'all' ? items : pickerTab === 'images' ? imageItems : videoItems;
  const filtered = pickerFilter
    ? pickerItems.filter((it) => it.name.toLowerCase().includes(pickerFilter.toLowerCase()))
    : pickerItems;

  const handleImageUpload = async (file: File, force = false) => {
    setBusy('image');
    setError(null);
    try {
      const res = await uploadImage(file, { prefix, force });
      onImageChange(res.url);
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
        const details = err.details as { existing_key?: string; existing_url?: string } | undefined;
        if (window.confirm(`An image named "${file.name}" already exists.\n\nOK: reuse the existing file.\nCancel: upload as a new copy with a (1)/(2) suffix.`) && details?.existing_url) {
          onImageChange(details.existing_url);
        } else {
          await handleImageUpload(file, true);
          return;
        }
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed.');
      }
    } finally {
      setBusy(null);
    }
  };

  const handleVideoUpload = async (file: File, force = false) => {
    setBusy('video');
    setError(null);
    try {
      const res = await uploadVideo(file, { prefix, force });
      onVideoChange(res.url);
      setShowVideo(true);
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
        const details = err.details as { existing_key?: string; existing_url?: string } | undefined;
        if (window.confirm(`A video named "${file.name}" already exists.\n\nOK: reuse the existing file.\nCancel: upload as a new copy with a (1)/(2) suffix.`) && details?.existing_url) {
          onVideoChange(details.existing_url);
          setShowVideo(true);
        } else {
          await handleVideoUpload(file, true);
          return;
        }
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed.');
      }
    } finally {
      setBusy(null);
    }
  };

  const handlePickerSelect = (url: string, contentType: string) => {
    if (contentType.startsWith('video/')) {
      onVideoChange(url);
      setShowVideo(true);
    } else {
      onImageChange(url);
    }
    setPickerOpen(false);
  };

  const previewUrl = image;

  return (
    <Field label={label} hint={hint}>
      {/* Image row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="adm-input"
          value={image}
          placeholder="Image URL (poster / fallback)"
          onChange={(e) => onImageChange(e.target.value || undefined)}
          style={{ flex: '1 1 200px', minWidth: 0 }}
        />
        <div className="adm-image-picker" ref={pickerRef}>
          <button
            type="button"
            className="adm-btn adm-btn--sm"
            onClick={() => {
              setPickerOpen((o) => !o);
              if (!items.length) void refresh();
            }}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            title="Choose from media library"
          >
            Library ({items.length}) ▾
          </button>
          {pickerOpen && (
            <div className="adm-image-picker__panel" role="listbox">
              <div className="adm-image-picker__search">
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  {(['all', 'images', 'videos'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`adm-btn adm-btn--sm${pickerTab === tab ? ' adm-btn--primary' : ''}`}
                      onClick={() => setPickerTab(tab)}
                    >
                      {tab === 'all' ? `All (${items.length})` : tab === 'images' ? `Images (${imageItems.length})` : `Videos (${videoItems.length})`}
                    </button>
                  ))}
                </div>
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
              {loading && pickerItems.length === 0 ? (
                <div className="adm-image-picker__empty">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="adm-image-picker__empty">
                  {pickerItems.length === 0 ? 'No files yet. Use the Upload button to add one.' : 'No matches.'}
                </div>
              ) : (
                <ul className="adm-image-picker__list">
                  {filtered.slice(0, 60).map((it) => {
                    const isActive = image === it.url || video === it.url;
                    return (
                      <li key={it.key}>
                        <button
                          type="button"
                          className={`adm-image-picker__item${isActive ? ' is-active' : ''}`}
                          onClick={() => handlePickerSelect(it.url, it.content_type)}
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
                            <span className="adm-image-picker__name" title={it.name}>{it.name}</span>
                            <span className="adm-image-picker__sub">{it.key}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {filtered.length > 60 && (
                <div className="adm-image-picker__more">Showing 60 of {filtered.length}. Type to filter.</div>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className="adm-btn adm-btn--sm"
          onClick={() => imageFileRef.current?.click()}
          disabled={busy === 'image'}
        >
          {busy === 'image' ? 'Uploading…' : 'Upload image'}
        </button>
        <input
          ref={imageFileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImageUpload(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* Video toggle */}
      {!showVideo ? (
        <button
          type="button"
          className="adm-btn adm-btn--sm adm-btn--ghost"
          onClick={() => setShowVideo(true)}
          style={{ marginTop: 8 }}
        >
          + Add video
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="adm-input"
              value={video}
              placeholder="Video URL (optional, plays on hover)"
              onChange={(e) => onVideoChange(e.target.value || undefined)}
              style={{ flex: '1 1 200px', minWidth: 0 }}
            />
            <button
              type="button"
              className="adm-btn adm-btn--sm"
              onClick={() => videoFileRef.current?.click()}
              disabled={busy === 'video'}
            >
              {busy === 'video' ? 'Uploading…' : 'Upload video'}
            </button>
            <input
              ref={videoFileRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleVideoUpload(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className="adm-btn adm-btn--sm adm-btn--ghost"
              onClick={() => { onVideoChange(undefined); setShowVideo(false); }}
              style={{ color: '#ff6b6b' }}
            >
              Remove video
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="adm-image-field__preview">
          {video ? (
            <video
              src={video}
              poster={image}
              controls
              style={{ maxHeight: 240, width: '100%', objectFit: 'contain' }}
            />
          ) : (
            <img src={image} alt="" style={{ maxHeight: 240, width: '100%', objectFit: 'contain' }} />
          )}
        </div>
      )}
      {error && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' }}>{error}</p>}
    </Field>
  );
}
