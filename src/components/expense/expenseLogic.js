import { getMonthFromDate, MONTH_NAMES, sortRecordsByDateDesc } from '../../utils/dates.js';
import { generateUniqueId } from '../../utils/api.js';

// Expense category keys used by the itemized ledger.
export const EXPENSE_CATEGORIES = {
  RIDER: 'Rider Wages',
  VARIABLE: 'Variable Overhead',
  FIXED: 'Fixed Cost',
  DISCOUNT: 'Sales Discount',
};

// Default (blank) state for the expense form.
export const emptyExpenseForm = () => ({
  date: new Date().toISOString().slice(0, 16),
  month: MONTH_NAMES[new Date().getMonth()],
  merchantName: '',
  riderName: '',
  riderSalary: '',
  otherExpenseName: '',
  otherExpense: '',
  fixedExpenseName: '',
  fixedExpense: '',
  expenseDescription: '',
  paymentSource: 'cash',
});

// An expense entry requires at least one of the three expense amounts.
export const hasAnyExpense = form =>
  (parseFloat(form.riderSalary) || 0) > 0 ||
  (parseFloat(form.otherExpense) || 0) > 0 ||
  (parseFloat(form.fixedExpense) || 0) > 0;

// Build the sales-record payload that carries the expense fields.
// Existing sales/commission/discount fields are preserved untouched.
export const buildExpensePayload = (form, editingId, existingRecord = null) => ({
  ...(existingRecord || {}),
  id: editingId || generateUniqueId('rec'),
  date: form.date,
  month: form.month,
  merchantName: form.merchantName || '',
  salesAmount: existingRecord?.salesAmount ?? '0',
  salesType: existingRecord?.salesType || 'Regular',
  commissionPercent: existingRecord?.commissionPercent || '0',
  commissionAmount: existingRecord?.commissionAmount || '0',
  merchantBill: existingRecord?.merchantBill || '0',
  discountPercent: existingRecord?.discountPercent || '',
  discountAmount: existingRecord?.discountAmount || '0',
  deliveryCharge: existingRecord?.deliveryCharge || '0',
  paidByCustomer: existingRecord?.paidByCustomer || '0',
  otherCashSource: existingRecord?.otherCashSource || '',
  otherCashAmount: existingRecord?.otherCashAmount || '0',
  digitalPaymentMethod: existingRecord?.digitalPaymentMethod || '',
  paymentSource: form.paymentSource || 'cash',
  riderName: form.riderName,
  riderSalary: form.riderSalary ? String(form.riderSalary) : '0',
  otherExpenseName: form.otherExpenseName,
  otherExpense: form.otherExpense ? String(form.otherExpense) : '0',
  fixedExpenseName: form.fixedExpenseName,
  fixedExpense: form.fixedExpense ? String(form.fixedExpense) : '0',
  expenseDescription: form.expenseDescription,
});

// Map a stored record into the form shape used for editing.
export const formFromRecord = record => ({
  date: record.date || new Date().toISOString().slice(0, 16),
  month: record.month || getMonthFromDate(record.date) || MONTH_NAMES[new Date().getMonth()],
  merchantName: record.merchantName || '',
  riderName: record.riderName || '',
  riderSalary: record.riderSalary || '',
  otherExpenseName: record.otherExpenseName || '',
  otherExpense: record.otherExpense || '',
  fixedExpenseName: record.fixedExpenseName || '',
  fixedExpense: record.fixedExpense || '',
  expenseDescription: record.expenseDescription || '',
  paymentSource: record.paymentSource || 'cash',
});

// Flatten sales records into individual expense lines for the ledger table.
export const buildItemizedExpenses = records => {
  const list = [];

  records.forEach(r => {
    const rs = parseFloat(r.riderSalary) || 0;
    const oe = parseFloat(r.otherExpense) || 0;
    const fe = parseFloat(r.fixedExpense) || 0;

    if (rs > 0) {
      list.push({
        id: `${r.id}_rider`,
        date: r.date,
        createdAt: r.createdAt,
        month: r.month,
        merchantName: r.merchantName,
        category: EXPENSE_CATEGORIES.RIDER,
        name: r.riderName ? `Rider Salary: ${r.riderName}` : 'Rider Salary',
        amount: rs,
        originalRecord: r,
        field: 'rider',
      });
    }

    if (oe > 0) {
      list.push({
        id: `${r.id}_other`,
        date: r.date,
        createdAt: r.createdAt,
        month: r.month,
        merchantName: r.merchantName,
        category: EXPENSE_CATEGORIES.VARIABLE,
        name: r.otherExpenseName || r.expenseDescription || 'Variable Expense',
        amount: oe,
        originalRecord: r,
        field: 'other',
      });
    }

    if (fe > 0) {
      list.push({
        id: `${r.id}_fixed`,
        date: r.date,
        createdAt: r.createdAt,
        month: r.month,
        merchantName: r.merchantName,
        category: EXPENSE_CATEGORIES.FIXED,
        name: r.fixedExpenseName || 'Fixed Cost',
        amount: fe,
        originalRecord: r,
        field: 'fixed',
      });
    }

    const da = parseFloat(r.discountAmount) || 0;
    if (da > 0) {
      list.push({
        id: `${r.id}_discount`,
        date: r.date,
        createdAt: r.createdAt,
        month: r.month,
        merchantName: r.merchantName,
        category: EXPENSE_CATEGORIES.DISCOUNT,
        name: `Discount: ${r.merchantName || 'Sales Record'}`,
        amount: da,
        originalRecord: r,
        field: 'discount',
      });
    }
  });

  return sortRecordsByDateDesc(list);
};

// Remove a single expense line from its linked record without touching the
// other expense lines (or the sales/commission fields).
export const buildRecordAfterItemRemoval = (record, field) => {
  const updated = { ...record };

  if (field === 'rider') {
    updated.riderName = '';
    updated.riderSalary = '0';
  } else if (field === 'other') {
    updated.otherExpenseName = '';
    updated.otherExpense = '0';
  } else if (field === 'fixed') {
    updated.fixedExpenseName = '';
    updated.fixedExpense = '0';
  } else if (field === 'discount') {
    const sales = parseFloat(record.salesAmount) || 0;
    const delivery = parseFloat(record.deliveryCharge) || 0;
    updated.discountPercent = '0';
    updated.discountAmount = '0';
    updated.paidByCustomer = (sales + delivery).toFixed(2);
  }

  return updated;
};

// Whether a record still carries any expense line after removing `field`.
export const hasRemainingExpenses = (record, field) => {
  const remainingRider = field === 'rider' ? 0 : (parseFloat(record.riderSalary) || 0);
  const remainingOther = field === 'other' ? 0 : (parseFloat(record.otherExpense) || 0);
  const remainingFixed = field === 'fixed' ? 0 : (parseFloat(record.fixedExpense) || 0);
  return remainingRider > 0 || remainingOther > 0 || remainingFixed > 0;
};
