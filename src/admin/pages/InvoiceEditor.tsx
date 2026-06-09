import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminShell } from '@/admin/components/AdminShell';
import { invoiceStore, useInvoice, useCompanyInfo } from '@/admin/invoices/store';
import { generateInvoicePDF } from '@/admin/invoices/pdfGenerator';
import {
  subtotalOf,
  taxOf,
  totalOf,
  formatCurrency,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
} from '@/admin/invoices/types';
import '@/admin/invoices/invoice.css';

const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BDT', 'INR', 'JPY'];

export function InvoiceEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const existing = useInvoice(id ?? '');
  const company = useCompanyInfo();
  const [invoice, setInvoice] = useState<Invoice>(
    () => existing ?? invoiceStore.getInvoice(id ?? '') ?? (navigate('/admin/invoices'), null as never),
  );
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const update = useCallback((partial: Partial<Invoice>) => {
    setInvoice((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateItem = useCallback((itemId: string, partial: Partial<InvoiceItem>) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, ...partial } : i)),
    }));
  }, []);

  const addItem = useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 },
      ],
    }));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  }, []);

  const save = () => {
    invoiceStore.saveInvoice(invoice);
    setToast('Invoice saved');
    setTimeout(() => setToast(null), 2500);
  };

  const downloadPDF = () => {
    const doc = generateInvoicePDF(invoice, company);
    doc.save(`${invoice.number}_${invoice.clientName || 'draft'}.pdf`);
  };

  const previewPDF = () => {
    setShowPreview(true);
  };

  if (!invoice) return null;

  const subtotal = subtotalOf(invoice.items);
  const tax = taxOf(invoice.items, invoice.taxRate);
  const total = totalOf(invoice.items, invoice.taxRate, invoice.discount);

  return (
    <AdminShell
      crumbs={[
        { label: 'Invoices', to: '/admin/invoices' },
        { label: invoice.number },
      ]}
      title={invoice.number}
      sub={invoice.clientName ? `Invoice for ${invoice.clientName}` : 'New invoice'}
      actions={
        <>
          <button className="adm-btn" onClick={previewPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
          <button className="adm-btn" onClick={downloadPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
          <button className="adm-btn adm-btn--primary" onClick={save}>
            Save Invoice
          </button>
        </>
      }
    >
      <div className="inv-editor">
        <div className="inv-editor__main">
          <div className="inv-section">
            <div className="inv-section__title">Invoice Details</div>
            <div className="adm-row adm-row--3">
              <div className="adm-field">
                <label className="adm-label">Invoice Number</label>
                <input
                  className="adm-input"
                  value={invoice.number}
                  onChange={(e) => update({ number: e.target.value })}
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Issue Date</label>
                <input
                  className="adm-input"
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => update({ issueDate: e.target.value })}
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Due Date</label>
                <input
                  className="adm-input"
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => update({ dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="adm-row adm-row--2" style={{ marginTop: 14 }}>
              <div className="adm-field">
                <label className="adm-label">Status</label>
                <select
                  className="adm-select"
                  value={invoice.status}
                  onChange={(e) => update({ status: e.target.value as InvoiceStatus })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="adm-field">
                <label className="adm-label">Currency</label>
                <select
                  className="adm-select"
                  value={invoice.currency}
                  onChange={(e) => update({ currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="inv-section">
            <div className="inv-section__title">Client Information</div>
            <div className="adm-row adm-row--2">
              <div className="adm-field">
                <label className="adm-label">Client Name</label>
                <input
                  className="adm-input"
                  value={invoice.clientName}
                  onChange={(e) => update({ clientName: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Client Email</label>
                <input
                  className="adm-input"
                  type="email"
                  value={invoice.clientEmail}
                  onChange={(e) => update({ clientEmail: e.target.value })}
                  placeholder="billing@acme.com"
                />
              </div>
            </div>
            <div className="adm-field" style={{ marginTop: 14 }}>
              <label className="adm-label">Client Address</label>
              <textarea
                className="adm-textarea"
                value={invoice.clientAddress}
                onChange={(e) => update({ clientAddress: e.target.value })}
                placeholder="123 Business St, Suite 100, City, State 12345"
                style={{ minHeight: 60 }}
              />
            </div>
          </div>

          <div className="inv-section">
            <div className="inv-section__title">
              <span>Line Items</span>
              <button className="adm-btn adm-btn--sm" onClick={addItem}>
                + Add Item
              </button>
            </div>
            <table className="inv-items-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Description</th>
                  <th style={{ width: '15%' }}>Qty</th>
                  <th style={{ width: '20%' }}>Rate</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        className="adm-input"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        placeholder="Service description"
                      />
                    </td>
                    <td>
                      <input
                        className="adm-input"
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <input
                        className="adm-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 500, fontSize: 13, paddingRight: 10 }}>
                      {formatCurrency(item.quantity * item.rate, invoice.currency)}
                    </td>
                    <td>
                      {invoice.items.length > 1 && (
                        <button
                          className="inv-items-table__remove"
                          onClick={() => removeItem(item.id)}
                          title="Remove item"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="inv-section">
            <div className="inv-section__title">Additional</div>
            <div className="adm-row adm-row--3">
              <div className="adm-field">
                <label className="adm-label">Tax Rate (%)</label>
                <input
                  className="adm-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={invoice.taxRate}
                  onChange={(e) => update({ taxRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Discount</label>
                <input
                  className="adm-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoice.discount}
                  onChange={(e) => update({ discount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Payment Terms</label>
                <input
                  className="adm-input"
                  value={invoice.paymentTerms}
                  onChange={(e) => update({ paymentTerms: e.target.value })}
                  placeholder="Net 30"
                />
              </div>
            </div>
            <div className="adm-field" style={{ marginTop: 14 }}>
              <label className="adm-label">Notes</label>
              <textarea
                className="adm-textarea"
                value={invoice.notes}
                onChange={(e) => update({ notes: e.target.value })}
                placeholder="Payment instructions, thank you note, etc."
              />
            </div>
          </div>
        </div>

        <div className="inv-editor__sidebar">
          <div className="inv-section">
            <div className="inv-section__title">Summary</div>
            <div className="inv-summary">
              <div className="inv-summary__row">
                <span className="inv-summary__label">Subtotal</span>
                <span className="inv-summary__value">{formatCurrency(subtotal, invoice.currency)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="inv-summary__row">
                  <span className="inv-summary__label">Tax ({invoice.taxRate}%)</span>
                  <span className="inv-summary__value">{formatCurrency(tax, invoice.currency)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="inv-summary__row">
                  <span className="inv-summary__label">Discount</span>
                  <span className="inv-summary__value">-{formatCurrency(invoice.discount, invoice.currency)}</span>
                </div>
              )}
              <div className="inv-summary__row inv-summary__row--total">
                <span className="inv-summary__label">Total</span>
                <span className="inv-summary__value">{formatCurrency(total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          <div className="inv-section">
            <div className="inv-section__title">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="adm-btn" onClick={previewPDF} style={{ justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Preview Invoice
              </button>
              <button className="adm-btn adm-btn--primary" onClick={downloadPDF} style={{ justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>

          <div className="inv-section" style={{ fontSize: 12, color: 'var(--fg-dim)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Created</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                {new Date(invoice.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Updated</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                {new Date(invoice.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <InvoicePreviewModal
          invoice={invoice}
          company={company}
          onClose={() => setShowPreview(false)}
          onDownload={downloadPDF}
        />
      )}

      {toast && <div className="adm-toast">{toast}</div>}
    </AdminShell>
  );
}

function InvoicePreviewModal({
  invoice,
  company,
  onClose,
  onDownload,
}: {
  invoice: Invoice;
  company: ReturnType<typeof useCompanyInfo>;
  onClose: () => void;
  onDownload: () => void;
}) {
  const subtotal = subtotalOf(invoice.items);
  const tax = taxOf(invoice.items, invoice.taxRate);
  const total = totalOf(invoice.items, invoice.taxRate, invoice.discount);

  const statusColors: Record<InvoiceStatus, string> = {
    draft: '#dc8c1e',
    sent: '#ff813a',
    paid: '#22a860',
    overdue: '#dc3c3c',
    cancelled: '#a0a5b2',
  };

  return (
    <div className="inv-preview-overlay" onClick={onClose}>
      <div className="inv-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inv-preview-modal__header">
          <div className="inv-preview-modal__title">
            {invoice.number} — Preview
          </div>
          <div className="inv-preview-modal__actions">
            <button className="adm-btn adm-btn--sm" onClick={onDownload}>
              Download PDF
            </button>
            <button className="adm-btn adm-btn--sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <div className="inv-preview-modal__body">
          <div className="inv-preview-doc">
            <div className="inv-preview-doc__accent-bar" />

            <div className="inv-preview-doc__header">
              <div>
                <div className="inv-preview-doc__company-name">{company.name}</div>
                <div className="inv-preview-doc__company-details">
                  {[company.address, company.email, company.phone, company.website]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </div>
              <div>
                <div className="inv-preview-doc__invoice-title">INVOICE</div>
                <div className="inv-preview-doc__invoice-number">{invoice.number}</div>
                <div
                  className="inv-preview-doc__status"
                  style={{
                    background: `${statusColors[invoice.status]}18`,
                    color: statusColors[invoice.status],
                    border: `1px solid ${statusColors[invoice.status]}44`,
                  }}
                >
                  {invoice.status}
                </div>
              </div>
            </div>

            <div className="inv-preview-doc__divider" />

            <div className="inv-preview-doc__meta">
              <div>
                <div className="inv-preview-doc__meta-label">Bill To</div>
                <div className="inv-preview-doc__client-name">
                  {invoice.clientName || '—'}
                </div>
                <div className="inv-preview-doc__client-info">
                  {invoice.clientEmail && <div>{invoice.clientEmail}</div>}
                  {invoice.clientAddress && (
                    <div style={{ whiteSpace: 'pre-line' }}>{invoice.clientAddress}</div>
                  )}
                </div>
              </div>
              <div>
                <div className="inv-preview-doc__meta-label">Invoice Details</div>
                <div className="inv-preview-doc__detail-row">
                  <span className="inv-preview-doc__detail-label">Issue Date</span>
                  <span className="inv-preview-doc__detail-value">
                    {new Date(invoice.issueDate + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="inv-preview-doc__detail-row">
                  <span className="inv-preview-doc__detail-label">Due Date</span>
                  <span className="inv-preview-doc__detail-value">
                    {new Date(invoice.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="inv-preview-doc__detail-row">
                  <span className="inv-preview-doc__detail-label">Terms</span>
                  <span className="inv-preview-doc__detail-value">{invoice.paymentTerms}</span>
                </div>
              </div>
            </div>

            <table className="inv-preview-doc__table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description || '—'}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.rate, invoice.currency)}</td>
                    <td>{formatCurrency(item.quantity * item.rate, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="inv-preview-doc__summary">
              <div className="inv-preview-doc__summary-row">
                <span className="inv-preview-doc__summary-label">Subtotal</span>
                <span className="inv-preview-doc__summary-value">
                  {formatCurrency(subtotal, invoice.currency)}
                </span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="inv-preview-doc__summary-row">
                  <span className="inv-preview-doc__summary-label">Tax ({invoice.taxRate}%)</span>
                  <span className="inv-preview-doc__summary-value">
                    {formatCurrency(tax, invoice.currency)}
                  </span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="inv-preview-doc__summary-row">
                  <span className="inv-preview-doc__summary-label">Discount</span>
                  <span className="inv-preview-doc__summary-value">
                    -{formatCurrency(invoice.discount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="inv-preview-doc__summary-total">
                <span>Total Due</span>
                <span>{formatCurrency(total, invoice.currency)}</span>
              </div>
            </div>

            {(invoice.notes || company.bankName) && (
              <div className="inv-preview-doc__footer">
                {company.bankName && (
                  <div className="inv-preview-doc__footer-section">
                    <div className="inv-preview-doc__footer-label">Payment Information</div>
                    <div className="inv-preview-doc__footer-text">
                      <div>Bank: {company.bankName}</div>
                      {company.bankAccount && <div>Account: {company.bankAccount}</div>}
                      {company.bankRouting && <div>Routing: {company.bankRouting}</div>}
                    </div>
                  </div>
                )}
                {invoice.notes && (
                  <div className="inv-preview-doc__footer-section">
                    <div className="inv-preview-doc__footer-label">Notes</div>
                    <div className="inv-preview-doc__footer-text" style={{ whiteSpace: 'pre-line' }}>
                      {invoice.notes}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="inv-preview-doc__generated">
              Generated by {company.name} on{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
