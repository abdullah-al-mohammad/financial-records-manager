import { getMonthFromDate, toDateKey } from './dates.js';

const UTF8_BOM = '\uFEFF';

// ─── Parsing ────────────────────────────────────────────────────────────────

/**
 * Parse RFC-4180 style CSV text into an array of plain objects keyed by the
 * header row. Supports quoted fields, escaped quotes ("") and newlines inside
 * quoted values, which plain `split(',')` implementations get wrong.
 */
export function parseCsvText(text) {
  if (text === null || text === undefined) return [];

  const source = String(text).replace(/^\uFEFF/, '');
  if (!source.trim()) return [];

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };

  const pushRow = () => {
    pushField();
    // Ignore completely blank lines (common at the end of exported files).
    if (row.some(value => String(value).trim() !== '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      pushField();
    } else if (char === '\n') {
      pushRow();
    } else if (char === '\r') {
      if (source[i + 1] === '\n') i += 1;
      pushRow();
    } else {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) pushRow();

  if (rows.length < 2) return [];

  const headers = rows[0].map(header => String(header).trim());
  const records = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const values = rows[rowIndex];
    const record = {};
    headers.forEach((header, columnIndex) => {
      if (!header) return;
      record[header] = values[columnIndex] !== undefined ? String(values[columnIndex]).trim() : '';
    });
    records.push(record);
  }

  return records;
}

// ─── Serialising ────────────────────────────────────────────────────────────

const escapeCsvCell = value => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * Serialise rows into CSV text.
 *
 * @param {Array<object>} rows
 * @param {Array<{ key?: string, label: string, value?: (row: object) => unknown }>} columns
 */
export function toCsv(rows = [], columns = []) {
  const header = columns.map(column => escapeCsvCell(column.label)).join(',');
  const body = (rows || []).map(row =>
    columns
      .map(column => {
        const value =
          typeof column.value === 'function'
            ? column.value(row)
            : column.key
              ? row?.[column.key]
              : '';
        return escapeCsvCell(value);
      })
      .join(',')
  );

  return [header, ...body].join('\r\n');
}

// ─── Header normalisation & value helpers ───────────────────────────────────

const normaliseKey = value =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const createLookup = raw => {
  const lookup = new Map();
  Object.entries(raw || {}).forEach(([key, value]) => {
    const normalised = normaliseKey(key);
    if (!normalised) return;
    const existing = lookup.get(normalised);
    if (existing === undefined || String(existing).trim() === '') {
      lookup.set(normalised, value);
    }
  });
  return lookup;
};

const createGetter = raw => {
  const lookup = createLookup(raw);
  return (...aliases) => {
    for (const alias of aliases) {
      const value = lookup.get(normaliseKey(alias));
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return String(value).trim();
      }
    }
    return '';
  };
};

const parseAmount = value => {
  const cleaned = String(value ?? '')
    .replace(/[৳$,\s]/g, '')
    .replace(/[^\d.+-]/g, '');
  const number = parseFloat(cleaned);
  return Number.isFinite(number) ? number : 0;
};

const moneyString = value => {
  const number = typeof value === 'number' ? value : parseAmount(value);
  return Number.isFinite(number) ? String(Number(number.toFixed(2))) : '0';
};

const normalisePaymentMethod = value => {
  const method = String(value || '').trim().toLowerCase();
  if (!method) return '';
  if (['cash', 'physical', 'hand cash', 'cash / physical collection'].includes(method)) return '';
  if (['bkash', 'nagad', 'rocket', 'upay', 'bank', 'card', 'online'].includes(method)) {
    return method;
  }
  return method;
};

const normalisePaymentSource = value => {
  const source = String(value || '').trim().toLowerCase();
  if (!source) return 'cash';
  if (source.includes('other')) return 'other_cash';
  if (source.includes('online')) return 'online';
  return 'cash';
};

/**
 * Map a raw CSV row (with any common column naming) into the shape used by the
 * sales form. Missing calculated values are derived from the sales amount.
 */
