import { useEffect, useRef, useState, type ClipboardEvent, type ReactNode } from 'react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/** Accept a raw URL, adding a scheme when it looks like a bare domain.
 *  Returns null when the string doesn't plausibly look like a link. */
function normalizeUrl(raw: string): string | null {
  const url = raw.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url)) return url;
  if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(url)) return 'https://' + url;
  return null;
}

/** Match a markdown-style link at the END of `text`. Supports both the
 *  standard `[label](url)` and the reversed `(label)[url]` form. */
function matchMarkdownLink(
  text: string,
): { label: string; url: string; len: number } | null {
  const patterns = [
    /\[([^\]]+)\]\(([^)\s]+)\)$/, // [label](url)
    /\(([^)]+)\)\[([^\]\s]+)\]$/, // (label)[url]
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1].trim()) {
      const url = normalizeUrl(m[2]);
      if (url) return { label: m[1], url, len: m[0].length };
    }
  }
  return null;
}

/** Convert every markdown link in a plain-text string to safe anchor HTML. */
function markdownToHtml(raw: string): string {
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\(([^)]+)\)\[([^\]\s]+)\]/g;
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    out += escapeHtml(raw.slice(last, m.index)).replace(/\n/g, '<br>');
    const label = m[1] ?? m[3];
    const url = normalizeUrl(m[2] ?? m[4]);
    out += url
      ? `<a href="${escapeAttr(url)}">${escapeHtml(label)}</a>`
      : escapeHtml(m[0]);
    last = re.lastIndex;
  }
  out += escapeHtml(raw.slice(last)).replace(/\n/g, '<br>');
  return out;
}

const MARKDOWN_LINK_RE = /\[[^\]]+\]\([^)\s]+\)|\([^)]+\)\[[^\]\s]+\]/;

