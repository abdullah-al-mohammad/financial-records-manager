import test from 'node:test';
import assert from 'node:assert/strict';

function createMockStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

globalThis.localStorage = createMockStorage();
globalThis.sessionStorage = createMockStorage();

const {
  buildPayablePayload,
  buildPayPayload,
  buildReceivePayload,
  buildReceivablePayload,
  buildRevertedPayable,
  buildRevertedReceivable,
  computePayableStats,
  computeReceivableStats,
  emptyPayableForm,
  emptyReceivableForm,
  emptyReceiveForm,
  filterPayables,
  filterReceivables,
  normalizeAccount,
  payableFormFromRecord,
  receivableFormFromRecord,
} = await import('../src/components/receivable/receivableLogic.js');

const recv = (overrides = {}) => ({
  id: 'r1',
  name: 'Alpha Traders',
  amount: '100',
  date: '2026-01-10',
  note: 'invoice',
  status: 'Not Received',
  receivedAccount: null,
  receivedDate: null,
  ...overrides,
});

const payable = (overrides = {}) => ({
  id: 'p1',
  name: 'Beta Supplier',
  amount: '200',
  date: '2026-02-10',
  note: 'stock',
  status: 'Unpaid',
  paidAccount: null,
  paidDate: null,
  ...overrides,
});

