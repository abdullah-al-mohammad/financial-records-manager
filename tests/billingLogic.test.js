import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBillingLedger,
  buildMerchantBillReport,
  computeAggregateTotals,
  emptyMerchantBillReport,
  filterLedgerBySearch,
  formatOrderDetails,
  getRecordCommission,
  getRecordMerchantBill,
  getRecordSalesAmount,
  isCurrentMonth,
  isPriorMonth,
  merchantsMatch,
} from '../src/components/billing/billingLogic.js';

const record = (overrides = {}) => ({
  id: 'r1',
  merchantName: 'Alpha',
  date: '2026-02-10',
  merchantBill: '100',
  ...overrides,
});

const payment = (overrides = {}) => ({
  id: 'p1',
  merchantName: 'Alpha',
  date: '2026-02-20',
  paidAmount: '30',
  ...overrides,
});

test('record helpers fall back to the stored bill and commission fields', () => {
  const full = { salesAmount: '1000', commissionAmount: '100', merchantBill: '900' };
  assert.equal(getRecordSalesAmount(full), 1000);
  assert.equal(getRecordMerchantBill(full), 900);
  assert.equal(getRecordCommission(full), 100);

  const missingBill = { salesAmount: '1000', commissionAmount: '100', merchantBill: '0' };
  assert.equal(getRecordMerchantBill(missingBill), 900);
  assert.equal(getRecordCommission(missingBill), 100);

  const missingCommission = { salesAmount: '1000', merchantBill: '900' };
  assert.equal(getRecordCommission(missingCommission), 100);

  const noSales = { merchantBill: '700', commissionAmount: '30' };
  assert.equal(getRecordSalesAmount(noSales), 730);
  assert.equal(getRecordMerchantBill(noSales), 700);

  assert.equal(getRecordSalesAmount(null), 0);
  assert.equal(getRecordMerchantBill(null), 0);
  assert.equal(getRecordCommission(null), 0);
});

test('formatOrderDetails joins the descriptive fields', () => {
  assert.equal(
    formatOrderDetails({
      salesType: 'Regular',
      digitalPaymentMethod: 'bKash',
      expenseDescription: 'Delivery',
      riderName: 'Rahim',
    }),
    'Regular · bKash · Delivery · Rider: Rahim'
  );
  assert.equal(formatOrderDetails({}), '—');
});

test('merchant matching and month helpers normalise values', () => {
  assert.equal(merchantsMatch('  Alpha ', 'alpha'), true);
  assert.equal(merchantsMatch('Alpha', 'Beta'), false);
  assert.equal(merchantsMatch(null, ''), true);

  assert.equal(isPriorMonth('2026-01-05', 'February'), true);
  assert.equal(isPriorMonth('2026-03-05', 'February'), false);
  assert.equal(isPriorMonth('', 'February'), false);

  assert.equal(isCurrentMonth('2026-02-05', 'February'), true);
  assert.equal(isCurrentMonth('2026-02-05', 'March'), false);
});

test('billing ledger buckets prior/current months and applies carry-forward', () => {
  const records = [
    record({ id: 'r1', merchantBill: '100' }),
    record({ id: 'r2', date: '2026-01-05', merchantBill: '50' }),
    record({ id: 'r3', date: '2026-03-05', merchantBill: '999' }),
    record({ id: 'r4', merchantName: 'Beta', date: '2026-02-11', merchantBill: '200' }),
  ];
  const payments = [
    payment({ id: 'p1', date: '2026-01-20', paidAmount: '20' }),
    payment({ id: 'p2' }),
    payment({ id: 'p3', merchantName: 'Beta', date: '2026-02-21', paidAmount: '40' }),
    payment({ id: 'p4', merchantName: 'Gamma', date: '2026-02-22', paidAmount: '10' }),
  ];

  const ledger = buildBillingLedger({
    records,
    payments,
    merchants: ['Alpha', 'Beta'],
    selectedMonth: 'February',
    carryForward: true,
  });

  const byName = Object.fromEntries(ledger.map(m => [m.name, m]));

  assert.deepEqual(
    {
      starting: byName.Alpha.startingBalance,
      billed: byName.Alpha.totalBilled,
      paid: byName.Alpha.totalPaid,
      ending: byName.Alpha.endingBalance,
    },
    { starting: 30, billed: 100, paid: 30, ending: 100 }
  );

  assert.equal(byName.Beta.startingBalance, 0);
  assert.equal(byName.Beta.endingBalance, 160);

  // Future-month bills are ignored, but payments from unknown merchants are tracked.
  assert.equal(byName.Gamma.startingBalance, 0);
  assert.equal(byName.Gamma.endingBalance, -10);
  assert.equal(byName.Alpha.priorBilled, 50);

  const isolated = buildBillingLedger({
    records,
    payments,
    merchants: ['Alpha', 'Beta'],
    selectedMonth: 'February',
    carryForward: false,
  });
  const isolatedAlpha = isolated.find(m => m.name === 'Alpha');
  assert.equal(isolatedAlpha.startingBalance, 0);
  assert.equal(isolatedAlpha.endingBalance, 70);
});