/**
 * A dependency-free WYSIWYG editor built on `contentEditable` +
 * `document.execCommand`. It is a controlled component that emits HTML through
 * `onChange`. The DOM is only re-synced from `value` when they actually differ
 * (e.g. an external reset or tab switch), so typing never loses the caret.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  minHeight = 340,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [block, setBlock] = useState('p');

  // Push external value changes into the DOM without clobbering the caret while
  // the user is typing (our own edits come back equal, so this no-ops then).
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    // The browser's createLink command injects inline font styles onto anchors;
    // strip them so links inherit the page's prose styling when rendered.
    el.querySelectorAll('a[style]').forEach((a) => a.removeAttribute('style'));
    onChange(el.innerHTML);
  };

  // Convert a markdown link the moment the user finishes typing it, replacing
  // the `[label](url)` text before the caret with a real anchor (Discord-style).
  const maybeAutolink = () => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (!el.contains(node) || node.nodeType !== Node.TEXT_NODE) return;
    const caret = range.startOffset;
    const found = matchMarkdownLink((node.textContent ?? '').slice(0, caret));
    if (!found) return;

    const a = document.createElement('a');
    a.setAttribute('href', found.url);
    a.textContent = found.label;

    const del = document.createRange();
    del.setStart(node, caret - found.len);
    del.setEnd(node, caret);
    del.deleteContents();
    del.insertNode(a);

    // A trailing space lets the caret sit outside the link so typing continues
    // as normal text rather than extending the anchor.
    const spacer = document.createTextNode(' ');
    a.after(spacer);
    const after = document.createRange();
    after.setStartAfter(spacer);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);
  };

  const handleInput = () => {
    maybeAutolink();
    emit();
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData?.getData('text/plain') ?? '';
    if (!text || !MARKDOWN_LINK_RE.test(text)) return; // let normal paste run
    e.preventDefault();
    document.execCommand('insertHTML', false, markdownToHtml(text));
    emit();
  };

  const syncState = () => {
    try {
      setActive({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
      const b = (document.queryCommandValue('formatBlock') || 'p')
        .toString()
        .toLowerCase();
      setBlock(b || 'p');
    } catch {
      /* queryCommand* throws when the selection is outside a document */
    }
  };

  // Keep the toolbar's active states in sync with the caret / selection.
  useEffect(() => {
    const handler = () => {
      const el = ref.current;
      const sel = window.getSelection();
      if (el && sel && sel.anchorNode && el.contains(sel.anchorNode)) syncState();
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    syncState();
    emit();
  };

  const setBlockFormat = (tag: string) => exec('formatBlock', `<${tag}>`);

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (url == null) return;
    const trimmed = url.trim();
    if (!trimmed) return;
    ref.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.toString()) {
      document.execCommand('createLink', false, trimmed);
    } else {
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${escapeAttr(trimmed)}">${escapeHtml(trimmed)}</a>`,
      );
    }
    emit();
  };

  const onFocus = () => {
    // Make Enter produce <p> rather than <div> for cleaner, semantic output.
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      /* not supported everywhere — harmless */
    }
  };

  const isEmpty = stripHtml(value).length === 0 && !/<(img|hr)/i.test(value);

  return (
    <div className="rte">
      <div className="rte__toolbar" role="toolbar" aria-label="Formatting">
        <select
          className="rte__select"
          value={['h2', 'h3', 'blockquote', 'pre'].includes(block) ? block : 'p'}
          onChange={(e) => setBlockFormat(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          title="Text style"
          aria-label="Text style"
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code block</option>
        </select>

        <span className="rte__sep" />

        <TB label="Bold" active={active.bold} onClick={() => exec('bold')}>
          <span style={{ fontWeight: 800 }}>B</span>
        </TB>
        <TB label="Italic" active={active.italic} onClick={() => exec('italic')}>
          <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>I</span>
        </TB>
        <TB label="Underline" active={active.underline} onClick={() => exec('underline')}>
          <span style={{ textDecoration: 'underline' }}>U</span>
        </TB>
        <TB
          label="Strikethrough"
          active={active.strikeThrough}
          onClick={() => exec('strikeThrough')}
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </TB>

        <span className="rte__sep" />

        <TB
          label="Bulleted list"
          active={active.insertUnorderedList}
          onClick={() => exec('insertUnorderedList')}
        >
          <Ico>
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4" cy="6" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1.4" fill="currentColor" stroke="none" />
          </Ico>
        </TB>
        <TB
          label="Numbered list"
          active={active.insertOrderedList}
          onClick={() => exec('insertOrderedList')}
        >
          <Ico>
            <line x1="10" y1="6" x2="20" y2="6" />
            <line x1="10" y1="12" x2="20" y2="12" />
            <line x1="10" y1="18" x2="20" y2="18" />
            <path d="M4 4.5h1.5V9M4 9h3" strokeWidth="1.4" />
            <path d="M3.8 14.2c1.6-.8 2.4.6 1.2 1.6L3.8 17.5H6" strokeWidth="1.4" />
          </Ico>
        </TB>

        <span className="rte__sep" />

        <TB label="Insert link" onClick={addLink}>
          <Ico>
            <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
            <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
          </Ico>
        </TB>
        <TB label="Remove link" onClick={() => exec('unlink')}>
          <Ico>
            <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
            <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
            <line x1="3" y1="3" x2="21" y2="21" />
          </Ico>
        </TB>
        <TB label="Horizontal divider" onClick={() => exec('insertHorizontalRule')}>
          <Ico>
            <line x1="3" y1="12" x2="21" y2="12" />
          </Ico>
        </TB>

        <span className="rte__sep" />

        <TB label="Clear formatting" onClick={() => exec('removeFormat')}>
          <Ico>
            <path d="M6 5h11M8 5l-2 14M14 5l1 6" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="21" y1="15" x2="15" y2="21" />
          </Ico>
        </TB>
      </div>

      <div
        ref={ref}
        className={`rte__surface${isEmpty ? ' is-empty' : ''}`}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Rich text content"
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={handleInput}
        onBlur={emit}
        onFocus={onFocus}
        onPaste={handlePaste}
      />
    </div>
  );
}

/** Toolbar button. `onMouseDown` preventDefault keeps the editor selection. */
function TB({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`rte__btn${active ? ' is-active' : ''}`}
      title={label}
      aria-label={label}
      aria-pressed={!!active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Compact stroked icon wrapper matching the codebase's SVG style. */
function Ico({ children }: { children: ReactNode }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}
