import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMenuItems } from '../src/components/sidebar/sidebarConfig.js';

test('standard users see the base navigation entries', () => {
  const items = buildMenuItems({ role: 'User' });

  assert.deepEqual(
    items.map(item => item.id),
    ['dashboard', 'sales', 'expenses', 'billing', 'receivables', 'otherCash', 'history']
  );
  assert.equal(items.some(item => item.id === 'admin'), false);
});

test('administrators get the admin settings entry', () => {
  const items = buildMenuItems({ role: 'Admin' });

  assert.equal(items.length, 8);
  assert.equal(items[items.length - 1].id, 'admin');
  assert.equal(items[items.length - 1].label, 'Admin Settings');
});

test('missing user still resolves to the base navigation entries', () => {
  const items = buildMenuItems(undefined);

  assert.equal(items.length, 7);
  assert.equal(items[0].id, 'dashboard');
});

test('menu items carry a label and an icon component', () => {
  buildMenuItems({ role: 'Admin' }).forEach(item => {
    assert.equal(typeof item.label, 'string');
    assert.ok(item.label.length > 0);
    assert.ok(item.icon);
  });
});
