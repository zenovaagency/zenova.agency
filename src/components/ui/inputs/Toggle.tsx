'use client';
import type { ReactNode } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  id?: string;
}

export function Toggle({ checked, onChange, label, disabled, id }: ToggleProps) {
  return (
    <label
      className={`zui-toggle${checked ? ' is-on' : ''}${disabled ? ' is-disabled' : ''}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className="zui-toggle__track"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
      >
        <span className="zui-toggle__thumb" />
      </span>
      {label !== undefined && <span>{label}</span>}
    </label>
  );
}
