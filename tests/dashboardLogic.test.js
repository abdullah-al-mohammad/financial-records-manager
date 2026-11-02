import test from 'node:test';
import assert from 'node:assert/strict';

const {
  buildMonthKey,
  computeDashboardStats,
  computeExpensePieData,
  computeMaxMomVal,
  computeMomData,
  computePaymentTotals,
  computePendingPayables,
  computePendingReceivables,
  computePreviousMonthDues,
  computeTopMerchants,
  findOpeningBalanceForMonth,
  formatAmount,
  getMonthContext,
  monthNameFromKey,
  normalizeMonthKey,
  resolveOpeningBalanceForMonth,
} = await import('../src/components/dashboard/dashboardLogic.js');
const { computeNetCashBalance } = await import('../src/utils/finance.js');

const makeRecord = (overrides = {}) => ({
  id: 'rec-1',
  date: '2026-05-10T10:00',
  month: 'May',
  merchantName: 'Alpha',
  salesAmount: '1000',
  commissionAmount: '150',
  deliveryCharge: '50',
  riderSalary: '100',
  otherExpense: '20',
  fixedExpense: '30',
  discountAmount: '10',
  merchantBill: '850',
  paidByCustomer: '1040',
  ...overrides,
});

test('formatAmount and month-key helpers format values and keys', () => {
  assert.equal(formatAmount(1234.5), '1,234.5');
  assert.equal(formatAmount(''), '0');
  assert.equal(formatAmount(null), '0');

  assert.equal(buildMonthKey(new Date(2026, 8, 15)), '2026-09');
  assert.equal(monthNameFromKey('2026-09'), 'September');
  assert.equal(monthNameFromKey('2026-13'), '2026-13');
  assert.equal(monthNameFromKey(null), '');

  const context = getMonthContext(new Date(2026, 8, 15));
  assert.equal(context.monthKey, '2026-09');
  assert.equal(context.year, 2026);
  assert.equal(context.monthName, 'September');
});

test('findOpeningBalanceForMonth accepts prefix keys and falls back', () => {
  const balances = [
    { id: 'ob-1', monthKey: '2026-08', handCash: 10 },
    { id: 'ob-2', monthKey: '2026-09-01T00:00:00', handCash: 20 },
  ];

  assert.equal(findOpeningBalanceForMonth(balances, '2026-09').id, 'ob-2');
  assert.equal(findOpeningBalanceForMonth(balances, '2026-10', { id: 'fallback' }).id, 'fallback');
  assert.equal(findOpeningBalanceForMonth([], '2026-09'), null);
});

test('normalizeMonthKey handles backend and calendar month formats', () => {
  assert.equal(normalizeMonthKey('2026-10-01T00:00:00'), '2026-10');
  assert.equal(normalizeMonthKey('2026-10'), '2026-10');
  assert.equal(normalizeMonthKey('2026-1'), '2026-01');
  assert.equal(normalizeMonthKey(''), '');
  assert.equal(normalizeMonthKey(null), '');
});

test('resolveOpeningBalanceForMonth carries the latest earlier opening into a new month', () => {
  const balances = [
    { id: 'ob-aug', monthKey: '2026-08', handCash: 10 },
    { id: 'ob-sep', monthKey: '2026-09-01T00:00:00', handCash: 20 },
    { id: 'ob-dec', monthKey: '2026-12', handCash: 30 },
  ];

  // Exact month always wins.
  assert.equal(resolveOpeningBalanceForMonth(balances, '2026-09').id, 'ob-sep');
  assert.equal(resolveOpeningBalanceForMonth(balances, '2026-08').id, 'ob-aug');

  // No record for the current month -> latest earlier opening is reused.
  assert.equal(resolveOpeningBalanceForMonth(balances, '2026-11').id, 'ob-sep');

  // Future openings are never applied backwards.
  assert.equal(resolveOpeningBalanceForMonth(balances, '2026-07'), null);

  // An explicit fallback still takes precedence over the carry-forward.
  assert.equal(
    resolveOpeningBalanceForMonth(balances, '2026-11', { id: 'fallback' }).id,
    'fallback'
  );
  assert.equal(resolveOpeningBalanceForMonth([], '2026-11'), null);
});

test('month rollover keeps the previous opening balance in the cash total', () => {
  // Regression: on 1 November the dashboard looked up "2026-11", found no
  // opening record, and silently dropped the October opening of ৳7,463.
  const octoberOpening = {
    id: 'ob-oct',
    monthKey: '2026-10-01T00:00:00',
    month: 'October',
    year: '2026',
    handCash: '7463',
    onlineCash: '',
    otherCash: '',
  };

  const resolved = resolveOpeningBalanceForMonth([octoberOpening], '2026-11');
  assert.equal(resolved?.id, 'ob-oct');

  const withoutOpening = computeNetCashBalance([], [], [], [], [], null);
  const withOpening = computeNetCashBalance([], [], [], [], [], resolved);

  assert.equal(withoutOpening.cashBalance, 0);
  assert.equal(withOpening.cashBalance, 7463);
  assert.equal(withOpening.netRemaining, 7463);
});

test('computePaymentTotals splits the net balance summary into cash buckets', () => {
  assert.deepEqual(
    computePaymentTotals({ cashBalance: '100.5', onlineBalance: '200', otherCashBalance: 50 }),
    { cash: 100.5, online: 200, otherCash: 50, totalCash: 350.5 }
  );
  assert.deepEqual(computePaymentTotals(null), {
    cash: 0,
    online: 0,
    otherCash: 0,
    totalCash: 0,
  });
});

