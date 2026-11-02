import { format } from 'date-fns';
import { MONTH_NAMES, sortRecordsByDateDesc } from '../../utils/dates.js';
import { generateUniqueId } from '../../utils/api.js';

export const SALES_TYPES = ['Regular', 'Parcel', 'Custom Order'];

export const TRANSFER_SALES_TYPES = [
  'Hand Cash to Online Transfer',
  'Online to Hand Cash Transfer',
];

// Blank sales form. Evaluated once at module load, matching the original
// component-level default object.
export const defaultSalesForm = {
  date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  month: MONTH_NAMES[new Date().getMonth()],
  merchantName: '',
  salesAmount: '',
  salesType: 'Regular',
  commissionPercent: '15',
  commissionAmount: '0.00',
  merchantBill: '0.00',
  discountPercent: '',
  discountAmount: '0.00',
  deliveryCharge: '',
  paidByCustomer: '0.00',
  riderName: '',
  riderSalary: '',
  otherExpenseName: '',
  otherExpense: '',
  fixedExpenseName: '',
  fixedExpense: '',
  expenseDescription: '',
  paymentSource: 'cash',
  digitalPaymentMethod: '',
};

// Auto-calculated sales figures (commission, discount, merchant bill, total).
export const computeDerived = form => {
  const sales = parseFloat(form.salesAmount) || 0;
  const commissionPct = parseFloat(form.commissionPercent) || 0;
  const discountPct = parseFloat(form.discountPercent) || 0;
  const delivery = parseFloat(form.deliveryCharge) || 0;

  const commissionAmount = ((sales * commissionPct) / 100).toFixed(2);
  const discountAmount = ((sales * discountPct) / 100).toFixed(2);
  const merchantBill = (sales - parseFloat(commissionAmount)).toFixed(2);
  const paidByCustomer = (sales + delivery - parseFloat(discountAmount)).toFixed(2);

  return { commissionAmount, discountAmount, merchantBill, paidByCustomer };
};

export const isTransferRecord = record =>
  TRANSFER_SALES_TYPES.includes(record.salesType);

export const isCashPayment = record =>
  !record.digitalPaymentMethod ||
  record.digitalPaymentMethod.toLowerCase() === 'cash';

// Build the form state used when editing an existing sales record.
export const formFromRecord = record => ({
  ...record,
  salesAmount: record.salesAmount || '',
  commissionPercent: record.commissionPercent || '15',
  discountPercent: record.discountPercent || '',
  deliveryCharge: record.deliveryCharge || '',
  riderSalary: record.riderSalary || '',
  otherExpense: record.otherExpense || '',
  fixedExpense: record.fixedExpense || '',
  expenseDescription: record.expenseDescription || '',
  paymentSource: record.paymentSource || 'cash',
});

// Sales records that appear in the table: deduplicated by id, only records
// carrying a sales amount or delivery charge, newest first.
export const buildVisibleRecords = records => {
  const seen = new Set();
  const unique = [];

  for (const record of records || []) {
    if (!record) continue;
    const idKey =
      record.id !== undefined && record.id !== null ? String(record.id).trim() : '';
    if (idKey && seen.has(idKey)) continue;
    if (idKey) seen.add(idKey);
    if (
      (parseFloat(record.salesAmount) || 0) > 0 ||
      (parseFloat(record.deliveryCharge) || 0) > 0
    ) {
      unique.push(record);
    }
  }

  return sortRecordsByDateDesc(unique);
};

// Search + month/type filtering for the sales table.
export const filterSalesRecords = (visibleRecords, { searchTerm, filterMonth, filterType }) =>
  visibleRecords.filter(record => {
    const matchSearch =
      record.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.salesType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMonth = filterMonth === 'All' || record.month === filterMonth;
    const matchType = filterType === 'All' || record.salesType === filterType;

    return matchSearch && matchMonth && matchType;
  });

// Payload sent to the API when creating/updating a sales record.
export const buildSalesPayload = (form, editingId) => {
  const payload = {
    id: editingId || generateUniqueId('rec'),
    date: form.date,
    month: form.month,
    merchantName: form.merchantName,
    salesAmount: form.salesAmount ? String(form.salesAmount) : '0',
    salesType: form.salesType,
    commissionPercent: form.commissionPercent,
    commissionAmount: String(form.commissionAmount),
    merchantBill: String(form.merchantBill),
    discountPercent: form.discountPercent,
    discountAmount: String(form.discountAmount),
    deliveryCharge: form.deliveryCharge ? String(form.deliveryCharge) : '0',
    paidByCustomer: String(form.paidByCustomer),
    riderName: form.riderName || '',
    riderSalary: form.riderSalary ? String(form.riderSalary) : '0',
    otherExpenseName: form.otherExpenseName || '',
    otherExpense: form.otherExpense ? String(form.otherExpense) : '0',
    fixedExpenseName: form.fixedExpenseName || '',
    fixedExpense: form.fixedExpense ? String(form.fixedExpense) : '0',
    expenseDescription: form.expenseDescription || '',
    digitalPaymentMethod: form.digitalPaymentMethod || '',
    paymentSource: form.paymentSource !== undefined ? form.paymentSource : 'cash',
  };

  // Preserve createdAt for updates (don't let user change creation timestamp)
  if (editingId && form.createdAt) {
    payload.createdAt = form.createdAt;
  }

  return payload;
};

// Number of deletable sales records (records with a sales or delivery amount).
export const countSalesRecords = records =>
  (records || []).filter(
    record =>
      (parseFloat(record.salesAmount) || 0) > 0 ||
      (parseFloat(record.deliveryCharge) || 0) > 0
  ).length;
