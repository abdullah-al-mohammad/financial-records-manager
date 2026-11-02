import {
  compareDates,
  formatDisplayDate,
  getMonthFromDate,
  isDateInRange,
} from '../../utils/dates.js';

// Month labels used by the billing cycle selector and ledger bucketing.
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const formatOrderDate = formatDisplayDate;

const getMonthName = getMonthFromDate;

export const merchantsMatch = (a, b) =>
  String(a || '')
    .trim()
    .toLowerCase() ===
  String(b || '')
    .trim()
    .toLowerCase();

export const formatOrderDetails = record => {
  const parts = [];
  if (record.salesType) parts.push(record.salesType);
  if (record.digitalPaymentMethod) parts.push(record.digitalPaymentMethod);
  if (record.expenseDescription) parts.push(record.expenseDescription);
  if (record.riderName) parts.push(`Rider: ${record.riderName}`);
  return parts.length ? parts.join(' · ') : '—';
};

export const getRecordSalesAmount = record => {
  if (!record) return 0;
  const sales = parseFloat(record.salesAmount);
  if (!Number.isNaN(sales) && sales > 0) return sales;
  const billed = parseFloat(record.merchantBill) || 0;
  const comm = parseFloat(record.commissionAmount) || 0;
  return billed + comm;
};

export const getRecordMerchantBill = record => {
  if (!record) return 0;
  const billed = parseFloat(record.merchantBill);
  if (!Number.isNaN(billed) && billed > 0) return billed;
  const sales = parseFloat(record.salesAmount) || 0;
  const comm = parseFloat(record.commissionAmount) || 0;
  return Math.max(0, sales - comm);
};

