export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  notes: string;
  paymentTerms: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logoUrl: string;
  taxId: string;
  bankName: string;
  bankAccount: string;
  bankRouting: string;
}

export const DEFAULT_COMPANY: CompanyInfo = {
  name: 'Zenova',
  email: 'hello@zenova.agency',
  phone: '',
  address: 'Brooklyn, NY',
  website: 'zenova.agency',
  logoUrl: '',
  taxId: '',
  bankName: '',
  bankAccount: '',
  bankRouting: '',
};

export function emptyInvoice(seq: number): Invoice {
  const now = new Date().toISOString();
  const issue = new Date();
  const due = new Date();
  due.setDate(due.getDate() + 30);

  return {
    id: crypto.randomUUID(),
    number: `INV-${String(seq).padStart(4, '0')}`,
    status: 'draft',
    issueDate: issue.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    items: [
      { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 },
    ],
    taxRate: 0,
    discount: 0,
    notes: '',
    paymentTerms: 'Net 30',
    currency: 'USD',
    createdAt: now,
    updatedAt: now,
  };
}

export function subtotalOf(items: InvoiceItem[]): number {
  return items.reduce((s, i) => s + i.quantity * i.rate, 0);
}

export function taxOf(items: InvoiceItem[], rate: number): number {
  return subtotalOf(items) * (rate / 100);
}

export function totalOf(items: InvoiceItem[], rate: number, discount: number): number {
  return subtotalOf(items) + taxOf(items, rate) - discount;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
