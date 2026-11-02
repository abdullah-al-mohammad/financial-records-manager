import test from 'node:test';
import assert from 'node:assert/strict';

import { filterDueReminders } from '../src/components/reminders/reminderLogic.js';

const dueReminders = [
  {
    id: 'acme-2020-01-01',
    merchantName: 'Acme Store',
    lastPaidDate: '2020-01-01',
    nextDueDate: '2020-01-08',
  },
  {
    id: 'beta-2020-01-01',
    merchantName: 'Beta Mart',
    lastPaidDate: '2020-01-01',
    nextDueDate: '2020-01-08',
  },
];

test('returns reminders whose next due date has passed', () => {
  const result = filterDueReminders(dueReminders, [], []);

  assert.deepEqual(
    result.map(reminder => reminder.id),
    ['acme-2020-01-01', 'beta-2020-01-01']
  );
});

test('removes reminders dismissed in this session', () => {
  const result = filterDueReminders(dueReminders, [], ['acme-2020-01-01']);

  assert.deepEqual(
    result.map(reminder => reminder.id),
    ['beta-2020-01-01']
  );
});

test('removes reminders with a newer merchant payment', () => {
  const payments = [
    { merchantName: '  acme store ', date: '2020-01-10' },
    { merchantName: 'Beta Mart', date: '2020-01-09' },
  ];

  assert.deepEqual(filterDueReminders(dueReminders, payments, []), []);
});

test('keeps reminders when merchant payments are not newer than last paid date', () => {
  const payments = [
    { merchantName: 'Acme Store', date: '2019-12-31' },
    { merchantName: 'Beta Mart', date: '2020-01-01' },
  ];

  assert.deepEqual(
    filterDueReminders(dueReminders, payments, []).map(reminder => reminder.id),
    ['acme-2020-01-01', 'beta-2020-01-01']
  );
});

test('ignores reminders that are not due yet', () => {
  const reminders = [
    ...dueReminders,
    {
      id: 'future-2099-01-01',
      merchantName: 'Future Shop',
      lastPaidDate: '2099-01-01',
      nextDueDate: '2099-01-08',
    },
  ];

  assert.deepEqual(
    filterDueReminders(reminders, [], []).map(reminder => reminder.id),
    ['acme-2020-01-01', 'beta-2020-01-01']
  );
});

test('tolerates empty and missing inputs', () => {
  assert.deepEqual(filterDueReminders(), []);
  assert.deepEqual(filterDueReminders(undefined, undefined, undefined), []);
});
