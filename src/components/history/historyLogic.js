import { getMonthFromDate } from '../../utils/dates.js';

// Chronological month order used by the archive explorer.
export const MONTHS_ORDER = [
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

// Extract all unique months present in data.
export const collectAvailableMonths = (records = [], payments = [], transfers = []) => {
  const months = new Set();

  records.forEach(r => {
    if (r.month) months.add(r.month);
    else if (r.date) {
      const monthName = getMonthFromDate(r.date);
      if (monthName) months.add(monthName);
    }
  });

  payments.forEach(p => {
    const monthName = getMonthFromDate(p.date);
    if (monthName) months.add(monthName);
  });

  transfers.forEach(t => {
    const monthName = getMonthFromDate(t.date);
    if (monthName) months.add(monthName);
  });

  return Array.from(months).sort((a, b) => MONTHS_ORDER.indexOf(a) - MONTHS_ORDER.indexOf(b));
};

// Compile monthly performance logs for all available months.
export const buildMonthlyMetricsSummary = (records = []) => {
  const summaries = {};

  records.forEach(r => {
    const month = r.month || getMonthFromDate(r.date);
    if (!month) return;
    if (!summaries[month]) {
      summaries[month] = {
        month,
        sales: 0,
        billed: 0,
        commission: 0,
        delivery: 0,
        expenses: 0,
        income: 0,
        profit: 0,
      };
    }
    summaries[month].sales += parseFloat(r.salesAmount) || 0;
    summaries[month].commission += parseFloat(r.commissionAmount) || 0;
    summaries[month].delivery += parseFloat(r.deliveryCharge) || 0;
    summaries[month].billed += parseFloat(r.merchantBill) || 0;
    summaries[month].expenses +=
      (parseFloat(r.riderSalary) || 0) +
      (parseFloat(r.otherExpense) || 0) +
      (parseFloat(r.fixedExpense) || 0) +
      (parseFloat(r.discountAmount) || 0);
  });

  // Compute derived metrics and store them back
  Object.keys(summaries).forEach(m => {
    const s = summaries[m];
    s.income = s.commission + s.delivery;
    s.profit = s.income - s.expenses;
  });

  return Object.values(summaries).sort(
    (a, b) => MONTHS_ORDER.indexOf(a.month) - MONTHS_ORDER.indexOf(b.month)
  );
};

// Records, payments, transfers and metrics for the selected month.
export const buildTargetMonthData = ({
  records = [],
  payments = [],
  transfers = [],
  selectedMonth,
}) => {
  if (!selectedMonth) return null;

  const filteredRecords = records.filter(r => {
    if (r.month) return r.month === selectedMonth;
    if (!r.date) return false;
    return getMonthFromDate(r.date) === selectedMonth;
  });

  const filteredPayments = payments.filter(p => {
    if (!p.date) return false;
    return getMonthFromDate(p.date) === selectedMonth;
  });

  // Calculate metrics
  let sales = 0;
  let commission = 0;
  let delivery = 0;
  let riderSalary = 0;
  let otherExpense = 0;
  let fixedExpense = 0;
  let discountAmount = 0;

  filteredRecords.forEach(r => {
    sales += parseFloat(r.salesAmount) || 0;
    commission += parseFloat(r.commissionAmount) || 0;
    delivery += parseFloat(r.deliveryCharge) || 0;
    riderSalary += parseFloat(r.riderSalary) || 0;
    otherExpense += parseFloat(r.otherExpense) || 0;
    fixedExpense += parseFloat(r.fixedExpense) || 0;
    discountAmount += parseFloat(r.discountAmount) || 0;
  });

  const expenses = riderSalary + otherExpense + fixedExpense + discountAmount;
  const income = commission + delivery;
  const profit = income - expenses;

  const filteredTransfers = transfers.filter(t => {
    if (!t.date) return false;
    return getMonthFromDate(t.date) === selectedMonth;
  });

  const transferTotal = filteredTransfers.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);

  return {
    records: filteredRecords,
    payments: filteredPayments,
    transfers: filteredTransfers,
    sales,
    commission,
    delivery,
    expenses,
    income,
    profit,
    transferTotal,
  };
};