export function normalizeCsvRecord(raw) {
  const get = createGetter(raw);

  const rawDate = get('Date', 'Transaction Date', 'Sales Date', 'date');
  const dateKey = toDateKey(rawDate);
  const date = dateKey ? `${dateKey}T00:00` : rawDate;
  const month = get('Month', 'Cycle Month', 'month') || getMonthFromDate(dateKey || rawDate) || '';

  const salesAmount = moneyString(
    get('Sales Amount', 'salesAmount', 'Sales', 'Amount', 'Gross Sales')
  );
  const sales = parseAmount(salesAmount);

  const commissionPercent =
    get('Commission %', 'commissionPercent', 'Commission', 'Commission Percentage') || '0';
  const commissionAmountRaw = get('Commission Amount', 'commissionAmount', 'Commission Value');
  const commissionAmount = commissionAmountRaw
    ? moneyString(commissionAmountRaw)
    : moneyString((sales * parseAmount(commissionPercent)) / 100);

  const discountPercent =
    get('Discount %', 'discountPercent', 'Discount', 'Discount Percentage') || '';
  const discountAmountRaw = get('Discount Amount', 'discountAmount', 'Discount Value');
  const discountAmount = discountAmountRaw
    ? moneyString(discountAmountRaw)
    : moneyString((sales * parseAmount(discountPercent)) / 100);

  const deliveryCharge = moneyString(
    get('Delivery Charge', 'deliveryCharge', 'Delivery', 'Delivery Fee')
  );
  const delivery = parseAmount(deliveryCharge);

  const merchantBillRaw = get('Merchant Bill', 'merchantBill', 'Merchant Payable');
  const merchantBill = merchantBillRaw
    ? moneyString(merchantBillRaw)
    : moneyString(sales - parseAmount(commissionAmount));

  const paidByCustomerRaw = get('Paid By Customer', 'paidByCustomer', 'Customer Payment', 'Total');
  const paidByCustomer = paidByCustomerRaw
    ? moneyString(paidByCustomerRaw)
    : moneyString(sales + delivery - parseAmount(discountAmount));

  return {
    date,
    month,
    merchantName: get('Merchant', 'Merchant Name', 'merchantName', 'merchant', 'Client'),
    salesAmount,
    salesType: get('Type', 'Sales Type', 'salesType', 'Order Type') || 'Regular',
    commissionPercent,
    commissionAmount,
    merchantBill,
    discountPercent,
    discountAmount,
    deliveryCharge,
    paidByCustomer,
    digitalPaymentMethod: normalisePaymentMethod(
      get('Payment Method', 'digitalPaymentMethod', 'Payment', 'Method')
    ),
    paymentSource: normalisePaymentSource(get('Payment Source', 'paymentSource', 'Funded By')),
    riderName: get('Rider', 'Rider Name', 'riderName'),
    riderSalary: moneyString(get('Rider Salary', 'riderSalary', 'Rider Wages')),
    otherExpenseName: get('Other Expense Name', 'otherExpenseName', 'Expense Name'),
    otherExpense: moneyString(get('Other Expense', 'otherExpense', 'Variable Expense')),
    fixedExpenseName: get('Fixed Expense Name', 'fixedExpenseName', 'Fixed Cost Name'),
    fixedExpense: moneyString(get('Fixed Expense', 'fixedExpense', 'Fixed Cost')),
    expenseDescription: get('Description', 'expenseDescription', 'Note', 'Notes'),
  };
}

// ─── Sales import ───────────────────────────────────────────────────────────

const hashString = value => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
};

/**
 * Deterministic ID derived from the identifying fields of a row. Importing the
 * same file twice therefore produces the same IDs and is deduplicated by both
 * the client cache and the Apps Script backend.
 */
export function buildImportId(record) {
  const key = [
    toDateKey(record?.date) || record?.date || '',
    String(record?.merchantName || '').trim().toLowerCase(),
    parseAmount(record?.salesAmount),
    record?.salesType || '',
    parseAmount(record?.deliveryCharge),
  ].join('|');
  return `imp_${hashString(key)}`;
}

/**
 * Parse a sales CSV into ready-to-save records, plus row-level errors and
 * duplicates already present in `existingRecords` (or repeated in the file).
 */
export function parseSalesCsv(text, { existingRecords = [] } = {}) {
  const rows = parseCsvText(text);
  const existingIds = new Set(
    (existingRecords || [])
      .map(record => (record?.id !== undefined && record?.id !== null ? String(record.id) : ''))
      .filter(Boolean)
  );

  const seenIds = new Set();
  const records = [];
  const errors = [];
  const duplicates = [];
  const createdAt = new Date().toISOString();

  rows.forEach((raw, index) => {
    const rowNumber = index + 2; // +1 header, +1 for 1-based line numbers
    const normalized = normalizeCsvRecord(raw);

    if (!normalized.merchantName) {
      errors.push({ row: rowNumber, message: 'Merchant name is required.' });
      return;
    }

    if (!(parseAmount(normalized.salesAmount) > 0)) {
      errors.push({ row: rowNumber, message: 'Sales amount must be greater than zero.' });
      return;
    }

    const id = buildImportId(normalized);
    if (existingIds.has(id) || seenIds.has(id)) {
      duplicates.push({ row: rowNumber, ...normalized });
      return;
    }

    seenIds.add(id);
    records.push({ ...normalized, id, createdAt });
  });

  return { records, errors, duplicates, totalRows: rows.length };
}

// ─── Export column definitions ──────────────────────────────────────────────

