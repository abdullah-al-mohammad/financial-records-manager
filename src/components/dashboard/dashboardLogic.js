import { MONTH_NAMES } from '../../utils/dates.js';

// Calendar order used for month-over-month aggregation and sorting.
export const MONTHS_ORDER = MONTH_NAMES;

// Format a number for display (0–2 decimal places, grouped).
export const formatAmount = n =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

// "2026-09" -> "September"
export const monthNameFromKey = key => {
  if (!key) return '';
  const [, m] = String(key).split('-');
  const idx = parseInt(m, 10) - 1;
  return idx >= 0 && idx < MONTHS_ORDER.length ? MONTHS_ORDER[idx] : key;
};

// Build a YYYY-MM key from a Date.
export const buildMonthKey = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

// Current calendar-month context (key, display name and year).
export const getMonthContext = (date = new Date()) => ({
  monthKey: buildMonthKey(date),
  monthName: date.toLocaleString('default', { month: 'long' }),
  year: date.getFullYear(),
});

// Normalise month keys coming from the backend ("2026-10-01T00:00:00" -> "2026-10").
export const normalizeMonthKey = value => {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{1,2})/);
  return match ? `${match[1]}-${match[2].padStart(2, '0')}` : '';
};

// Resolve the opening-balance record for a month. Google Sheets may return
// "2026-09-01T00:00:00" instead of "2026-09", so accept any prefix match.
export const findOpeningBalanceForMonth = (openingBalances, monthKey, fallback = null) =>
  (openingBalances || []).find(o => {
    const mk = String(o.monthKey || '').trim();
    return mk === monthKey || mk.startsWith(monthKey);
  }) ||
  fallback ||
  null;

// Opening balance that applies to a month. An exact record always wins. When
// the month has no record of its own, the most recent earlier opening balance
// carries forward until a new opening is recorded (or a fallback is supplied).
// This keeps the all-time cash total from silently dropping the opening amount
// when the calendar rolls into a new month.
export const resolveOpeningBalanceForMonth = (openingBalances, monthKey, fallback = null) => {
  const exact = findOpeningBalanceForMonth(openingBalances, monthKey, null);
  if (exact) return exact;
  if (fallback) return fallback;

  const targetKey = normalizeMonthKey(monthKey);
  if (!targetKey) return null;

  let candidate = null;
  let candidateKey = '';
  (openingBalances || []).forEach(o => {
    const key = normalizeMonthKey(o.monthKey);
    if (!key || key >= targetKey) return;
    if (key > candidateKey) {
      candidate = o;
      candidateKey = key;
    }
  });
  return candidate;
};

// Cash split derived from the computed net balance summary.
export const computePaymentTotals = balanceSummary => {
  const cash = parseFloat(balanceSummary?.cashBalance) || 0;
  const online = parseFloat(balanceSummary?.onlineBalance) || 0;
  const otherCash = parseFloat(balanceSummary?.otherCashBalance) || 0;
  const totalCash = cash + online + otherCash;
  return {
    cash,
    online,
    otherCash,
    totalCash,
  };
};

// Aggregate stats across all records, payments and Other Cash entries.
export const computeDashboardStats = (records, payments, otherCashRecords) => {
  let sales = 0;
  let commission = 0;
  let delivery = 0;
  let otherCash = 0;
  let riderSalaries = 0;
  let otherExpenses = 0;
  let fixedExpenses = 0;
  let discountExpenses = 0;
  let merchantBills = 0;
  let customerPaid = 0;

  records.forEach(r => {
    sales += parseFloat(r.salesAmount) || 0;
    commission += parseFloat(r.commissionAmount) || 0;
    delivery += parseFloat(r.deliveryCharge) || 0;
    riderSalaries += parseFloat(r.riderSalary) || 0;
    otherExpenses += parseFloat(r.otherExpense) || 0;
    fixedExpenses += parseFloat(r.fixedExpense) || 0;
    discountExpenses += parseFloat(r.discountAmount) || 0;
    merchantBills += parseFloat(r.merchantBill) || 0;
    customerPaid += parseFloat(r.paidByCustomer) || 0;
  });

  // Other Cash Collected = sum of all valid Other Cash section entries
  (otherCashRecords || []).forEach(r => {
    otherCash += parseFloat(r.amount) || 0;
  });

  const income = commission + delivery - discountExpenses;
  const expenses = riderSalaries + otherExpenses + fixedExpenses + discountExpenses;
  const netProfit = income - expenses;

  // Merchant balances
  const merchantTotals = {};
  records.forEach(r => {
    if (!r.merchantName) return;
    if (!merchantTotals[r.merchantName]) {
      merchantTotals[r.merchantName] = { billed: 0, paid: 0 };
    }
    merchantTotals[r.merchantName].billed += parseFloat(r.merchantBill) || 0;
  });

  payments.forEach(p => {
    if (!p.merchantName) return;
    if (!merchantTotals[p.merchantName]) {
      merchantTotals[p.merchantName] = { billed: 0, paid: 0 };
    }
    merchantTotals[p.merchantName].paid += parseFloat(p.paidAmount) || 0;
  });

  let totalDues = 0;
  Object.values(merchantTotals).forEach(m => {
    const balance = m.billed - m.paid;
    if (balance > 0) totalDues += balance;
  });

  return {
    sales,
    commission,
    delivery,
    income,
    otherCash,
    expenses,
    netProfit,
    totalDues,
    riderSalaries,
    otherExpenses,
    fixedExpenses,
    discountExpenses,
    merchantBills,
    customerPaid,
    merchantTotals,
  };
};