test('form defaults expose the expected fields and date key', () => {
  const form = emptyReceivableForm();
  assert.deepEqual(Object.keys(form), [
    'name',
    'amount',
    'date',
    'note',
    'status',
    'receivedAccount',
  ]);
  assert.match(form.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(form.status, 'Not Received');
  assert.equal(form.receivedAccount, 'cash');

  const payForm = emptyPayableForm();
  assert.equal(payForm.status, 'Unpaid');
  assert.equal(payForm.paidAccount, 'cash');

  const receiveForm = emptyReceiveForm({ note: 'existing note' });
  assert.equal(receiveForm.receiptNote, 'existing note');
});

test('form mapping converts stored dates back to date inputs', () => {
  assert.deepEqual(receivableFormFromRecord(recv({ receivedAccount: 'online' })), {
    name: 'Alpha Traders',
    amount: '100',
    date: '2026-01-10',
    note: 'invoice',
    status: 'Not Received',
    receivedAccount: 'online',
  });

  assert.deepEqual(payableFormFromRecord(payable({ status: 'Paid', paidAccount: 'cash' })), {
    name: 'Beta Supplier',
    amount: '200',
    date: '2026-02-10',
    note: 'stock',
    status: 'Paid',
    paidAccount: 'cash',
  });
});

test('normalizeAccount handles legacy Other Cash labels', () => {
  assert.equal(normalizeAccount('Other Cash'), 'other cash');
  assert.equal(normalizeAccount(undefined), 'cash');
  assert.equal(normalizeAccount(' ONLINE '), 'online');
});

test('receivable stats split received amounts by account', () => {
  const stats = computeReceivableStats([
    recv({ amount: '100', status: 'Received', receivedAccount: 'cash' }),
    recv({ id: 'r2', amount: '50', status: 'Received', receivedAccount: 'online' }),
    recv({ id: 'r3', amount: '25', status: 'Received', receivedAccount: 'Other Cash' }),
    recv({ id: 'r4', amount: '75' }),
  ]);

  assert.equal(stats.total, 250);
  assert.equal(stats.received, 175);
  assert.equal(stats.pending, 75);
  assert.equal(stats.receivedCount, 3);
  assert.equal(stats.pendingCount, 1);
  assert.equal(stats.receivedInCash, 100);
  assert.equal(stats.receivedInOnline, 50);
  assert.equal(stats.receivedInOtherCash, 25);
});

test('payable stats split paid amounts by account', () => {
  const stats = computePayableStats([
    payable({ amount: '100', status: 'Paid', paidAccount: 'cash' }),
    payable({ id: 'p2', amount: '40', status: 'Paid', paidAccount: 'other_cash' }),
    payable({ id: 'p3', amount: '60' }),
  ]);

  assert.equal(stats.total, 200);
  assert.equal(stats.paid, 140);
  assert.equal(stats.unpaid, 60);
  assert.equal(stats.paidCount, 2);
  assert.equal(stats.unpaidCount, 1);
  assert.equal(stats.paidInCash, 100);
  assert.equal(stats.paidInOtherCash, 40);
});

test('receivable filters combine status, account and search', () => {
  const list = [
    recv({ id: 'a', date: '2026-01-01', name: 'Alpha', amount: '100' }),
    recv({
      id: 'b',
      date: '2026-01-03',
      name: 'Bravo',
      amount: '250',
      status: 'Received',
      receivedAccount: 'online',
    }),
    recv({
      id: 'c',
      date: '2026-01-02',
      name: 'Charlie',
      amount: '40',
      status: 'Received',
      receivedAccount: 'cash',
      note: 'paid in cash',
    }),
  ];

  assert.deepEqual(
    filterReceivables(list, { statusFilter: 'received' }).map(r => r.id),
    ['b', 'c']
  );
  assert.deepEqual(
    filterReceivables(list, { accountFilter: 'online' }).map(r => r.id),
    ['b']
  );
  assert.deepEqual(
    filterReceivables(list, { searchQuery: 'charlie' }).map(r => r.id),
    ['c']
  );
  assert.deepEqual(
    filterReceivables(list, { searchQuery: 'cash' }).map(r => r.id),
    ['c']
  );
  assert.deepEqual(
    filterReceivables(list, { searchQuery: '250' }).map(r => r.id),
    ['b']
  );
});

test('payable filters combine status, account and search', () => {
  const list = [
    payable({ id: 'a', date: '2026-02-01', name: 'Alpha', amount: '100' }),
    payable({
      id: 'b',
      date: '2026-02-03',
      name: 'Bravo',
      amount: '250',
      status: 'Paid',
      paidAccount: 'online',
    }),
    payable({
      id: 'c',
      date: '2026-02-02',
      name: 'Charlie',
      amount: '40',
      status: 'Paid',
      paidAccount: 'cash',
      note: 'rent',
    }),
  ];

  assert.deepEqual(
    filterPayables(list, { payStatusFilter: 'unpaid' }).map(p => p.id),
    ['a']
  );
  assert.deepEqual(
    filterPayables(list, { payAccountFilter: 'cash' }).map(p => p.id),
    ['c']
  );
  assert.deepEqual(
    filterPayables(list, { paySearchQuery: 'rent' }).map(p => p.id),
    ['c']
  );
});

test('receivable payloads preserve existing fields and dates', () => {
  const existing = recv({ id: 'r9', receivedDate: '2026-01-05' });
  const form = {
    name: '  New Name  ',
    amount: '150.5',
    date: '2026-03-01',
    note: '  note  ',
    status: 'Received',
    receivedAccount: 'online',
  };

  const updated = buildReceivablePayload(form, existing);
  assert.equal(updated.id, 'r9');
  assert.equal(updated.name, 'New Name');
  assert.equal(updated.amount, '150.5');
  assert.equal(updated.note, 'note');
  assert.equal(updated.receivedAccount, 'online');
  assert.equal(updated.receivedDate, '2026-01-05');

  const created = buildReceivablePayload(form);
  assert.match(created.id, /^recv/);
  assert.equal(created.receivedDate, '2026-03-01');

  const pending = buildReceivablePayload({ ...form, status: 'Not Received' }, existing);
  assert.equal(pending.receivedAccount, null);
  assert.equal(pending.receivedDate, null);
});

test('receive, revert and payable payloads match the UI flow', () => {
  const record = recv({ id: 'r1', note: 'old note' });
  const received = buildReceivePayload(record, {
    receivedAccount: 'cash',
    receivedDate: '2026-04-01',
    receiptNote: ' ref ',
  });
  assert.equal(received.status, 'Received');
  assert.equal(received.receivedAccount, 'cash');
  assert.equal(received.receivedDate, '2026-04-01');
  assert.equal(received.note, 'ref');

  assert.deepEqual(buildRevertedReceivable(record), {
    ...record,
    status: 'Not Received',
    receivedAccount: null,
    receivedDate: null,
  });

  const existingPayable = payable({ id: 'p9', paidDate: '2026-02-15' });
  const payForm = {
    name: ' Beta ',
    amount: '300',
    date: '2026-05-01',
    note: ' bill ',
    status: 'Paid',
    paidAccount: 'online',
  };

  const updated = buildPayablePayload(payForm, existingPayable);
  assert.equal(updated.id, 'p9');
  assert.equal(updated.name, 'Beta');
  assert.equal(updated.amount, '300');
  assert.equal(updated.paidAccount, 'online');
  assert.equal(updated.paidDate, '2026-02-15');

  const created = buildPayablePayload(payForm);
  assert.match(created.id, /^payab/);
  assert.equal(created.paidDate, '2026-05-01');

  const paid = buildPayPayload(existingPayable, {
    paidAccount: 'cash',
    paidDate: '2026-06-01',
    payNote: ' done ',
  });
  assert.equal(paid.status, 'Paid');
  assert.equal(paid.paidAccount, 'cash');
  assert.equal(paid.paidDate, '2026-06-01');
  assert.equal(paid.note, 'done');

  assert.deepEqual(buildRevertedPayable(existingPayable), {
    ...existingPayable,
    status: 'Unpaid',
    paidAccount: null,
    paidDate: null,
  });
});