export const SALES_CSV_COLUMNS = [
  { label: 'Date', value: record => toDateKey(record.date) || record.date || '' },
  { label: 'Month', value: record => record.month || '' },
  { label: 'Merchant', value: record => record.merchantName || '' },
  { label: 'Sales Amount', value: record => record.salesAmount || '0' },
  { label: 'Sales Type', value: record => record.salesType || '' },
  { label: 'Commission %', value: record => record.commissionPercent || '0' },
  { label: 'Commission Amount', value: record => record.commissionAmount || '0' },
  { label: 'Merchant Bill', value: record => record.merchantBill || '0' },
  { label: 'Discount %', value: record => record.discountPercent || '' },
  { label: 'Discount Amount', value: record => record.discountAmount || '0' },
  { label: 'Delivery Charge', value: record => record.deliveryCharge || '0' },
  { label: 'Paid By Customer', value: record => record.paidByCustomer || '0' },
  { label: 'Payment Method', value: record => record.digitalPaymentMethod || 'Cash' },
  { label: 'Payment Source', value: record => record.paymentSource || 'cash' },
  { label: 'Rider', value: record => record.riderName || '' },
  { label: 'Rider Salary', value: record => record.riderSalary || '0' },
  { label: 'Other Expense Name', value: record => record.otherExpenseName || '' },
  { label: 'Other Expense', value: record => record.otherExpense || '0' },
  { label: 'Fixed Expense Name', value: record => record.fixedExpenseName || '' },
  { label: 'Fixed Expense', value: record => record.fixedExpense || '0' },
  { label: 'Description', value: record => record.expenseDescription || '' },
];

const EXPENSE_CSV_COLUMNS = [
  { label: 'Date', value: item => toDateKey(item.date) || item.date || '' },
  { label: 'Month', value: item => item.month || '' },
  { label: 'Merchant', value: item => item.merchantName || '' },
  { label: 'Category', value: item => item.category || '' },
  { label: 'Description', value: item => item.name || '' },
  { label: 'Amount', value: item => item.amount ?? '' },
  { label: 'Payment Source', value: item => item.originalRecord?.paymentSource || 'cash' },
];

const RECEIVABLE_CSV_COLUMNS = [
  { label: 'Date', value: record => toDateKey(record.date) || record.date || '' },
  { label: 'Name', value: record => record.name || '' },
  { label: 'Amount', value: record => record.amount || '0' },
  { label: 'Status', value: record => record.status || 'Not Received' },
  { label: 'Received Account', value: record => record.receivedAccount || '' },
  { label: 'Received Date', value: record => toDateKey(record.receivedDate) || record.receivedDate || '' },
  { label: 'Note', value: record => record.note || '' },
];

const PAYABLE_CSV_COLUMNS = [
  { label: 'Date', value: record => toDateKey(record.date) || record.date || '' },
  { label: 'Name', value: record => record.name || '' },
  { label: 'Amount', value: record => record.amount || '0' },
  { label: 'Status', value: record => record.status || 'Unpaid' },
  { label: 'Paid Account', value: record => record.paidAccount || '' },
  { label: 'Paid Date', value: record => toDateKey(record.paidDate) || record.paidDate || '' },
  { label: 'Note', value: record => record.note || '' },
];

const OTHER_CASH_CSV_COLUMNS = [
  { label: 'Date', value: record => toDateKey(record.date) || record.date || '' },
  { label: 'Month', value: record => record.month || '' },
  { label: 'Source', value: record => record.source || '' },
  { label: 'Type', value: record => record.type || '' },
  { label: 'Amount', value: record => record.amount || '0' },
  { label: 'Description', value: record => record.description || '' },
];

export const buildSalesCsv = records => toCsv(records, SALES_CSV_COLUMNS);
export const buildExpensesCsv = items => toCsv(items, EXPENSE_CSV_COLUMNS);
export const buildReceivablesCsv = records => toCsv(records, RECEIVABLE_CSV_COLUMNS);
export const buildPayablesCsv = records => toCsv(records, PAYABLE_CSV_COLUMNS);
export const buildOtherCashCsv = records => toCsv(records, OTHER_CASH_CSV_COLUMNS);

// ─── Browser download helper ────────────────────────────────────────────────

export function csvFileName(prefix, date = new Date()) {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
  return `${prefix}-${stamp}.csv`;
}

/**
 * Trigger a browser download for CSV text. A UTF-8 BOM is prepended so Excel
 * detects the encoding (important for ৳ and Bengali text).
 */
export function downloadCsv(filename, csvText) {
  if (typeof document === 'undefined' || typeof Blob === 'undefined') return false;

  const blob = new Blob([`${UTF8_BOM}${csvText || ''}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename || csvFileName('export');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Release the object URL on the next tick so the download can start.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return true;
}
