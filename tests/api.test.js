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

test('createRecord keeps the provided id instead of overwriting it', async () => {
  const storage = createMockStorage();
  globalThis.localStorage = storage;
  globalThis.sessionStorage = createMockStorage();

  const { api } = await import('../src/utils/api.js');

  const record = {
    id: 'sale-123',
    merchantName: 'Demo Merchant',
    salesAmount: '100',
    salesType: 'Regular',
    commissionPercent: '10',
    commissionAmount: '10',
    merchantBill: '90',
    discountPercent: '0',
    discountAmount: '0',
    deliveryCharge: '0',
    paidByCustomer: '100',
    riderName: '',
    riderSalary: '0',
    otherExpenseName: '',
    otherExpense: '0',
    fixedExpenseName: '',
    fixedExpense: '0',
  };

  const response = await api.createRecord(record);

  assert.equal(response.success, true);

  const records = await api.getAllRecords();
  const saved = records.find(item => item.id === 'sale-123');

  assert.ok(saved, 'expected the created record to keep the provided id');
});

test('Opening balance: one record per month, no duplicates, past months locked', async () => {
  const storage = createMockStorage();
  globalThis.localStorage = storage;
  globalThis.sessionStorage = createMockStorage();

  const { api } = await import('../src/utils/api.js');

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Create an opening balance for the current month
  let resp = await api.setOpeningBalance({
    monthKey,
    month: 'Current',
    year: now.getFullYear(),
    handCash: 20000,
    onlineCash: 15000,
    otherCash: 5000,
    totalCash: 40000,
    source: 'carried_forward',
    fromMonthKey: '2026-09',
  });
  assert.equal(resp.success, true);

  // Save again for the same month — must update, not create a duplicate
  resp = await api.setOpeningBalance({
    monthKey,
    month: 'Current',
    year: now.getFullYear(),
    handCash: 1,
    onlineCash: 2,
    otherCash: 3,
  });
  assert.equal(resp.success, true);

  const list = await api.getOpeningBalances();
  assert.equal(list.filter(o => o.monthKey === monthKey).length, 1, 'only one opening balance per month');
  assert.equal(list[0].handCash, 1, 'same-month save should update values');
  assert.equal(list[0].source, 'carried_forward', 'source should be preserved on update');

  // Past months must remain unchanged
  await assert.rejects(
    () => api.setOpeningBalance({ monthKey: '2000-01', handCash: 1 }),
    /past months/
  );
});

test('Legacy single opening balance migrates into a current-month manual record', async () => {
  const storage = createMockStorage();
  globalThis.localStorage = storage;
  globalThis.sessionStorage = createMockStorage();

  const { api } = await import('../src/utils/api.js');

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  localStorage.setItem(
    'fm_opening_balance',
    JSON.stringify({ handCash: 999, onlineCash: 888, otherCash: 777 })
  );

  const list = await api.getOpeningBalances();
  const migrated = list.find(o => o.monthKey === monthKey);

  assert.ok(migrated, 'legacy opening balance should migrate as a current-month record');
  assert.equal(migrated.handCash, 999);
  assert.equal(migrated.onlineCash, 888);
  assert.equal(migrated.otherCash, 777);
  assert.equal(migrated.source, 'manual');
  assert.equal(migrated.totalCash, 999 + 888 + 777);
  assert.equal(localStorage.getItem('fm_opening_balance'), null, 'legacy key should be removed');
});