test('computeDashboardStats aggregates sales, expenses and merchant dues', () => {
  const records = [
    makeRecord(),
    makeRecord({
      id: 'rec-2',
      salesAmount: '500',
      commissionAmount: '75',
      deliveryCharge: '0',
      riderSalary: '0',
      otherExpense: '0',
      fixedExpense: '0',
      discountAmount: '0',
      merchantBill: '425',
      paidByCustomer: '500',
    }),
  ];
  const payments = [{ merchantName: 'Alpha', paidAmount: '1000' }];
  const otherCashRecords = [{ amount: '200' }, { amount: '50' }];

  const stats = computeDashboardStats(records, payments, otherCashRecords);

  assert.equal(stats.sales, 1500);
  assert.equal(stats.commission, 225);
  assert.equal(stats.delivery, 50);
  assert.equal(stats.otherCash, 250);
  assert.equal(stats.riderSalaries, 100);
  assert.equal(stats.otherExpenses, 20);
  assert.equal(stats.fixedExpenses, 30);
  assert.equal(stats.discountExpenses, 10);
  assert.equal(stats.merchantBills, 1275);
  assert.equal(stats.customerPaid, 1540);
  assert.equal(stats.income, 265);
  assert.equal(stats.expenses, 160);
  assert.equal(stats.netProfit, 105);
  assert.equal(stats.totalDues, 275);
  assert.equal(stats.merchantTotals.Alpha.billed, 1275);
  assert.equal(stats.merchantTotals.Alpha.paid, 1000);
});

test('pending receivables and payables ignore settled entries', () => {
  assert.deepEqual(
    computePendingReceivables([
      { amount: '100', status: 'Pending' },
      { amount: '50', status: 'Received' },
      { amount: '25' },
    ]),
    { total: 125, count: 2 }
  );

  assert.deepEqual(
    computePendingPayables([
      { amount: '200', status: 'Paid' },
      { amount: '75', status: 'Pending' },
    ]),
    { total: 75, count: 1 }
  );
});

test('computeMomData sorts by calendar order and keeps the last five months', () => {
  const records = [
    makeRecord({ month: 'June', salesAmount: '600', riderSalary: '60' }),
    makeRecord({ month: 'January', salesAmount: '100', riderSalary: '10' }),
    makeRecord({ month: 'March', salesAmount: '300', riderSalary: '30' }),
    makeRecord({ month: 'May', salesAmount: '500', riderSalary: '50' }),
    makeRecord({ month: 'February', salesAmount: '200', riderSalary: '20' }),
    makeRecord({ month: 'April', salesAmount: '400', riderSalary: '40' }),
  ];

  const data = computeMomData(records);
  assert.deepEqual(
    data.map(d => d.month),
    ['February', 'March', 'April', 'May', 'June']
  );
  assert.equal(data[0].sales, 200);
  assert.equal(data[4].sales, 600);
  assert.equal(data[4].expenses, 120);
});

test('computeTopMerchants ranks by sales and keeps the top five', () => {
  const records = [
    makeRecord({ merchantName: 'A', salesAmount: '100' }),
    makeRecord({ merchantName: 'B', salesAmount: '300' }),
    makeRecord({ merchantName: 'A', salesAmount: '50' }),
    makeRecord({ merchantName: '', salesAmount: '999' }),
  ];

  assert.deepEqual(computeTopMerchants(records), [
    { name: 'B', sales: 300 },
    { name: 'A', sales: 150 },
  ]);
});

test('computePreviousMonthDues only counts records/payments before the current month', () => {
  const now = new Date(2026, 5, 15); // June 2026
  const records = [
    makeRecord({ id: 'may', merchantName: 'Alpha', date: '2026-05-10T10:00', merchantBill: '100' }),
    makeRecord({ id: 'june', merchantName: 'Alpha', date: '2026-06-02T10:00', merchantBill: '500' }),
    makeRecord({ id: 'old', merchantName: 'Beta', date: '2025-12-01T10:00', merchantBill: '200' }),
    makeRecord({ id: 'month-only', merchantName: 'Gamma', date: '', month: 'April', merchantBill: '80' }),
  ];
  const payments = [
    { merchantName: 'Alpha', date: '2026-05-20T10:00', paidAmount: '40' },
    { merchantName: 'Beta', date: '2026-06-03T10:00', paidAmount: '20' },
  ];

  assert.deepEqual(computePreviousMonthDues(records, payments, now), [
    { name: 'Beta', due: 200 },
    { name: 'Gamma', due: 80 },
    { name: 'Alpha', due: 60 },
  ]);
});

test('computeExpensePieData builds four filtered slices and max scaling', () => {
  const stats = {
    riderSalaries: 100,
    fixedExpenses: 30,
    otherExpenses: 20,
    discountExpenses: 10,
  };
  const pie = computeExpensePieData(stats);

  assert.equal(pie.length, 4);
  assert.equal(pie[0].name, 'Rider Salaries');
  assert.equal(pie[0].percentage, 62.5);
  assert.equal(pie[3].name, 'Sales Discounts');
  assert.equal(pie[3].percentage, 6.25);

  assert.deepEqual(
    computeExpensePieData({
      riderSalaries: 0,
      fixedExpenses: 0,
      otherExpenses: 0,
      discountExpenses: 0,
    }),
    []
  );

  const maxMoMVal = computeMaxMomVal([
    { sales: 100, expenses: 50 },
    { sales: 200, expenses: 20 },
  ]);
  assert.ok(Math.abs(maxMoMVal - 230) < 1e-9);
  assert.equal(computeMaxMomVal([]), 10000);
});
