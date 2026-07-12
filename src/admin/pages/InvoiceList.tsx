import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import { useConfirm } from '@/admin/components/confirm-context';
import { invoiceStore, useInvoices, useCompanyInfo } from '@/admin/invoices/store';
import { emptyInvoice, formatCurrency, totalOf, formatDate } from '@/admin/invoices/types';
import type { InvoiceStatus } from '@/admin/invoices/types';
import '@/admin/invoices/invoice.css';

const STATUS_OPTIONS: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`inv-status-badge inv-status-badge--${status}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'currentColor',
        }}
      />
      {status}
    </span>
  );
}

export function InvoiceList() {
  const invoices = useInvoices();
  const company = useCompanyInfo();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [companyDraft, setCompanyDraft] = useState(company);

  const filtered = useMemo(() => {
    let list = invoices;
    if (statusFilter !== 'all') {
      list = list.filter((i) => i.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.clientName.toLowerCase().includes(q) ||
          i.number.toLowerCase().includes(q) ||
          i.clientEmail.toLowerCase().includes(q),
      );
    }
    return list;
  }, [invoices, statusFilter, search]);

  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status === 'paid');
    const pending = invoices.filter((i) => i.status === 'sent' || i.status === 'draft');
    const overdue = invoices.filter((i) => i.status === 'overdue');
    const revenue = paid.reduce(
      (s, i) => s + totalOf(i.items, i.taxRate, i.discount),
      0,
    );
    const outstanding = pending.reduce(
      (s, i) => s + totalOf(i.items, i.taxRate, i.discount),
      0,
    );
    return { total, paid: paid.length, overdue: overdue.length, revenue, outstanding };
  }, [invoices]);

  const createNew = () => {
    const inv = emptyInvoice(invoiceStore.getNextSeq());
    invoiceStore.bumpSeq();
    invoiceStore.saveInvoice(inv);
    navigate(`/admin/invoices/${inv.id}`);
  };

  const duplicate = (id: string) => {
    const copy = invoiceStore.duplicateInvoice(id);
    if (copy) navigate(`/admin/invoices/${copy.id}`);
  };

  const remove = async (id: string, name: string) => {
    if (
      !(await confirm({
        title: `Delete invoice for "${name}"?`,
        body: 'This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      }))
    )
      return;
    invoiceStore.deleteInvoice(id);
  };

  const saveCompanySettings = () => {
    invoiceStore.saveCompany(companyDraft);
    setShowSettings(false);
  };

  return (
    <AdminShell
      crumbs={[{ label: 'Invoices' }]}
      title="Invoices"
      sub="Create, manage, and export professional invoices for your clients."
      actions={
        <>
          <button className="adm-btn" onClick={() => setShowSettings(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Company
          </button>
          <Button onClick={createNew}>+ New Invoice</Button>
        </>
      }
    >
      <div className="inv-stats">
        <div className="adm-stat">
          <div className="adm-stat__label">Total Invoices</div>
          <div className="adm-stat__num">{stats.total}</div>
          <div className="adm-stat__delta">{stats.paid} paid</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Revenue</div>
          <div className="adm-stat__num">{formatCurrency(stats.revenue, 'USD')}</div>
          <div className="adm-stat__delta">From paid invoices</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat__label">Outstanding</div>
          <div className="adm-stat__num">{formatCurrency(stats.outstanding, 'USD')}</div>
          <div className="adm-stat__delta">{stats.overdue} overdue</div>
        </div>
      </div>

      <div className="inv-filters">
        <input
          className="adm-input"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="adm-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="adm-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 16, color: 'var(--fg-faint)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-faint)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
            {invoices.length === 0 ? 'No invoices yet' : 'No matching invoices'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-dim)', marginBottom: 20 }}>
            {invoices.length === 0
              ? 'Create your first invoice to get started.'
              : 'Try adjusting your search or filters.'}
          </div>
          {invoices.length === 0 && (
          <Button onClick={createNew}>Create invoice</Button>
          )}
        </div>
      ) : (
        <div className="adm-list">
          <div
            className="adm-list__row adm-list__row--head"
            style={{ gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.6fr 0.5fr 200px' }}
          >
            <div>Client</div>
            <div>Invoice #</div>
            <div>Date</div>
            <div>Amount</div>
            <div>Status</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>
          {filtered.map((inv) => {
            const amount = totalOf(inv.items, inv.taxRate, inv.discount);
            return (
              <div
                key={inv.id}
                className="adm-list__row"
                style={{ gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.6fr 0.5fr 200px' }}
              >
                <div className="adm-list__cell adm-list__cell--primary">
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {inv.clientName || 'Untitled'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>
                    {inv.clientEmail}
                  </div>
                </div>
                <div className="adm-list__cell" data-label="Invoice">
                  <span className="adm-badge" style={{ color: 'var(--accent-2)', borderColor: 'var(--accent-2)' }}>
                    {inv.number}
                  </span>
                </div>
                <div className="adm-list__cell" data-label="Date" style={{ fontSize: 13, color: 'var(--fg-dim)' }}>
                  {formatDate(inv.issueDate)}
                </div>
                <div className="adm-list__cell" data-label="Amount" style={{ fontSize: 14, fontWeight: 500 }}>
                  {formatCurrency(amount, inv.currency)}
                </div>
                <div className="adm-list__cell" data-label="Status">
                  <StatusBadge status={inv.status} />
                </div>
                <div className="adm-list__cell adm-list__actions">
                  <Link
                    to={`/admin/invoices/${inv.id}`}
                    className="adm-btn adm-btn--sm"
                  >
                    Edit
                  </Link>
                  <button
                    className="adm-btn adm-btn--sm"
                    onClick={() => duplicate(inv.id)}
                  >
                    Duplicate
                  </button>
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => remove(inv.id, inv.clientName)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showSettings && (
        <div className="inv-preview-overlay" onClick={() => setShowSettings(false)}>
          <div
            className="inv-preview-modal"
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inv-preview-modal__header">
              <div className="inv-preview-modal__title">Company Settings</div>
              <button className="adm-btn adm-btn--sm" onClick={() => setShowSettings(false)}>
                Close
              </button>
            </div>
            <div className="inv-preview-modal__body">
              <div className="inv-company-form">
                <div className="adm-field">
                  <label className="adm-label">Company Name</label>
                  <input
                    className="adm-input"
                    value={companyDraft.name}
                    onChange={(e) => setCompanyDraft({ ...companyDraft, name: e.target.value })}
                  />
                </div>
                <div className="adm-row adm-row--2">
                  <div className="adm-field">
                    <label className="adm-label">Email</label>
                    <input
                      className="adm-input"
                      value={companyDraft.email}
                      onChange={(e) => setCompanyDraft({ ...companyDraft, email: e.target.value })}
                    />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Phone</label>
                    <input
                      className="adm-input"
                      value={companyDraft.phone}
                      onChange={(e) => setCompanyDraft({ ...companyDraft, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="adm-field">
                  <label className="adm-label">Address</label>
                  <input
                    className="adm-input"
                    value={companyDraft.address}
                    onChange={(e) => setCompanyDraft({ ...companyDraft, address: e.target.value })}
                  />
                </div>
                <div className="adm-row adm-row--2">
                  <div className="adm-field">
                    <label className="adm-label">Website</label>
                    <input
                      className="adm-input"
                      value={companyDraft.website}
                      onChange={(e) => setCompanyDraft({ ...companyDraft, website: e.target.value })}
                    />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Tax ID</label>
                    <input
                      className="adm-input"
                      value={companyDraft.taxId}
                      onChange={(e) => setCompanyDraft({ ...companyDraft, taxId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="adm-field">
                  <label className="adm-label">Bank Name</label>
                  <input
                    className="adm-input"
                    value={companyDraft.bankName}
                    onChange={(e) => setCompanyDraft({ ...companyDraft, bankName: e.target.value })}
                  />
                </div>
                <div className="adm-row adm-row--2">
                  <div className="adm-field">
                    <label className="adm-label">Bank Account</label>
                    <input
                      className="adm-input"
                      value={companyDraft.bankAccount}
                      onChange={(e) => setCompanyDraft({ ...companyDraft, bankAccount: e.target.value })}
                    />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Routing Number</label>
                    <input
                      className="adm-input"
                      value={companyDraft.bankRouting}
                      onChange={(e) => setCompanyDraft({ ...companyDraft, bankRouting: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button className="adm-btn" onClick={() => setShowSettings(false)}>
                    Cancel
                  </button>
                  <Button onClick={saveCompanySettings}>Save Settings</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
