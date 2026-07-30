import assert from 'node:assert/strict';
import test from 'node:test';

import { computeNetCashBalance } from '../src/utils/finance.js';

test('computeNetCashBalance splits online and cash balances based on payment source', () => {
  const records = [
    {
      id: 'sale-online',
      salesAmount: '1000',
      paidByCustomer: '1000',
      digitalPaymentMethod: 'bkash',
    },
    {
      id: 'sale-cash',
      salesAmount: '500',
      paidByCustomer: '500',
      digitalPaymentMethod: 'cash',
    },
    {
      id: 'expense-online',
      riderSalary: '200',
      otherExpense: '0',
      fixedExpense: '0',
      paymentSource: 'bkash',
    },
    {
      id: 'expense-cash',
      riderSalary: '0',
      otherExpense: '150',
      fixedExpense: '0',
      paymentSource: 'cash',
    },
  ];

  const balance = computeNetCashBalance(records, []);

  assert.equal(balance.onlineCollected, 1000);
  assert.equal(balance.cashCollected, 500);
  assert.equal(balance.onlineExpenses, 200);
  assert.equal(balance.cashExpenses, 150);
  assert.equal(balance.onlineBalance, 800);
  assert.equal(balance.cashBalance, 350);
  assert.equal(balance.netRemaining, 1150);
});

test('Hand Cash to Online Transfer deducts from cash and adds to online', () => {
  const records = [
    {
      id: 'sale-cash',
      salesAmount: '1000',
      paidByCustomer: '1000',
      digitalPaymentMethod: 'cash',
      salesType: 'Regular',
    },
    {
      id: 'transfer-h2o',
      salesAmount: '400',
      salesType: 'Hand Cash to Online Transfer',
      digitalPaymentMethod: 'bkash',
    },
  ];

  const balance = computeNetCashBalance(records, []);

  // Regular sale goes to cash
  assert.equal(balance.cashCollected, 1000);
  // Transfer amount: cash down by 400, online up by 400
  assert.equal(balance.cashBalance, 1000 - 400); // 600
  assert.equal(balance.onlineBalance, 0 + 400);   // 400
  assert.equal(balance.netRemaining, 1000);
});

test('Online to Hand Cash Transfer deducts from online and adds to cash', () => {
  const records = [
    {
      id: 'sale-online',
      salesAmount: '1000',
      paidByCustomer: '1000',
      digitalPaymentMethod: 'bkash',
      salesType: 'Regular',
    },
    {
      id: 'transfer-o2h',
      salesAmount: '300',
      salesType: 'Online to Hand Cash Transfer',
      digitalPaymentMethod: 'bkash',
    },
  ];

  const balance = computeNetCashBalance(records, []);

  // Regular online sale collected
  assert.equal(balance.onlineCollected, 1000);
  // Transfer: online down by 300, cash up by 300
  assert.equal(balance.onlineBalance, 1000 - 300); // 700
  assert.equal(balance.cashBalance, 0 + 300);       // 300
  assert.equal(balance.netRemaining, 1000);
});

