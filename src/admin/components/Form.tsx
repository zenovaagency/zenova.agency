import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { Combobox, DatePicker, Dropdown, Toggle } from '@/components/ui/inputs';
import { isValidHex, isValidSlug, slugify } from '@/admin/lib/validate';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      {children}
      {hint && <p className="adm-help">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        className="adm-input"
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SlugField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  // `slugify` on every keystroke keeps the value inside the backend `Slug`
  // pattern; the only reachable invalid state is empty.
  const empty = value.length === 0;
  const invalid = !empty && !isValidSlug(value);
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        className="adm-input"
        style={empty || invalid ? { borderColor: '#dc3c3c' } : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(slugify(e.target.value))}
      />
      {(empty || invalid) && (
        <p className="adm-help" style={{ color: '#dc3c3c' }}>
          {empty ? 'Slug is required.' : 'Lowercase letters, numbers, and dashes only.'}
        </p>
      )}
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className="adm-textarea"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function Select({
  label,
  hint,
  value,
  options,
  onChange,
  searchable,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  searchable?: boolean;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Dropdown
        value={value}
        options={options}
        onChange={onChange}
        searchable={searchable}
        placeholder={placeholder}
      />
    </Field>
  );
}

export function ComboField({
  label,
  hint,
  value,
  suggestions,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  suggestions: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Combobox value={value} suggestions={suggestions} onChange={onChange} placeholder={placeholder} />
    </Field>
  );
}

export function TokenField({
  label,
  hint,
  values,
  onChange,
  suggestions,
  placeholder,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [entry, setEntry] = useState('');
  const add = (raw: string) => {
    const t = raw.trim();
    setEntry('');
    if (!t || values.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    onChange([...values, t]);
  };
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const avail = (suggestions ?? []).filter(
    (s) => !values.some((v) => v.toLowerCase() === s.trim().toLowerCase()),
  );
  return (
    <Field label={label} hint={hint}>
      {values.length > 0 && (
        <div className="zui-tokens">
          {values.map((v, i) => (
            <span key={`${v}-${i}`} className="zui-token">
              {v}
              <button
                type="button"
                className="zui-token__remove"
                onClick={() => remove(i)}
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <Combobox
        value={entry}
        onChange={setEntry}
        onSubmit={add}
        suggestions={avail}
        placeholder={placeholder}
      />
    </Field>
  );
}

export function DateField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  clearable,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  clearable?: boolean;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <DatePicker
        value={value || null}
        onChange={(v) => onChange(v ?? '')}
        min={min}
        max={max}
        clearable={clearable}
        placeholder={placeholder}
      />
    </Field>
  );
}

export function ToggleField({
  label,
  hint,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <Toggle
        checked={value}
        onChange={onChange}
        disabled={disabled}
        label={description}
      />
    </Field>
  );
}

export function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // The native color picker only ever emits valid hex; the text box lets the
  // user type freely, so flag anything the backend `HexColor` would reject.
  const invalid = value.length > 0 && !isValidHex(value);
  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="color"
          className="adm-input adm-input--color"
          value={isValidHex(value) ? value.slice(0, 7) : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 64, flexShrink: 0 }}
        />
        <input
          type="text"
          className="adm-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontFamily: 'var(--font-mono)', flex: 1, ...(invalid ? { borderColor: '#dc3c3c' } : {}) }}
        />
      </div>
      {invalid && (
        <p className="adm-help" style={{ color: '#dc3c3c' }}>
          Enter a hex color like #ff813a.
        </p>
      )}
    </Field>
  );
}

export function StringList({
  label,
  hint,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const update = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const add = () => onChange([...values, '']);
  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {values.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="adm-input"
              value={v}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
            />
            <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => remove(i)}>
              ✕
            </button>
          </div>
        ))}
        <button className="adm-btn adm-btn--sm" onClick={add} style={{ alignSelf: 'flex-start' }}>
          + Add item
        </button>
      </div>
    </Field>
  );
}

export function Toast({ message, onClear }: { message: string | null; onClear: () => void }) {
  // `message` alone drives visibility — the toast mounts when it's set and the
  // timer clears it. No mirror state, so nothing to sync in the effect body.
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClear, 2200);
    return () => clearTimeout(t);
  }, [message, onClear]);
  if (!message) return null;
  return <div className="adm-toast">{message}</div>;
}
