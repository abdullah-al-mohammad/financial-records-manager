import assert from 'node:assert/strict';
import test from 'node:test';

import { compareDates, formatDisplayDate, isDateInRange, toDateKey } from '../src/utils/dates.js';

test('toDateKey normalizes ISO and datetime-local values', () => {
  assert.equal(toDateKey('2026-01-26'), '2026-01-26');
  assert.equal(toDateKey('2026-01-26T14:30:00'), '2026-01-26');
  assert.equal(toDateKey('2026-01-26T14:30'), '2026-01-26');
});

test('toDateKey normalizes DD-MM-YYYY values', () => {
  assert.equal(toDateKey('26-01-2026'), '2026-01-26');
  assert.equal(toDateKey('26/01/2026'), '2026-01-26');
});

test('toDateKey parses Google Sheets style date strings', () => {
  const key = toDateKey('Mon Jan 26 2026 00:00:00 GMT+0600');
  assert.equal(key, '2026-01-26');
});

test('isDateInRange filters using normalized keys', () => {
  assert.equal(isDateInRange('26-01-2026', '2026-01-01', '2026-01-31'), true);
  assert.equal(isDateInRange('26-01-2026', '2026-02-01', '2026-03-01'), false);
  assert.equal(isDateInRange('2026-01-26T10:15', '2026-01-26', '2026-01-26'), true);
});

test('formatDisplayDate renders DD/MM/YYYY', () => {
  assert.equal(formatDisplayDate('2026-01-26'), '26/01/2026');
});

test('compareDates sorts chronologically', () => {
  assert.equal(compareDates('2026-02-01', '2026-01-26') > 0, true);
  assert.equal(compareDates('26/01/2026', '2026-02-01') < 0, true);
});
