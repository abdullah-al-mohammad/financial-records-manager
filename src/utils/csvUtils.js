import { getMonthFromDate } from './dates.js';

export function parseCsvText(text) {
  if (!text) return [];
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] !== undefined ? values[i] : '';
    });
    return row;
  });
}

export function normalizeCsvRecord(raw) {
  const getVal = (...keys) => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== null && String(raw[k]).trim() !== '') {
        return String(raw[k]).trim();
      }
    }
    return '';
  };

  const date = getVal('Date', 'date');
  const month = getMonthFromDate(date) || '';

  return {
    date,
    month,
    merchantName: getVal('Merchant', 'merchantName', 'Merchant Name', 'merchant'),
    salesAmount: getVal('Sales Amount', 'salesAmount', 'sales', 'Amount', 'amount'),
    salesType: getVal('Type', 'salesType', 'Sales Type') || 'Regular',
    commissionPercent: getVal('Commission %', 'commissionPercent', 'commission', 'Commission'),
    deliveryCharge: getVal('Delivery Charge', 'deliveryCharge', 'delivery', 'Delivery'),
  };
}
