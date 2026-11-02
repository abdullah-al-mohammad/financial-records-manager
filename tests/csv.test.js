import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildImportId,
  buildSalesCsv,
  normalizeCsvRecord,
  parseCsvText,
  parseSalesCsv,
  toCsv,
} from '../src/utils/csvUtils.js';

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

test('parseCsvText handles quoted commas, escaped quotes and embedded newlines', () => {
  const csv = [
    'Date,Merchant,Note',
    '2026-06-01,"Shop, Inc.","Said ""hello"" today"',
    '2026-06-02,Beta,"Line one\nLine two"',
  ].join('\r\n');

  const rows = parseCsvText(csv);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].Merchant, 'Shop, Inc.');
  assert.equal(rows[0].Note, 'Said "hello" today');
  assert.equal(rows[1].Note, 'Line one\nLine two');
});

test('parseCsvText ignores blank lines and a UTF-8 BOM', () => {
  const csv = '\uFEFFDate,Merchant,Amount\r\n2026-06-01,Alpha,100\r\n\r\n';

  const rows = parseCsvText(csv);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].Date, '2026-06-01');
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

test('normalizeCsvRecord derives missing totals and accepts alternative headers', () => {
  const normalized = normalizeCsvRecord({
    'Transaction Date': '2026-07-04',
    'Merchant Name': 'Alpha Shop',
    Amount: '1,000',
    Commission: '10',
    Delivery: '50',
    'Payment Method': 'bKash',
    'Funded By': 'Online Balance',
  });

  assert.equal(normalized.date, '2026-07-04T00:00');
  assert.equal(normalized.salesAmount, '1000');
  assert.equal(normalized.commissionAmount, '100');
  assert.equal(normalized.merchantBill, '900');
  assert.equal(normalized.deliveryCharge, '50');
  assert.equal(normalized.paidByCustomer, '1050');
  assert.equal(normalized.digitalPaymentMethod, 'bkash');
  assert.equal(normalized.paymentSource, 'online');
});

test('toCsv escapes values and round-trips through parseCsvText', () => {
  const rows = [
    { name: 'Shop, Inc.', note: 'Said "hi"', amount: '100' },
    { name: 'Beta', note: 'Line one\nLine two', amount: '200' },
  ];
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'note', label: 'Note' },
    { key: 'amount', label: 'Amount' },
  ];

  const csv = toCsv(rows, columns);
  const parsed = parseCsvText(csv);

  assert.deepEqual(parsed, [
    { Name: 'Shop, Inc.', Note: 'Said "hi"', Amount: '100' },
    { Name: 'Beta', Note: 'Line one\nLine two', Amount: '200' },
  ]);
});

test('buildSalesCsv exports the expected headers and values', () => {
  const csv = buildSalesCsv([
    {
      date: '2026-06-01T10:30:00',
      month: 'June',
      merchantName: 'Alpha Shop',
      salesAmount: '1500',
      salesType: 'Regular',
      commissionPercent: '15',
      commissionAmount: '225',
      merchantBill: '1275',
      discountPercent: '0',
      discountAmount: '0',
      deliveryCharge: '50',
      paidByCustomer: '1550',
      digitalPaymentMethod: 'bkash',
      paymentSource: 'cash',
      riderName: 'Fahim',
      riderSalary: '100',
      otherExpenseName: 'Packaging',
      otherExpense: '20',
      fixedExpenseName: 'Rent',
      fixedExpense: '300',
      expenseDescription: '',
    },
  ]);

  const [header, firstRow] = csv.split('\r\n');
  assert.ok(header.startsWith('Date,Month,Merchant,Sales Amount,Sales Type'));
  assert.ok(firstRow.startsWith('2026-06-01,June,Alpha Shop,1500,Regular'));
});

test('parseSalesCsv validates rows, builds derived values and generates stable ids', () => {
  const csv = [
    'Date,Merchant,Sales Amount,Type,Commission %,Delivery Charge,Payment Method',
    '2026-06-10,City Store,3200,Parcel,12,50,bKash',
    '2026-06-11,,900,Regular,10,0,Cash',
    '2026-06-12,No Amount,,Regular,10,0,Cash',
    '2026-06-10,City Store,3200,Parcel,12,50,bKash',
  ].join('\n');

  const result = parseSalesCsv(csv);

  assert.equal(result.totalRows, 4);
  assert.equal(result.records.length, 1);
  assert.equal(result.duplicates.length, 1);
  assert.equal(result.errors.length, 2);

  const [record] = result.records;
  assert.equal(record.merchantName, 'City Store');
  assert.equal(record.commissionAmount, '384');
  assert.equal(record.merchantBill, '2816');
  assert.equal(record.paidByCustomer, '3250');
  assert.equal(record.id, buildImportId(record));
  assert.ok(record.id.startsWith('imp_'));
});

test('parseSalesCsv skips rows whose generated id already exists', () => {
  const csv = [
    'Date,Merchant,Sales Amount,Type,Commission %,Delivery Charge',
    '2026-06-10,City Store,3200,Parcel,12,50',
  ].join('\n');

  const first = parseSalesCsv(csv);
  const second = parseSalesCsv(csv, { existingRecords: first.records });

  assert.equal(first.records.length, 1);
  assert.equal(second.records.length, 0);
  assert.equal(second.duplicates.length, 1);
});
