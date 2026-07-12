import { jsPDF } from 'jspdf';
import type { Invoice, CompanyInfo } from './types';
import { subtotalOf, taxOf, totalOf, formatCurrency, formatDate } from './types';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COL = {
  bg: [255, 255, 255] as const,
  fg: [18, 18, 24] as const,
  dim: [100, 105, 120] as const,
  faint: [160, 165, 178] as const,
  line: [228, 230, 238] as const,
  accent: [58, 91, 255] as const,
  accentLight: [238, 241, 255] as const,
  white: [255, 255, 255] as const,
  green: [34, 168, 96] as const,
  red: [220, 60, 60] as const,
  orange: [220, 140, 30] as const,
};

type RGB = readonly [number, number, number];

function statusColor(status: string): RGB {
  switch (status) {
    case 'paid': return COL.green;
    case 'overdue': return COL.red;
    case 'sent': return COL.accent;
    case 'cancelled': return COL.faint;
    default: return COL.orange;
  }
}

export function generateInvoicePDF(invoice: Invoice, company: CompanyInfo): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  doc.setFillColor(...COL.bg);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  doc.setFillColor(...COL.accent);
  doc.rect(0, 0, PAGE_W, 4, 'F');

  let y = 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COL.fg);
  doc.text(company.name, MARGIN, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COL.dim);
  const companyLines = [
    company.address,
    company.email,
    company.phone,
    company.website,
  ].filter(Boolean);
  let cy = y + 6;
  for (const line of companyLines) {
    doc.text(line, MARGIN, cy);
    cy += 4;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COL.accent);
  doc.text('INVOICE', PAGE_W - MARGIN, 26, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COL.dim);
  doc.text(invoice.number, PAGE_W - MARGIN, 33, { align: 'right' });

  const sc = statusColor(invoice.status);
  const badgeText = invoice.status.toUpperCase();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const badgeW = doc.getTextWidth(badgeText) + 8;
  const badgeX = PAGE_W - MARGIN - badgeW;
  const badgeY = 36;
  doc.setFillColor(sc[0], sc[1], sc[2]);
  doc.roundedRect(badgeX, badgeY, badgeW, 6, 2, 2, 'F');
  doc.setTextColor(...COL.white);
  doc.text(badgeText, badgeX + badgeW / 2, badgeY + 4.2, { align: 'center' });

  y = Math.max(cy, 48) + 8;

  doc.setDrawColor(...COL.line);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 10;

  const colW = CONTENT_W / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COL.faint);
  doc.text('BILL TO', MARGIN, y);
  doc.text('INVOICE DETAILS', MARGIN + colW, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COL.fg);
  doc.text(invoice.clientName || '—', MARGIN, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COL.dim);
  let leftY = y + 5;
  if (invoice.clientEmail) { doc.text(invoice.clientEmail, MARGIN, leftY); leftY += 4; }
  if (invoice.clientAddress) {
    const addrLines = doc.splitTextToSize(invoice.clientAddress, colW - 10);
    for (const line of addrLines) {
      doc.text(line, MARGIN, leftY);
      leftY += 4;
    }
  }

  const details: [string, string][] = [
    ['Issue Date', formatDate(invoice.issueDate)],
    ['Due Date', formatDate(invoice.dueDate)],
    ['Payment Terms', invoice.paymentTerms],
    ['Currency', invoice.currency],
  ];

  let rightY = y;
  doc.setFontSize(9);
  for (const [label, value] of details) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COL.faint);
    doc.text(label, MARGIN + colW, rightY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COL.fg);
    doc.text(value, MARGIN + colW + 40, rightY);
    rightY += 6;
  }

  y = Math.max(leftY, rightY) + 10;

  const tableX = MARGIN;
  const colDesc = 70;
  const colQty = 22;
  const colRate = 30;
  const colTotal = 30;
  const colPad = (CONTENT_W - colDesc - colQty - colRate - colTotal) / 3;

  doc.setFillColor(...COL.accentLight);
  doc.roundedRect(tableX, y, CONTENT_W, 9, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COL.accent);
  let tx = tableX + 4;
  doc.text('DESCRIPTION', tx, y + 6);
  tx += colDesc + colPad;
  doc.text('QTY', tx, y + 6, { align: 'center' });
  tx += colQty + colPad;
  doc.text('RATE', tx, y + 6, { align: 'right' });
  tx += colRate + colPad;
  doc.text('AMOUNT', tx, y + 6, { align: 'right' });
  y += 14;

  doc.setFontSize(9);
  for (const item of invoice.items) {
    if (y > PAGE_H - 60) {
      doc.addPage();
      doc.setFillColor(...COL.bg);
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
      y = MARGIN;
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COL.fg);
    const desc = item.description || '—';
    const descLines = doc.splitTextToSize(desc, colDesc - 4);
    doc.text(descLines[0], tableX + 4, y + 4);

    doc.setTextColor(...COL.dim);
    doc.text(String(item.quantity), tableX + colDesc + colPad + colQty / 2, y + 4, { align: 'center' });
    doc.text(formatCurrency(item.rate, invoice.currency), tableX + colDesc + colPad + colQty + colPad + colRate, y + 4, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COL.fg);
    doc.text(formatCurrency(item.quantity * item.rate, invoice.currency), tableX + CONTENT_W - 4, y + 4, { align: 'right' });

    y += 10;

    doc.setDrawColor(...COL.line);
    doc.setLineWidth(0.15);
    doc.line(tableX + 4, y - 2, tableX + CONTENT_W - 4, y - 2);
  }

  y += 6;

  const summaryX = tableX + CONTENT_W - 60;
  const subtotal = subtotalOf(invoice.items);
  const tax = taxOf(invoice.items, invoice.taxRate);
  const total = totalOf(invoice.items, invoice.taxRate, invoice.discount);

  const summaryRows: [string, string, boolean][] = [
    ['Subtotal', formatCurrency(subtotal, invoice.currency), false],
  ];
  if (invoice.taxRate > 0) {
    summaryRows.push([`Tax (${invoice.taxRate}%)`, formatCurrency(tax, invoice.currency), false]);
  }
  if (invoice.discount > 0) {
    summaryRows.push(['Discount', `-${formatCurrency(invoice.discount, invoice.currency)}`, false]);
  }
  summaryRows.push(['Total Due', formatCurrency(total, invoice.currency), true]);

  for (const [label, value, isBold] of summaryRows) {
    if (isBold) {
      doc.setFillColor(...COL.accent);
      doc.roundedRect(summaryX - 4, y - 4, 64, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COL.white);
      doc.text(label, summaryX, y + 2);
      doc.text(value, summaryX + 56, y + 2, { align: 'right' });
      y += 12;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COL.dim);
      doc.text(label, summaryX, y + 2);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COL.fg);
      doc.text(value, summaryX + 56, y + 2, { align: 'right' });
      y += 7;
    }
  }

  if (invoice.notes || company.bankName) {
    y = Math.max(y + 10, PAGE_H - 60);

    doc.setDrawColor(...COL.line);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y - 4, PAGE_W - MARGIN, y - 4);

    if (company.bankName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COL.faint);
      doc.text('PAYMENT INFORMATION', MARGIN, y + 2);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COL.dim);
      const bankLines = [
        `Bank: ${company.bankName}`,
        company.bankAccount ? `Account: ${company.bankAccount}` : '',
        company.bankRouting ? `Routing: ${company.bankRouting}` : '',
      ].filter(Boolean);
      for (const line of bankLines) {
        doc.text(line, MARGIN, y);
        y += 4.5;
      }
    }

    if (invoice.notes) {
      const notesX = company.bankName ? MARGIN + CONTENT_W / 2 : MARGIN;
      const notesW = company.bankName ? CONTENT_W / 2 - 10 : CONTENT_W;
      let ny = company.bankName ? y - (bankLines(invoice, company) * 4.5 + 7) + 2 : y + 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COL.faint);
      doc.text('NOTES', notesX, ny);
      ny += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COL.dim);
      const noteLines = doc.splitTextToSize(invoice.notes, notesW);
      for (const line of noteLines) {
        doc.text(line, notesX, ny);
        ny += 4.5;
      }
    }
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COL.faint);
  doc.text(
    `Generated by ${company.name} on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
    PAGE_W / 2,
    PAGE_H - 10,
    { align: 'center' },
  );

  return doc;
}

function bankLines(_invoice: Invoice, company: CompanyInfo): number {
  return [company.bankName, company.bankAccount, company.bankRouting].filter(Boolean).length;
}
