import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Popover } from './Popover';

export interface DropdownOption<V extends string | number = string> {
  value: V;
  label: string;
  hint?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DropdownProps<V extends string | number = string> {
  value: V | null;
  options: DropdownOption<V>[];
  onChange: (value: V) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  /** Forwarded for label/aria purposes. */
  id?: string;
  /** Optional className added to the trigger button. */
  className?: string;
}

const CaretIcon = () => (
  <svg
    className="zui-trigger__caret"
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

const CheckIcon = () => (
  <svg
    className="zui-dropdown__option-check"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const _Trigger = forwardRef<
  HTMLButtonElement,
  {
    id?: string;
    open: boolean;
    disabled?: boolean;
    onClick: () => void;
    label: ReactNode;
    placeholder?: string;
    hasValue: boolean;
    clearable?: boolean;
    onClear?: () => void;
    icon?: ReactNode;
    className?: string;
  }
>(function Trigger(
  { id, open, disabled, onClick, label, placeholder, hasValue, clearable, onClear, icon, className },
  ref,
) {
  return (
    <button
      ref={ref}
      id={id}
      type="button"
      className={`zui-trigger${open ? ' is-open' : ''}${className ? ' ' + className : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      {icon && <span className="zui-trigger__icon">{icon}</span>}
      <span className={`zui-trigger__value${hasValue ? '' : ' is-placeholder'}`}>
        {hasValue ? label : placeholder ?? 'Select…'}
      </span>
      {clearable && hasValue && (
        <button
          type="button"
          className="zui-trigger__clear"
          onClick={(e) => {
            e.stopPropagation();
            onClear?.();
          }}
          aria-label="Clear"
        >
          ×
        </button>
      )}
      <CaretIcon />
    </button>
  );
});

export function Dropdown<V extends string | number = string>({
  value,
  options,
  onChange,
  placeholder,
  searchable = false,
  disabled,
  clearable,
  onClear,
  id,
  className,
}: DropdownProps<V>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const selected = options.find((o) => o.value === value) ?? null;

  // When the menu opens, highlight the selected row (or the first); when it
  // closes, clear the search. Reconciled during render to avoid cascading
  // re-renders on the open/close transition.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setActiveIdx(Math.max(0, filtered.findIndex((o) => o.value === value)));
    } else {
      setQuery('');
      setActiveIdx(0);
    }
  }

  // While open, keep the highlight valid as the filtered list narrows (typing).
  const [syncedFiltered, setSyncedFiltered] = useState(filtered);
  if (syncedFiltered !== filtered) {
    setSyncedFiltered(filtered);
    if (open) setActiveIdx(Math.max(0, filtered.findIndex((o) => o.value === value)));
  }

  // Focus the search field after the portal mounts.
  useEffect(() => {
    if (!open || !searchable) return;
    const raf = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open, searchable]);

  // Scroll active option into view.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLButtonElement>(`[data-idx="${activeIdx}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, open]);

  const pick = (opt: DropdownOption<V>) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[activeIdx];
      if (opt) pick(opt);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      matchTriggerWidth
      trigger={
        <_Trigger
          id={id}
          open={open}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          label={selected?.label}
          placeholder={placeholder}
          hasValue={!!selected}
          icon={selected?.icon}
          clearable={clearable}
          onClear={onClear}
          className={className}
        />
      }
    >
      <div onKeyDown={onKey}>
        {searchable && (
          <div className="zui-dropdown__search">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIdx(0);
              }}
              placeholder="Search…"
              aria-label="Search options"
            />
          </div>
        )}
        <div ref={listRef} className="zui-dropdown__list" role="listbox">
          {filtered.length === 0 && <div className="zui-dropdown__empty">No matches</div>}
          {filtered.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                data-idx={i}
                className={`zui-dropdown__option${i === activeIdx ? ' is-active' : ''}${
                  isSelected ? ' is-selected' : ''
                }`}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => pick(opt)}
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
              >
                {opt.icon && <span className="zui-dropdown__option-icon">{opt.icon}</span>}
                <span className="zui-dropdown__option-body">
                  <div className="zui-dropdown__option-label">{opt.label}</div>
                  {opt.hint && <div className="zui-dropdown__option-hint">{opt.hint}</div>}
                </span>
                <CheckIcon />
              </button>
            );
          })}
        </div>
      </div>
    </Popover>
  );
}
