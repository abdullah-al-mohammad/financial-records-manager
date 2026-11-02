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
  buildExpensePayload,
  buildItemizedExpenses,
  buildRecordAfterItemRemoval,
  emptyExpenseForm,
  hasAnyExpense,
  hasRemainingExpenses,
} = await import('../src/components/expense/expenseLogic.js');

const makeRecord = (overrides = {}) => ({
  id: 'rec-1',
  date: '2026-03-01T10:00',
  createdAt: '2026-03-01T10:05:00.000Z',
  month: 'March',
  merchantName: 'Demo Merchant',
  salesAmount: '500',
  salesType: 'Regular',
  commissionPercent: '10',
  commissionAmount: '50',
  merchantBill: '450',
  discountPercent: '1',
  discountAmount: '5',
  deliveryCharge: '10',
  paidByCustomer: '505',
  paymentSource: 'cash',
  riderName: 'Rahim',
  riderSalary: '100',
  otherExpenseName: 'Fuel',
  otherExpense: '50',
  fixedExpenseName: 'Rent',
  fixedExpense: '20',
  expenseDescription: 'Fuel cost',
  ...overrides,
});

test('buildItemizedExpenses splits a record into its four expense lines', () => {
  const record = makeRecord();
  const items = buildItemizedExpenses([record]);

  assert.equal(items.length, 4);
  const byField = Object.fromEntries(items.map(item => [item.field, item]));

  assert.equal(byField.rider.category, 'Rider Wages');
  assert.equal(byField.rider.name, 'Rider Salary: Rahim');
  assert.equal(byField.rider.amount, 100);
  assert.equal(byField.rider.originalRecord, record);

  assert.equal(byField.other.category, 'Variable Overhead');
  assert.equal(byField.other.name, 'Fuel');
  assert.equal(byField.other.amount, 50);

  assert.equal(byField.fixed.category, 'Fixed Cost');
  assert.equal(byField.fixed.name, 'Rent');
  assert.equal(byField.fixed.amount, 20);

  assert.equal(byField.discount.category, 'Sales Discount');
  assert.equal(byField.discount.name, 'Discount: Demo Merchant');
  assert.equal(byField.discount.amount, 5);
});

test('buildItemizedExpenses skips zero amounts and sorts newest first', () => {
  const older = makeRecord({ id: 'old', date: '2026-01-01T09:00' });
  const newer = makeRecord({ id: 'new', date: '2026-02-01T09:00' });

  const items = buildItemizedExpenses([older, newer]);
  assert.equal(items.length, 8);
  assert.equal(items[0].date, '2026-02-01T09:00');
  assert.equal(items[items.length - 1].date, '2026-01-01T09:00');

  const empty = buildItemizedExpenses([
    makeRecord({ riderSalary: '0', otherExpense: '0', fixedExpense: '0', discountAmount: '0' }),
  ]);
  assert.equal(empty.length, 0);
});

test('buildExpensePayload preserves sales fields and defaults unused expenses to 0', () => {
  const form = {
    ...emptyExpenseForm(),
    date: '2026-04-02T11:30',
    month: 'April',
    merchantName: 'Other Merchant',
    riderName: '',
    riderSalary: '',
    otherExpenseName: '',
    otherExpense: '',
    fixedExpenseName: 'Internet',
    fixedExpense: '1200',
    expenseDescription: 'Monthly internet',
    paymentSource: 'online',
  };

  const existing = makeRecord();
  const payload = buildExpensePayload(form, existing.id, existing);

  assert.equal(payload.id, existing.id);
  assert.equal(payload.date, '2026-04-02T11:30');
  assert.equal(payload.month, 'April');
  assert.equal(payload.salesAmount, '500');
  assert.equal(payload.commissionAmount, '50');
  assert.equal(payload.discountAmount, '5');
  assert.equal(payload.deliveryCharge, '10');
  assert.equal(payload.riderSalary, '0');
  assert.equal(payload.otherExpense, '0');
  assert.equal(payload.fixedExpense, '1200');
  assert.equal(payload.paymentSource, 'online');

  const created = buildExpensePayload(form);
  assert.match(created.id, /^rec_/);
  assert.equal(created.salesAmount, '0');
  assert.equal(created.salesType, 'Regular');
  assert.equal(created.paidByCustomer, '0');
});

test('hasAnyExpense requires at least one positive expense amount', () => {
  assert.equal(hasAnyExpense({ riderSalary: '', otherExpense: '', fixedExpense: '' }), false);
  assert.equal(hasAnyExpense({ riderSalary: '0', otherExpense: '0', fixedExpense: '0' }), false);
  assert.equal(hasAnyExpense({ riderSalary: '1', otherExpense: '', fixedExpense: '' }), true);
  assert.equal(hasAnyExpense({ riderSalary: '', otherExpense: '2', fixedExpense: '' }), true);
  assert.equal(hasAnyExpense({ riderSalary: '', otherExpense: '', fixedExpense: '3' }), true);
});

test('buildRecordAfterItemRemoval clears only the targeted expense line', () => {
  const record = makeRecord();

  const riderRemoved = buildRecordAfterItemRemoval(record, 'rider');
  assert.equal(riderRemoved.riderName, '');
  assert.equal(riderRemoved.riderSalary, '0');
  assert.equal(riderRemoved.otherExpense, '50');
  assert.equal(riderRemoved.fixedExpense, '20');
  assert.equal(record.riderSalary, '100', 'original record must not be mutated');

  const otherRemoved = buildRecordAfterItemRemoval(record, 'other');
  assert.equal(otherRemoved.otherExpenseName, '');
  assert.equal(otherRemoved.otherExpense, '0');
  assert.equal(otherRemoved.riderSalary, '100');

  const fixedRemoved = buildRecordAfterItemRemoval(record, 'fixed');
  assert.equal(fixedRemoved.fixedExpenseName, '');
  assert.equal(fixedRemoved.fixedExpense, '0');
  assert.equal(fixedRemoved.otherExpense, '50');

  const discountRemoved = buildRecordAfterItemRemoval(record, 'discount');
  assert.equal(discountRemoved.discountPercent, '0');
  assert.equal(discountRemoved.discountAmount, '0');
  assert.equal(discountRemoved.paidByCustomer, '510.00');
  assert.equal(discountRemoved.salesAmount, '500');
});

test('hasRemainingExpenses reports the other expense lines left on a record', () => {
  const record = makeRecord();
  assert.equal(hasRemainingExpenses(record, 'rider'), true);

  const riderOnly = makeRecord({ otherExpense: '0', fixedExpense: '0' });
  assert.equal(hasRemainingExpenses(riderOnly, 'rider'), false);
  assert.equal(hasRemainingExpenses(riderOnly, 'discount'), true);
});
