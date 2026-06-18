import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeCsvRecord, parseCsvText } from '../src/utils/csvUtils.js';

test('parseCsvText converts CSV rows into usable objects', () => {
  const csv =
    'date,merchantName,salesAmount,salesType\n2026-06-01,Alpha Shop,1500,Regular\n2026-06-02,Beta Shop,2500,Parcel';

  const rows = parseCsvText(csv);

  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], {
    date: '2026-06-01',
    merchantName: 'Alpha Shop',
    salesAmount: '1500',
    salesType: 'Regular',
  });
});

test('normalizeCsvRecord maps common CSV columns into the sales form shape', () => {
  const normalized = normalizeCsvRecord({
    Date: '2026-06-10',
    Merchant: 'City Store',
    'Sales Amount': '3200',
    Type: 'Parcel',
    'Commission %': '12',
    'Delivery Charge': '50',
  });

  assert.equal(normalized.merchantName, 'City Store');
  assert.equal(normalized.salesAmount, '3200');
  assert.equal(normalized.salesType, 'Parcel');
  assert.equal(normalized.commissionPercent, '12');
  assert.equal(normalized.deliveryCharge, '50');
  assert.equal(normalized.month, 'June');
});
