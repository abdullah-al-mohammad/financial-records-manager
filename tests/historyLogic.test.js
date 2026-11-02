import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMonthlyMetricsSummary,
  buildTargetMonthData,
  collectAvailableMonths,
} from '../src/components/history/historyLogic.js';

test('available months combine records, payments and transfers in calendar order', () => {
  const records = [
    { month: 'March', date: '2026-03-10' },
    { date: '2026-01-10' },
    { month: 'March', date: '2026-04-10' },
  ];
  const payments = [{ date: '2026-02-10' }];
  const transfers = [{ date: '2026-02-15' }, { date: '' }];

  assert.deepEqual(collectAvailableMonths(records, payments, transfers), [
    'January',
    'February',
    'March',
  ]);
});

test('monthly metrics summary aggregates sales, income and expenses', () => {
  const records = [
    {
      month: 'January',
      salesAmount: '1000',
      commissionAmount: '100',
      deliveryCharge: '20',
      merchantBill: '900',
      riderSalary: '50',
      otherExpense: '10',
      fixedExpense: '5',
      discountAmount: '5',
    },
    {
      date: '2026-01-20',
      salesAmount: '500',
      commissionAmount: '50',
      deliveryCharge: '0',
      merchantBill: '450',
      riderSalary: '0',
      otherExpense: '0',
      fixedExpense: '0',
      discountAmount: '0',
    },
    {
      month: 'March',
      salesAmount: '200',
      commissionAmount: '20',
      deliveryCharge: '5',
      merchantBill: '180',
    },
    { date: '' },
  ];

  const summary = buildMonthlyMetricsSummary(records);
  assert.deepEqual(
    summary.map(m => m.month),
    ['January', 'March']
  );

  const jan = summary[0];
  assert.equal(jan.sales, 1500);
  assert.equal(jan.billed, 1350);
  assert.equal(jan.commission, 150);
  assert.equal(jan.delivery, 20);
  assert.equal(jan.expenses, 70);
  assert.equal(jan.income, 170);
  assert.equal(jan.profit, 100);

  const mar = summary[1];
  assert.equal(mar.income, 25);
  assert.equal(mar.expenses, 0);
  assert.equal(mar.profit, 25);
});

test('target month data filters records, payments and transfers with metrics', () => {
  const records = [
    { id: 'a', month: 'January', date: '2026-01-10', salesAmount: '1000' },
    { id: 'b', date: '2026-01-20', salesAmount: '500' },
    { id: 'c', month: 'March', date: '2026-03-10', salesAmount: '900' },
    { id: 'd', date: '', salesAmount: '1' },
  ];
  const payments = [
    { id: 'p1', date: '2026-01-05', paidAmount: '100' },
    { id: 'p2', date: '2026-02-05', paidAmount: '200' },
  ];
  const transfers = [
    { id: 't1', date: '2026-01-06', amount: '50' },
    { id: 't2', date: '2026-02-06', amount: '70' },
  ];

  assert.equal(buildTargetMonthData({ records, payments, transfers, selectedMonth: '' }), null);

  const data = buildTargetMonthData({ records, payments, transfers, selectedMonth: 'January' });
  assert.deepEqual(
    data.records.map(r => r.id),
    ['a', 'b']
  );
  assert.deepEqual(
    data.payments.map(p => p.id),
    ['p1']
  );
  assert.deepEqual(
    data.transfers.map(t => t.id),
    ['t1']
  );
  assert.equal(data.sales, 1500);
  assert.equal(data.income, 0);
  assert.equal(data.expenses, 0);
  assert.equal(data.profit, 0);
  assert.equal(data.transferTotal, 50);
});
