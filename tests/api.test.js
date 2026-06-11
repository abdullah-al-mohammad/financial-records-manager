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