// Outstanding receivables awaiting collection
export const computePendingReceivables = receivables => {
  let total = 0;
  let count = 0;
  receivables.forEach(r => {
    if (r.status !== 'Received') {
      total += parseFloat(r.amount) || 0;
      count += 1;
    }
  });
  return { total, count };
};

// Outstanding payables awaiting payment (money owed to others)
export const computePendingPayables = payables => {
  let total = 0;
  let count = 0;
  payables.forEach(p => {
    if (p.status !== 'Paid') {
      total += parseFloat(p.amount) || 0;
      count += 1;
    }
  });
  return { total, count };
};

// MoM Aggregation (Last 5 active months)
export const computeMomData = records => {
  const monthsMap = {};
  records.forEach(r => {
    if (!r.month) return;
    if (!monthsMap[r.month]) {
      monthsMap[r.month] = { sales: 0, expenses: 0, income: 0 };
    }
    monthsMap[r.month].sales += parseFloat(r.salesAmount) || 0;
    monthsMap[r.month].income +=
      (parseFloat(r.commissionAmount) || 0) + (parseFloat(r.deliveryCharge) || 0);
    monthsMap[r.month].expenses +=
      (parseFloat(r.riderSalary) || 0) +
      (parseFloat(r.otherExpense) || 0) +
      (parseFloat(r.fixedExpense) || 0) +
      (parseFloat(r.discountAmount) || 0);
  });

  // Sort based on calendar order
  return Object.keys(monthsMap)
    .sort((a, b) => MONTHS_ORDER.indexOf(a) - MONTHS_ORDER.indexOf(b))
    .slice(-5)
    .map(month => ({
      month,
      sales: monthsMap[month].sales,
      expenses: monthsMap[month].expenses,
      income: monthsMap[month].income,
    }));
};

// Top Merchants Leaderboard
export const computeTopMerchants = records => {
  const merchants = {};
  records.forEach(r => {
    if (!r.merchantName) return;
    merchants[r.merchantName] =
      (merchants[r.merchantName] || 0) + (parseFloat(r.salesAmount) || 0);
  });
  return Object.entries(merchants)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
};

// Outstanding dues prior to the current month (previous month outstanding dues)
export const computePreviousMonthDues = (records, payments, now = new Date()) => {
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();

  const merchantPriorDues = {};

  records.forEach(r => {
    if (!r.merchantName) return;

    let isPrior = false;
    if (r.date) {
      const d = new Date(r.date.includes('T') ? r.date : r.date + 'T00:00:00');
      isPrior =
        d.getFullYear() < currentYear ||
        (d.getFullYear() === currentYear && d.getMonth() < currentMonthIdx);
    } else if (r.month) {
      const idx = MONTHS_ORDER.indexOf(r.month);
      isPrior = idx !== -1 && idx < currentMonthIdx;
    }

    if (isPrior) {
      if (!merchantPriorDues[r.merchantName]) {
        merchantPriorDues[r.merchantName] = { billed: 0, paid: 0 };
      }
      merchantPriorDues[r.merchantName].billed += parseFloat(r.merchantBill) || 0;
    }
  });

  payments.forEach(p => {
    if (!p.merchantName) return;

    let isPrior = false;
    if (p.date) {
      const d = new Date(p.date.includes('T') ? p.date : p.date + 'T00:00:00');
      isPrior =
        d.getFullYear() < currentYear ||
        (d.getFullYear() === currentYear && d.getMonth() < currentMonthIdx);
    }

    if (isPrior) {
      if (!merchantPriorDues[p.merchantName]) {
        merchantPriorDues[p.merchantName] = { billed: 0, paid: 0 };
      }
      merchantPriorDues[p.merchantName].paid += parseFloat(p.paidAmount) || 0;
    }
  });

  return Object.entries(merchantPriorDues)
    .map(([name, data]) => ({
      name,
      due: data.billed - data.paid,
    }))
    .filter(m => m.due > 0)
    .sort((a, b) => b.due - a.due);
};

// Expense breakdown calculations for Donut chart SVG
export const computeExpensePieData = stats => {
  const total =
    stats.riderSalaries +
    stats.fixedExpenses +
    stats.otherExpenses +
    (stats.discountExpenses || 0);
  if (total === 0) return [];

  return [
    {
      name: 'Rider Salaries',
      value: stats.riderSalaries,
      color: '#f43f5e',
      percentage: (stats.riderSalaries / total) * 100,
    },
    {
      name: 'Fixed Expenses',
      value: stats.fixedExpenses,
      color: '#eab308',
      percentage: (stats.fixedExpenses / total) * 100,
    },
    {
      name: 'Other Expenses',
      value: stats.otherExpenses,
      color: '#a855f7',
      percentage: (stats.otherExpenses / total) * 100,
    },
    {
      name: 'Sales Discounts',
      value: stats.discountExpenses || 0,
      color: '#10b981',
      percentage: ((stats.discountExpenses || 0) / total) * 100,
    },
  ].filter(item => item.value > 0);
};

// Safe max calculation for MoM chart scaling
export const computeMaxMomVal = momData => {
  const values = momData.flatMap(d => [d.sales, d.expenses]);
  return values.length > 0 ? Math.max(...values) * 1.15 : 10000;
};
