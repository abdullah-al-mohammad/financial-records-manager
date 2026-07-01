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
