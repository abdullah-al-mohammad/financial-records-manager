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
  ];
  const transfers = [
    {
      id: 't1',
      type: 'cash_to_online',
      amount: '400',
    },
  ];

  const balance = computeNetCashBalance(records, [], transfers);

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
  ];
  const transfers = [
    {
      id: 't2',
      type: 'online_to_cash',
      amount: '300',
    },
  ];

  const balance = computeNetCashBalance(records, [], transfers);

  // Regular online sale collected
  assert.equal(balance.onlineCollected, 1000);
  // Transfer: online down by 300, cash up by 300
  assert.equal(balance.onlineBalance, 1000 - 300); // 700
  assert.equal(balance.cashBalance, 0 + 300);       // 300
  assert.equal(balance.netRemaining, 1000);
});

test('Receivable with Not Received status does not affect cash balances', () => {
  const records = [
    {
      id: 'sale-1',
      salesAmount: '1000',
      paidByCustomer: '1000',
      digitalPaymentMethod: 'cash',
    },
  ];
  const receivables = [
    {
      id: 'rec-1',
      name: 'ABC Corp',
      amount: '5000',
      date: '2026-09-03',
      note: 'Pending invoice',
      status: 'Not Received',
    },
  ];

  const balance = computeNetCashBalance(records, [], [], receivables);

  assert.equal(balance.cashBalance, 1000);
  assert.equal(balance.onlineBalance, 0);
  assert.equal(balance.otherCashBalance, 0);
  assert.equal(balance.totalReceivablesCollected, 0);
});

test('Receivable marked Received adds to designated cash balance and avoids double addition', () => {
  const records = [
    {
      id: 'sale-1',
      salesAmount: '1000',
      paidByCustomer: '1000',
      digitalPaymentMethod: 'cash',
    },
  ];
  const receivables = [
    {
      id: 'rec-1',
      name: 'Person A',
      amount: '2000',
      date: '2026-09-01',
      note: 'Loan return',
      status: 'Received',
      receivedAccount: 'cash', // Hand cash
    },
    {
      id: 'rec-2',
      name: 'Company B',
      amount: '3500',
      date: '2026-09-02',
      note: 'Project payout',
      status: 'Received',
      receivedAccount: 'online', // Online
    },
    {
      id: 'rec-3',
      name: 'Client C',
      amount: '1500',
      date: '2026-09-03',
      note: 'Other cash income',
      status: 'Received',
      receivedAccount: 'other_cash', // Other cash
    },
  ];

  const balance = computeNetCashBalance(records, [], [], receivables);

  // Initial cash: 1000 + 2000 = 3000
  assert.equal(balance.cashBalance, 3000);
  // Initial online: 0 + 3500 = 3500
  assert.equal(balance.onlineBalance, 3500);
  // Initial other cash: 0 + 1500 = 1500
  assert.equal(balance.otherCashBalance, 1500);
  assert.equal(balance.receivablesCollectedCash, 2000);
  assert.equal(balance.receivablesCollectedOnline, 3500);
  assert.equal(balance.receivablesCollectedOtherCash, 1500);
  assert.equal(balance.totalReceivablesCollected, 7000);
  // Net remaining: 3000 + 3500 + 1500 = 8000
  assert.equal(balance.netRemaining, 8000);
});

test('Payable with Unpaid status does not affect cash balances', () => {
  const records = [
    {
      id: 'sale-1',
      salesAmount: '2000',
      paidByCustomer: '2000',
      digitalPaymentMethod: 'cash',
    },
  ];
  const payables = [
    {
      id: 'pay-1',
      name: 'Packaging World',
      amount: '800',
      date: '2026-09-03',
      note: 'Pending boxes payment',
      status: 'Unpaid',
    },
  ];

  const balance = computeNetCashBalance(records, [], [], [], payables);

  assert.equal(balance.cashBalance, 2000);
  assert.equal(balance.onlineBalance, 0);
  assert.equal(balance.otherCashBalance, 0);
  assert.equal(balance.totalPayablesPaid, 0);
  assert.equal(balance.netRemaining, 2000);
});

test('Payable marked Paid deducts from designated cash balance and avoids double deduction', () => {
  const records = [
    {
      id: 'sale-1',
      salesAmount: '5000',
      paidByCustomer: '5000',
      digitalPaymentMethod: 'cash',
    },
    {
      id: 'sale-2',
      salesAmount: '4000',
      paidByCustomer: '4000',
      digitalPaymentMethod: 'bkash',
    },
    {
      id: 'sale-3',
      otherCashAmount: '2000',
    },
  ];
  const payables = [
    {
      id: 'pay-1',
      name: 'Supplier A',
      amount: '1500',
      status: 'Paid',
      paidAccount: 'cash', // Deducts from Hand Cash
    },
    {
      id: 'pay-2',
      name: 'Software Vendor B',
      amount: '1000',
      status: 'Paid',
      paidAccount: 'online', // Deducts from Online Cash
    },
    {
      id: 'pay-3',
      name: 'Utility C',
      amount: '500',
      status: 'Paid',
      paidAccount: 'other_cash', // Deducts from Other Cash
    },
  ];

  const balance = computeNetCashBalance(records, [], [], [], payables);

  // Cash: 5000 - 1500 = 3500
  assert.equal(balance.cashBalance, 3500);
  assert.equal(balance.payablesPaidCash, 1500);

  // Online: 4000 - 1000 = 3000
  assert.equal(balance.onlineBalance, 3000);
  assert.equal(balance.payablesPaidOnline, 1000);

  // Other cash: 2000 - 500 = 1500
  assert.equal(balance.otherCashBalance, 1500);
  assert.equal(balance.payablesPaidOtherCash, 500);

  // Total paid: 1500 + 1000 + 500 = 3000
  assert.equal(balance.totalPayablesPaid, 3000);
  // Net remaining: 3500 + 3000 + 1500 = 8000
  assert.equal(balance.netRemaining, 8000);
});

test('Accounting Rule: Unreceived receivables and unpaid payables do not alter cash balance', () => {
  const records = [
    {
      id: 'sale-1',
      salesAmount: '10000',
      paidByCustomer: '10000',
      digitalPaymentMethod: 'cash',
    },
  ];
  const receivables = [
    {
      id: 'rec-unreceived',
      name: 'Client Future',
      amount: '50000',
      status: 'Not Received',
    },
  ];
  const payables = [
    {
      id: 'pay-unpaid',
      name: 'Big Supplier',
      amount: '30000',
      status: 'Unpaid',
    },
  ];

  const balance = computeNetCashBalance(records, [], [], receivables, payables);

  // Only the actual sale of 10000 is reflected
  assert.equal(balance.cashBalance, 10000);
  assert.equal(balance.onlineBalance, 0);
  assert.equal(balance.otherCashBalance, 0);
  assert.equal(balance.totalReceivablesCollected, 0);
  assert.equal(balance.totalPayablesPaid, 0);
  assert.equal(balance.netRemaining, 10000);
});

