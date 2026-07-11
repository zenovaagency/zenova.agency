import { useEffect, useMemo, useRef, useState } from 'react';
import { Popover } from './Popover';

interface ComboboxProps {
  /** Current text value (controlled). */
  value: string;
  /** Fires on every keystroke — the field is always free-text / creatable. */
  onChange: (value: string) => void;
  /**
   * Optional "commit" handler for token-style usage. When provided, picking a
   * suggestion or pressing Enter calls `onSubmit(text)` instead of `onChange`,
   * letting the parent add a chip and reset the entry. When absent, the field
   * behaves as a single free-text value with suggestions.
   */
  onSubmit?: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const CaretIcon = () => (
  <svg
    className="zui-combobox__caret"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/**
 * Creatable combobox: a free-text input with a filtered suggestion popover.
 * Typing always keeps a custom value; suggestions are a shortcut, never a
 * constraint — so it stays compatible with backend fields that accept any
 * string.
 */
export function Combobox({
  value,
  onChange,
  onSubmit,
  suggestions = [],
  placeholder,
  disabled,
  id,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const unique = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of suggestions) {
      const t = s?.trim();
      if (!t || seen.has(t.toLowerCase())) continue;
      seen.add(t.toLowerCase());
      out.push(t);
    }
    return out;
  }, [suggestions]);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return unique;
    return unique.filter((s) => s.toLowerCase().includes(q) && s.toLowerCase() !== q);
  }, [unique, value]);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLButtonElement>(`[data-idx="${activeIdx}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, open]);

  const setOpenState = (next: boolean) => {
    setOpen(next);
    if (!next) setActiveIdx(-1);
  };

  const pick = (s: string) => {
    if (onSubmit) onSubmit(s);
    else onChange(s);
    setOpenState(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      if (open && activeIdx >= 0 && filtered[activeIdx]) {
        e.preventDefault();
        pick(filtered[activeIdx]);
      } else if (onSubmit && value.trim()) {
        e.preventDefault();
        onSubmit(value.trim());
        setOpenState(false);
      } else {
        setOpenState(false);
      }
    } else if (e.key === 'Escape') {
      setOpenState(false);
    }
  };

  const showPopover = open && filtered.length > 0 && !disabled;

  return (
    <Popover
      open={showPopover}
      onOpenChange={setOpenState}
      matchTriggerWidth
      trigger={
        <div className={`zui-combobox${className ? ' ' + className : ''}`}>
          <input
            ref={inputRef}
            id={id}
            type="text"
            className="zui-combobox__input"
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
              setActiveIdx(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
          />
          <CaretIcon />
        </div>
      }
    >
      <div ref={listRef} className="zui-dropdown__list" role="listbox">
        {filtered.map((s, i) => {
          const isSelected = s.toLowerCase() === value.trim().toLowerCase();
          return (
            <button
              key={s}
              type="button"
              data-idx={i}
              className={`zui-dropdown__option${i === activeIdx ? ' is-active' : ''}${
                isSelected ? ' is-selected' : ''
              }`}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(s)}
              role="option"
              aria-selected={isSelected}
            >
              <span className="zui-dropdown__option-body">
                <span className="zui-dropdown__option-label">{s}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
