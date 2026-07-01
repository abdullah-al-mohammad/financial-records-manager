import assert from 'node:assert/strict';
import test from 'node:test';

import { getDueBillReminders, upsertBillReminder } from '../src/utils/reminders.js';

test('upsertBillReminder replaces the previous reminder for the same merchant', () => {
  const reminders = [
    {
      id: 'acme-2026-06-01',
      merchantName: 'Acme',
      lastPaidDate: '2026-06-01',
      nextDueDate: '2026-06-08',
    },
  ];

  const updated = upsertBillReminder(reminders, 'Acme', '2026-06-10');

  assert.equal(updated.length, 1);
  assert.equal(updated[0].merchantName, 'Acme');
  assert.equal(updated[0].lastPaidDate, '2026-06-10');
  assert.equal(updated[0].nextDueDate, '2026-06-17');
});

test('getDueBillReminders returns reminders that are due on or before today', () => {
  const reminders = [
    {
      id: 'a',
      merchantName: 'Acme',
      lastPaidDate: '2026-06-01',
      nextDueDate: '2026-06-08',
    },
    {
      id: 'b',
      merchantName: 'Beta',
      lastPaidDate: '2026-06-10',
      nextDueDate: '2026-06-17',
    },
  ];

  const due = getDueBillReminders(reminders, new Date('2026-06-17'));

  assert.deepEqual(
    due.map(item => item.id),
    ['a', 'b']
  );
});