export const getRecordCommission = record => {
  if (!record) return 0;
  if (
    record.commissionAmount !== undefined &&
    record.commissionAmount !== null &&
    record.commissionAmount !== ''
  ) {
    const parsed = parseFloat(record.commissionAmount);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const sales = getRecordSalesAmount(record);
  const billed = getRecordMerchantBill(record);
  return Math.max(0, sales - billed);
};

// Parse month from any date format.
export const isPriorMonth = (dateStr, targetMonth) => {
  if (!dateStr) return false;
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  const dMonthIdx = d.getMonth();
  const targetIdx = MONTHS.indexOf(targetMonth);
  return dMonthIdx < targetIdx;
};

export const isCurrentMonth = (dateStr, targetMonth) => {
  if (!dateStr) return false;
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return MONTHS[d.getMonth()] === targetMonth;
};

// Empty report shape used before a merchant is selected.
export const emptyMerchantBillReport = () => ({
  records: [],
  payments: [],
  totals: {
    sales: 0,
    totalBill: 0,
    billed: 0,
    commission: 0,
    commissionBill: 0,
    paid: 0,
    ending: 0,
  },
  totalMerchantRecords: 0,
});

// Build the per-merchant bill report (orders + payouts, optionally date-ranged).
export const buildMerchantBillReport = ({
  records = [],
  payments = [],
  merchant,
  startDate = '',
  endDate = '',
}) => {
  if (!merchant) return emptyMerchantBillReport();

  const allRecords = records
    .filter(r => merchantsMatch(r.merchantName, merchant))
    .sort((a, b) => compareDates(a.date, b.date));

  const allPayments = payments
    .filter(p => merchantsMatch(p.merchantName, merchant))
    .sort((a, b) => compareDates(a.date, b.date));

  const filteredRecords = allRecords.filter(r => {
    if (!startDate && !endDate) return true;
    return isDateInRange(r.date, startDate, endDate);
  });

  const filteredPayments = allPayments.filter(p => {
    if (!startDate && !endDate) return true;
    return isDateInRange(p.date, startDate, endDate);
  });

  let totalBill = 0;
  let commission = 0;
  let commissionBill = 0;
  let paid = 0;

  filteredRecords.forEach(r => {
    totalBill += getRecordSalesAmount(r);
    commission += getRecordCommission(r);
    commissionBill += getRecordMerchantBill(r);
  });

  filteredPayments.forEach(p => {
    paid += parseFloat(p.paidAmount) || 0;
  });

  return {
    records: filteredRecords,
    payments: filteredPayments,
    totals: {
      sales: totalBill,
      totalBill,
      commission,
      billed: commissionBill,
      commissionBill,
      paid,
      ending: commissionBill - paid,
    },
    totalMerchantRecords: allRecords.length,
  };
};

// Compile ledger stats per merchant based on selected month & carry-forward flag.
export const buildBillingLedger = ({
  records = [],
  payments = [],
  merchants = [],
  selectedMonth,
  carryForward,
}) => {
  const ledger = {};

  merchants.forEach(name => {
    ledger[name] = {
      name,
      priorBilled: 0,
      priorPaid: 0,
      currentBilled: 0,
      currentPaid: 0,
    };
  });

  // Aggregate Billed
  records.forEach(r => {
    if (!r.merchantName) return;
    if (!ledger[r.merchantName]) {
      ledger[r.merchantName] = {
        name: r.merchantName,
        priorBilled: 0,
        priorPaid: 0,
        currentBilled: 0,
        currentPaid: 0,
      };
    }
    const bill = parseFloat(r.merchantBill) || 0;

    const recordMonth = r.month || getMonthName(r.date);
    const targetIdx = MONTHS.indexOf(selectedMonth);
    const recordIdx = MONTHS.indexOf(recordMonth);

    if (recordIdx !== -1) {
      if (recordIdx < targetIdx) {
        ledger[r.merchantName].priorBilled += bill;
      } else if (recordIdx === targetIdx) {
        ledger[r.merchantName].currentBilled += bill;
      }
    }
  });

  // Aggregate Paid
  payments.forEach(p => {
    if (!p.merchantName) return;
    if (!ledger[p.merchantName]) {
      ledger[p.merchantName] = {
        name: p.merchantName,
        priorBilled: 0,
        priorPaid: 0,
        currentBilled: 0,
        currentPaid: 0,
      };
    }
    const paid = parseFloat(p.paidAmount) || 0;

    const paymentMonth = getMonthName(p.date);
    const targetIdx = MONTHS.indexOf(selectedMonth);
    const paymentIdx = MONTHS.indexOf(paymentMonth);

    if (paymentIdx !== -1) {
      if (paymentIdx < targetIdx) {
        ledger[p.merchantName].priorPaid += paid;
      } else if (paymentIdx === targetIdx) {
        ledger[p.merchantName].currentPaid += paid;
      }
    }
  });

  // Map to array and compute balances
  return Object.values(ledger).map(m => {
    const priorDue = m.priorBilled - m.priorPaid;
    const startingBalance = carryForward ? priorDue : 0;
    const endingBalance = startingBalance + m.currentBilled - m.currentPaid;

    return {
      ...m,
      startingBalance,
      totalBilled: m.currentBilled,
      totalPaid: m.currentPaid,
      endingBalance,
    };
  });
};

// Filter merchant list by search.
export const filterLedgerBySearch = (billingLedger = [], searchTerm = '') =>
  billingLedger.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

// Total metrics of the outstanding ledger.
export const computeAggregateTotals = (filteredLedger = [], payments = [], selectedMonth) => {
  let starting = 0;
  let billed = 0;
  let ending = 0;

  filteredLedger.forEach(m => {
    starting += m.startingBalance;
    billed += m.totalBilled;
    ending += m.endingBalance;
  });

  // Direct sum of payments in selected month (fallback if ledger month bucketing misses any)
  const directMonthPaid = payments.reduce((sum, p) => {
    const paymentMonth = getMonthFromDate(p.date);
    if (paymentMonth === selectedMonth) {
      return sum + (parseFloat(p.paidAmount) || 0);
    }
    return sum;
  }, 0);

  return {
    starting,
    billed,
    paid: directMonthPaid,
    ending,
  };
};
