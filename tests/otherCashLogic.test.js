import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildOtherCashPayload,
  filterOtherCashRecords,
  summarizeOtherCashRecords,
} from '../src/components/otherCash/otherCashLogic.js';

const records = [
  { id: 'oc1', month: 'January', source: 'Petty Cash', description: 'Float', type: 'Income', amount: '500' },
  { id: 'oc2', month: 'January', source: 'Reserve Fund', description: 'Top up', type: 'Expense', amount: '200.50' },
  { id: 'oc3', month: 'March', source: 'Misc', description: 'Snacks', type: 'Expense', amount: '49.50' },
];

test('filters other cash records by search text', () => {
  assert.deepEqual(
    filterOtherCashRecords(records, { searchTerm: 'PETTY' }).map(r => r.id),
    ['oc1']
  );
  assert.deepEqual(
    filterOtherCashRecords(records, { searchTerm: 'top up' }).map(r => r.id),
    ['oc2']
  );
  assert.deepEqual(filterOtherCashRecords(records, { searchTerm: 'missing' }), []);
});

test('filters other cash records by month and type', () => {
  assert.deepEqual(
    filterOtherCashRecords(records, { filterMonth: 'January' }).map(r => r.id),
    ['oc1', 'oc2']
  );
  assert.deepEqual(
    filterOtherCashRecords(records, { filterType: 'Expense' }).map(r => r.id),
    ['oc2', 'oc3']
  );
  assert.deepEqual(
    filterOtherCashRecords(records, { filterMonth: 'January', filterType: 'Expense' }).map(r => r.id),
    ['oc2']
  );
  assert.equal(filterOtherCashRecords(records, { filterMonth: 'All', filterType: 'All' }).length, 3);
});

test('summaries income, expense and net balance from filtered records', () => {
  const summary = summarizeOtherCashRecords(records);

  assert.equal(summary.totalIncome, 500);
  assert.equal(summary.totalExpense, 250);
  assert.equal(summary.netBalance, 250);

  const januaryExpenses = summarizeOtherCashRecords(
    filterOtherCashRecords(records, { filterMonth: 'January', filterType: 'Expense' })
  );
  assert.equal(januaryExpenses.totalIncome, 0);
  assert.equal(januaryExpenses.totalExpense, 200.5);
  assert.equal(januaryExpenses.netBalance, -200.5);
});

test('summaries treat missing or invalid amounts as zero', () => {
  const summary = summarizeOtherCashRecords([
    { type: 'Income', amount: 'abc' },
    { type: 'Expense' },
  ]);

  assert.equal(summary.totalIncome, 0);
  assert.equal(summary.totalExpense, 0);
  assert.equal(summary.netBalance, 0);
});

test('buildOtherCashPayload normalises fields for the API', () => {
  const payload = buildOtherCashPayload(
    { date: '2026-01-10', month: 'January', source: 'Petty Cash', amount: 100.5, description: '', type: 'Income' },
    { id: 'oc9', editingId: null }
  );

  assert.equal(payload.id, 'oc9');
  assert.equal(payload.date, '2026-01-10');
  assert.equal(payload.month, 'January');
  assert.equal(payload.source, 'Petty Cash');
  assert.equal(payload.amount, '100.5');
  assert.equal(payload.description, '');
  assert.equal(payload.type, 'Income');
  assert.equal(typeof payload.createdAt, 'string');
});

test('buildOtherCashPayload preserves createdAt when editing', () => {
  const payload = buildOtherCashPayload(
    {
      date: '2026-01-10',
      month: 'January',
      source: 'Petty Cash',
      amount: '50',
      description: 'note',
      type: 'Expense',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    { id: 'oc1', editingId: 'oc1' }
  );

  assert.equal(payload.createdAt, '2026-01-01T00:00:00.000Z');
  assert.equal(payload.amount, '50');
});
