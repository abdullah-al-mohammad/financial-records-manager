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

test('deleteOpeningBalance removes the current month opening balance', async () => {
  const storage = createMockStorage();
  globalThis.localStorage = storage;
  globalThis.sessionStorage = createMockStorage();

  const { api } = await import('../src/utils/api.js');

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await api.setOpeningBalance({ monthKey, handCash: 20000, onlineCash: 15000, otherCash: 5000 });

  let resp = await api.deleteOpeningBalance({ monthKey });
  assert.equal(resp.success, true);

  const list = await api.getOpeningBalances();
  assert.equal(list.filter(o => o.monthKey === monthKey).length, 0, 'monthly opening balance should be removed');

  // Deleting again must fail
  await assert.rejects(() => api.deleteOpeningBalance({ monthKey }), /not found/);

  // Past months must remain unchanged
  await assert.rejects(
    () => api.deleteOpeningBalance({ monthKey: '2000-01' }),
    /past months/
  );
});

test('deleteOpeningBalance matches full-datetime monthKey values', async () => {
  const storage = createMockStorage();
  globalThis.localStorage = storage;
  globalThis.sessionStorage = createMockStorage();

  const { api } = await import('../src/utils/api.js');

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await api.setOpeningBalance({ monthKey: currentMonthKey, handCash: 1000 });
  // Frontend may send the stored full-datetime value
  const resp = await api.deleteOpeningBalance({ monthKey: `${currentMonthKey}-01T00:00:00` });
  assert.equal(resp.success, true);

  const list = await api.getOpeningBalances();
  assert.equal(list.filter(o => o.monthKey === currentMonthKey).length, 0);
});

test('deleteOpeningBalance matches by id when monthKey values differ', async () => {
  const storage = createMockStorage();
  globalThis.localStorage = storage;
  globalThis.sessionStorage = createMockStorage();

  const { api } = await import('../src/utils/api.js');

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await api.setOpeningBalance({ monthKey: currentMonthKey, handCash: 1000 });
  const listBefore = await api.getOpeningBalances();
  const target = listBefore.find(o => o.monthKey === currentMonthKey);
  assert.ok(target && target.id, 'opening balance should have an id');

  const resp = await api.deleteOpeningBalance({ id: target.id });
  assert.equal(resp.success, true);

  const list = await api.getOpeningBalances();
  assert.equal(list.filter(o => o.monthKey === currentMonthKey).length, 0);
});

test('createRecord prevents duplicate entry when called with same id', async () => {
  const storage = createMockStorage();
  globalThis.localStorage = storage;
  globalThis.sessionStorage = createMockStorage();

  const { api } = await import('../src/utils/api.js');

  const record = {
    id: 'sale-dup-test-1',
    merchantName: 'Test Merchant',
    salesAmount: '500',
    salesType: 'Regular',
    commissionPercent: '10',
    commissionAmount: '50',
    merchantBill: '450',
    discountPercent: '0',
    discountAmount: '0',
    deliveryCharge: '0',
    paidByCustomer: '500',
  };

  const firstResp = await api.createRecord(record);
  assert.equal(firstResp.success, true);

  // Calling createRecord again with the same record ID
  const secondResp = await api.createRecord(record);
  assert.equal(secondResp.success, true);
  assert.equal(secondResp.duplicatePrevented, true);

  const allRecords = await api.getAllRecords();
  const matching = allRecords.filter(r => r.id === 'sale-dup-test-1');
  assert.equal(matching.length, 1, 'Only one record should exist in database for the given ID');
});

test('ensureUniqueListIds removes duplicate records with identical IDs', async () => {
  const { ensureUniqueListIds } = await import('../src/utils/api.js');

  const rawList = [
    { id: 'rec_100', merchantName: 'Store A', salesAmount: '500' },
    { id: 'rec_100', merchantName: 'Store A', salesAmount: '500' }, // exact duplicate
    { id: 'rec_200', merchantName: 'Store B', salesAmount: '1000' },
    { merchantName: 'Store C (no id)' }, // missing id
  ];

  const { items, wasUpdated } = ensureUniqueListIds(rawList, 'rec');
  assert.equal(wasUpdated, true);
  assert.equal(items.length, 3, 'Duplicate item should be removed');
  assert.equal(items.filter(i => i.id === 'rec_100').length, 1, 'rec_100 should appear exactly once');
  assert.equal(items.filter(i => i.id === 'rec_200').length, 1, 'rec_200 should appear exactly once');
  assert.ok(items[2].id && items[2].id.startsWith('rec_'), 'Missing ID should be generated');
});
