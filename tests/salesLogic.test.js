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
  buildSalesPayload,
  buildVisibleRecords,
  computeDerived,
  countSalesRecords,
  defaultSalesForm,
  filterSalesRecords,
  formFromRecord,
  isCashPayment,
  isTransferRecord,
} = await import('../src/components/sales/salesLogic.js');

const makeRecord = (overrides = {}) => ({
  id: 'sale-1',
  date: '2026-03-01T10:00',
  createdAt: '2026-03-01T10:05:00.000Z',
  month: 'March',
  merchantName: 'Demo Merchant',
  salesAmount: '1000',
  salesType: 'Regular',
  commissionPercent: '15',
  commissionAmount: '150.00',
  merchantBill: '850.00',
  discountPercent: '10',
  discountAmount: '100.00',
  deliveryCharge: '50',
  paidByCustomer: '950.00',
  paymentSource: 'cash',
  digitalPaymentMethod: '',
  riderName: 'Rahim',
  riderSalary: '0',
  otherExpenseName: '',
  otherExpense: '0',
  fixedExpenseName: '',
  fixedExpense: '0',
  ...overrides,
});

test('computeDerived calculates commission, discount, merchant bill and customer total', () => {
  const derived = computeDerived({
    salesAmount: '1000',
    commissionPercent: '15',
    discountPercent: '10',
    deliveryCharge: '50',
  });

  assert.deepEqual(derived, {
    commissionAmount: '150.00',
    discountAmount: '100.00',
    merchantBill: '850.00',
    paidByCustomer: '950.00',
  });

  const empty = computeDerived({});
  assert.deepEqual(empty, {
    commissionAmount: '0.00',
    discountAmount: '0.00',
    merchantBill: '0.00',
    paidByCustomer: '0.00',
  });
});

test('buildVisibleRecords deduplicates, filters zero-value rows and sorts newest first', () => {
  const older = makeRecord({ id: 'old', date: '2026-01-01T09:00' });
  const newer = makeRecord({ id: 'new', date: '2026-02-01T09:00', merchantName: 'Newer' });
  const duplicate = makeRecord({ id: 'new', date: '2026-02-01T09:00' });
  const deliveryOnly = makeRecord({ id: 'delivery', date: '2026-01-15T09:00', salesAmount: '0', deliveryCharge: '20' });
  const empty = makeRecord({ id: 'empty', salesAmount: '0', deliveryCharge: '0' });

  const visible = buildVisibleRecords([older, newer, duplicate, deliveryOnly, empty]);

  assert.deepEqual(
    visible.map(r => r.id),
    ['new', 'delivery', 'old']
  );
});

test('filterSalesRecords matches merchant, rider or type plus month/type filters', () => {
  const records = [
    makeRecord({ id: 'a', month: 'March', salesType: 'Regular', merchantName: 'Alpha' }),
    makeRecord({ id: 'b', month: 'April', salesType: 'Parcel', merchantName: 'Beta', riderName: 'Karim' }),
  ];

  assert.deepEqual(
    filterSalesRecords(records, { searchTerm: 'alpha', filterMonth: 'All', filterType: 'All' }).map(
      r => r.id
    ),
    ['a']
  );
  assert.deepEqual(
    filterSalesRecords(records, { searchTerm: 'karim', filterMonth: 'All', filterType: 'All' }).map(
      r => r.id
    ),
    ['b']
  );
  assert.deepEqual(
    filterSalesRecords(records, { searchTerm: 'parcel', filterMonth: 'All', filterType: 'All' }).map(
      r => r.id
    ),
    ['b']
  );
  assert.deepEqual(
    filterSalesRecords(records, { searchTerm: '', filterMonth: 'March', filterType: 'All' }).map(
      r => r.id
    ),
    ['a']
  );
  assert.deepEqual(
    filterSalesRecords(records, { searchTerm: '', filterMonth: 'All', filterType: 'Parcel' }).map(
      r => r.id
    ),
    ['b']
  );
});

test('buildSalesPayload stringifies fields, defaults expenses and preserves createdAt on edit', () => {
  const form = {
    ...defaultSalesForm,
    date: '2026-04-02T11:30',
    month: 'April',
    merchantName: 'Demo Merchant',
    salesAmount: '200',
    salesType: 'Parcel',
    commissionPercent: '10',
    commissionAmount: '20.00',
    merchantBill: '180.00',
    discountPercent: '',
    discountAmount: '0.00',
    deliveryCharge: '',
    paidByCustomer: '200.00',
    riderName: '',
    riderSalary: '',
    otherExpenseName: '',
    otherExpense: '',
    fixedExpenseName: '',
    fixedExpense: '',
    expenseDescription: '',
    digitalPaymentMethod: 'bkash',
    paymentSource: 'online',
    createdAt: '2026-03-01T10:05:00.000Z',
  };

  const payload = buildSalesPayload(form, 'sale-9');
  assert.equal(payload.id, 'sale-9');
  assert.equal(payload.salesAmount, '200');
  assert.equal(payload.deliveryCharge, '0');
  assert.equal(payload.riderSalary, '0');
  assert.equal(payload.otherExpense, '0');
  assert.equal(payload.fixedExpense, '0');
  assert.equal(payload.digitalPaymentMethod, 'bkash');
  assert.equal(payload.paymentSource, 'online');
  assert.equal(payload.createdAt, form.createdAt);

  const created = buildSalesPayload({ ...form, createdAt: undefined });
  assert.match(created.id, /^rec_/);
  assert.equal(created.createdAt, undefined);
});

test('formFromRecord fills edit-form fallbacks without losing stored fields', () => {
  const record = makeRecord({ commissionPercent: '', discountPercent: '', riderSalary: '50' });
  const form = formFromRecord(record);

  assert.equal(form.commissionPercent, '15');
  assert.equal(form.discountPercent, '');
  assert.equal(form.riderSalary, '50');
  assert.equal(form.paymentSource, 'cash');
  assert.equal(form.merchantName, 'Demo Merchant');
});

test('countSalesRecords, transfer and cash helpers match table rules', () => {
  const records = [
    makeRecord({ id: 'a' }),
    makeRecord({ id: 'b', salesAmount: '0', deliveryCharge: '10' }),
    makeRecord({ id: 'c', salesAmount: '0', deliveryCharge: '0' }),
  ];
  assert.equal(countSalesRecords(records), 2);

  assert.equal(isTransferRecord(makeRecord({ salesType: 'Hand Cash to Online Transfer' })), true);
  assert.equal(isTransferRecord(makeRecord({ salesType: 'Online to Hand Cash Transfer' })), true);
  assert.equal(isTransferRecord(makeRecord({ salesType: 'Regular' })), false);

  assert.equal(isCashPayment(makeRecord({ digitalPaymentMethod: '' })), true);
  assert.equal(isCashPayment(makeRecord({ digitalPaymentMethod: 'cash' })), true);
  assert.equal(isCashPayment(makeRecord({ digitalPaymentMethod: 'bkash' })), false);
});