test('ledger search filters by merchant name case-insensitively', () => {
  const ledger = [{ name: 'Alpha Traders' }, { name: 'Beta Shop' }];
  assert.deepEqual(
    filterLedgerBySearch(ledger, 'alpha').map(m => m.name),
    ['Alpha Traders']
  );
  assert.deepEqual(
    filterLedgerBySearch(ledger, 'BETA').map(m => m.name),
    ['Beta Shop']
  );
  assert.equal(filterLedgerBySearch(ledger, '').length, 2);
});

test('aggregate totals sum the filtered ledger and direct month payments', () => {
  const ledger = [
    { startingBalance: 30, totalBilled: 100, totalPaid: 30, endingBalance: 100 },
    { startingBalance: 0, totalBilled: 200, totalPaid: 40, endingBalance: 160 },
    { startingBalance: 0, totalBilled: 0, totalPaid: 10, endingBalance: -10 },
  ];
  const payments = [
    payment({ id: 'p1', date: '2026-01-20', paidAmount: '20' }),
    payment({ id: 'p2' }),
    payment({ id: 'p3', merchantName: 'Beta', date: '2026-02-21', paidAmount: '40' }),
    payment({ id: 'p4', merchantName: 'Gamma', date: '2026-02-22', paidAmount: '10' }),
  ];

  assert.deepEqual(computeAggregateTotals(ledger, payments, 'February'), {
    starting: 30,
    billed: 300,
    paid: 80,
    ending: 250,
  });
});

test('merchant bill report returns an empty shape without a merchant', () => {
  assert.deepEqual(buildMerchantBillReport({ records: [], payments: [], merchant: '' }), {
    ...emptyMerchantBillReport(),
  });
});

test('merchant bill report filters by merchant and optional date range', () => {
  const records = [
    record({ id: 'r1', merchantBill: '100' }),
    record({ id: 'r2', date: '2026-01-05', merchantBill: '50' }),
    record({ id: 'r3', merchantName: 'Beta', merchantBill: '999' }),
    record({ id: 'r4', merchantName: ' alpha ', merchantBill: '25' }),
  ];
  const payments = [
    payment({ id: 'p1', date: '2026-01-20', paidAmount: '20' }),
    payment({ id: 'p2' }),
    payment({ id: 'p3', merchantName: 'Beta', paidAmount: '40' }),
  ];

  const all = buildMerchantBillReport({ records, payments, merchant: 'Alpha' });
  assert.deepEqual(
    all.records.map(r => r.id),
    ['r2', 'r1', 'r4']
  );
  assert.deepEqual(
    all.payments.map(p => p.id),
    ['p1', 'p2']
  );
  assert.equal(all.totals.commissionBill, 175);
  assert.equal(all.totals.paid, 50);
  assert.equal(all.totals.ending, 125);
  assert.equal(all.totalMerchantRecords, 3);

  const ranged = buildMerchantBillReport({
    records,
    payments,
    merchant: 'Alpha',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
  });
  assert.deepEqual(
    ranged.records.map(r => r.id),
    ['r1', 'r4']
  );
  assert.deepEqual(
    ranged.payments.map(p => p.id),
    ['p2']
  );
  assert.equal(ranged.totals.commissionBill, 125);
  assert.equal(ranged.totals.paid, 30);
  assert.equal(ranged.totals.ending, 95);
  assert.equal(ranged.totalMerchantRecords, 3);
});
