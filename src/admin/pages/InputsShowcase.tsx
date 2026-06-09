import { useState } from 'react';
import { AdminShell } from '@/admin/components/AdminShell';
import {
  Calendar,
  DatePicker,
  DateTimePicker,
  Dropdown,
  InputField,
  SegmentedControl,
  TimePicker,
  Toggle,
  type DropdownOption,
} from '@/components/ui/inputs';

const ROLES: DropdownOption[] = [
  { value: 'design', label: 'Design lead', hint: 'Mira, Jordan' },
  { value: 'eng', label: 'Engineering lead', hint: 'Tobias' },
  { value: 'growth', label: 'Growth strategist', hint: 'Suri' },
  { value: 'pm', label: 'Project manager' },
  { value: 'qa', label: 'QA / Reviewer', disabled: true },
];

const STATUSES: DropdownOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'wrapped', label: 'Wrapped' },
];

export function InputsShowcase() {
  const [role, setRole] = useState<string | null>('eng');
  const [status, setStatus] = useState<string | null>('active');
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [dt, setDt] = useState<string | null>(null);
  const [inline, setInline] = useState<string | null>(new Date().toISOString().slice(0, 10));
  const [view, setView] = useState<'overview' | 'phases' | 'team'>('overview');
  const [tab, setTab] = useState<'all' | 'open' | 'shipped'>('open');
  const [notifications, setNotifications] = useState(true);
  const [draftMode, setDraftMode] = useState(false);

  return (
    <AdminShell
      crumbs={[{ label: 'Components' }]}
      title="Inputs"
      sub="Reusable form primitives — drop these into any admin / team / client page."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="adm-label">Dropdown</div>
          <div className="adm-row adm-row--2">
            <InputField label="Role" hint="Plain dropdown.">
              <Dropdown
                value={role}
                options={ROLES}
                onChange={setRole}
                placeholder="Pick a role"
              />
            </InputField>
            <InputField label="Status" hint="With clear button.">
              <Dropdown
                value={status}
                options={STATUSES}
                onChange={setStatus}
                clearable
                onClear={() => setStatus(null)}
              />
            </InputField>
          </div>
          <InputField label="Searchable" hint="Type to filter the option list.">
            <Dropdown
              value={role}
              options={ROLES}
              onChange={setRole}
              searchable
              placeholder="Search roles…"
            />
          </InputField>
        </div>

        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="adm-label">Date · Time · DateTime</div>
          <div className="adm-row adm-row--3">
            <InputField label="Date">
              <DatePicker value={date} onChange={setDate} clearable placeholder="Start date" />
            </InputField>
            <InputField label="Time (12h)">
              <TimePicker
                value={time}
                onChange={setTime}
                format="12"
                clearable
                placeholder="Kick-off"
              />
            </InputField>
            <InputField label="Date & time">
              <DateTimePicker value={dt} onChange={setDt} format="12" clearable />
            </InputField>
          </div>
          <InputField label="Inline calendar" hint="Same primitive without the popover.">
            <div style={{ display: 'inline-block', border: '1px solid var(--line)', borderRadius: 14 }}>
              <Calendar value={inline} onChange={setInline} onClear={() => setInline(null)} />
            </div>
          </InputField>
        </div>

        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="adm-label">Toggle · Segmented control</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <Toggle
              checked={notifications}
              onChange={setNotifications}
              label="Email notifications"
            />
            <Toggle
              checked={draftMode}
              onChange={setDraftMode}
              label="Draft mode"
            />
            <Toggle checked={true} onChange={() => undefined} disabled label="Locked (disabled)" />
          </div>
          <InputField label="View">
            <SegmentedControl
              value={view}
              options={[
                { value: 'overview', label: 'Overview' },
                { value: 'phases', label: 'Phases' },
                { value: 'team', label: 'Team' },
              ]}
              onChange={setView}
            />
          </InputField>
          <InputField label="Filter">
            <SegmentedControl
              value={tab}
              options={[
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open' },
                { value: 'shipped', label: 'Shipped' },
              ]}
              onChange={setTab}
            />
          </InputField>
        </div>

        <div
          className="adm-card"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--line-strong)',
          }}
        >
          <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 11 }}>
            Current values
          </div>
          <pre
            style={{
              margin: '8px 0 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--fg-dim)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {JSON.stringify(
              { role, status, date, time, dt, inline, view, tab, notifications, draftMode },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </AdminShell>
  );
}
