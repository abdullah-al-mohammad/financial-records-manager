import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LOGS_PER_PAGE,
  filterAuditLogs,
  formatTimestamp,
  getTotalLogPages,
  paginateLogs,
} from '../src/components/admin/adminLogic.js';

test('filterAuditLogs matches username, action, details and timestamp', () => {
  const logs = [
    {
      id: 1,
      username: 'admin',
      action: 'Create User',
      details: 'Created jason_smith',
      timestamp: '2026-01-10T09:00:00.000Z',
    },
    {
      id: 2,
      username: 'jason',
      action: 'Delete Record',
      details: 'Removed sales row',
      timestamp: '2026-02-11T10:00:00.000Z',
    },
    {
      id: 3,
      username: 'guest',
      action: 'Login Failed',
      details: 'Wrong password',
      timestamp: '2026-03-12T11:00:00.000Z',
    },
  ];

  assert.deepEqual(
    filterAuditLogs(logs, 'ADMIN').map(log => log.id),
    [1]
  );
  assert.deepEqual(
    filterAuditLogs(logs, 'delete').map(log => log.id),
    [2]
  );
  assert.deepEqual(
    filterAuditLogs(logs, 'wrong pass').map(log => log.id),
    [3]
  );
  assert.deepEqual(
    filterAuditLogs(logs, '2026-02').map(log => log.id),
    [2]
  );
  assert.equal(filterAuditLogs(logs, 'nothing-matches').length, 0);
  assert.equal(filterAuditLogs(logs, '').length, 3);
});

test('filterAuditLogs tolerates logs with missing fields', () => {
  const logs = [{ id: 1 }, { id: 2, username: 'admin' }];

  assert.deepEqual(
    filterAuditLogs(logs, 'admin').map(log => log.id),
    [2]
  );
  assert.equal(filterAuditLogs(undefined, 'admin').length, 0);
});

test('paginateLogs slices the requested page', () => {
  const logs = Array.from({ length: 32 }, (_, index) => ({ id: index + 1 }));

  assert.equal(paginateLogs(logs, 1).length, LOGS_PER_PAGE);
  assert.equal(paginateLogs(logs, 1)[0].id, 1);
  assert.equal(paginateLogs(logs, 2)[0].id, 16);
  assert.deepEqual(
    paginateLogs(logs, 3).map(log => log.id),
    [31, 32]
  );
  assert.equal(paginateLogs(logs, 4).length, 0);
  assert.deepEqual(
    paginateLogs(logs, 1, 5).map(log => log.id),
    [1, 2, 3, 4, 5]
  );
});

test('getTotalLogPages computes page count with a minimum of one', () => {
  assert.equal(getTotalLogPages(0), 1);
  assert.equal(getTotalLogPages(1), 1);
  assert.equal(getTotalLogPages(15), 1);
  assert.equal(getTotalLogPages(16), 2);
  assert.equal(getTotalLogPages(45), 3);
  assert.equal(getTotalLogPages(46), 4);
  assert.equal(getTotalLogPages(11, 5), 3);
});

test('formatTimestamp renders en-GB date and time', () => {
  const localDate = new Date(2026, 0, 10, 14, 30, 5);
  assert.equal(formatTimestamp(localDate.toISOString()), '10 Jan 2026 14:30:05');
});

test('formatTimestamp falls back for empty input', () => {
  assert.equal(formatTimestamp(''), '—');
  assert.equal(formatTimestamp(null), '—');
  assert.equal(formatTimestamp(undefined), '—');
});
