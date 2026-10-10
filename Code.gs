const SHEET_NAME = 'MerchantData';
const PAYMENTS_SHEET = 'BillPayments';
const USERS_SHEET = 'Users';
const AUDIT_SHEET = 'AuditLogs';
const TRANSFERS_SHEET = 'Transfers';
const RECEIVABLES_SHEET = 'Receivables';
const PAYABLES_SHEET = 'Payables';
const OPENING_BALANCES_SHEET = 'OpeningBalances';
const MONTH_CLOSINGS_SHEET = 'MonthClosings';
const OTHER_CASH_RECORDS_SHEET = 'OtherCashRecords';

const SECRET_KEY = 'financial-manager-secret-2026';
const SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

const RECORD_HEADERS = [
  'id',
  'date',
  'month',
  'merchantName',
  'salesAmount',
  'salesType',
  'commissionPercent',
  'commissionAmount',
  'merchantBill',
  'discountPercent',
  'discountAmount',
  'deliveryCharge',
  'otherCashSource',
  'otherCashAmount',
  'paidByCustomer',
  'riderName',
  'riderSalary',
  'otherExpenseName',
  'otherExpense',
  'fixedExpenseName',
  'fixedExpense',
  'expenseDescription',
  'createdAt',
];

const PAYMENT_HEADERS = ['id', 'date', 'merchantName', 'paidAmount', 'notes'];
const USER_HEADERS = ['username', 'passwordHash', 'role', 'status'];
const AUDIT_HEADERS = ['id', 'timestamp', 'username', 'action', 'details'];
const TRANSFER_HEADERS = ['id', 'date', 'amount', 'note'];
const RECEIVABLE_HEADERS = ['id', 'name', 'amount', 'date', 'note', 'status', 'receivedAccount', 'receivedDate'];
const PAYABLE_HEADERS = ['id', 'name', 'amount', 'date', 'note', 'status', 'paidAccount', 'paidDate'];
const OPENING_BALANCE_HEADERS = ['id', 'monthKey', 'month', 'year', 'handCash', 'onlineCash', 'otherCash', 'totalCash', 'source', 'fromMonthKey', 'createdAt', 'createdBy'];
const MONTH_CLOSING_HEADERS = ['id', 'monthKey', 'month', 'year', 'handCash', 'onlineCash', 'otherCash', 'totalCash', 'closedAt', 'createdBy'];
const OTHER_CASH_HEADERS = ['id', 'date', 'month', 'source', 'amount', 'description', 'type', 'createdAt'];

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  ensureSheetHeaders(sheet, headers);

  if (!sheet.getRange('A2').getValue() && name === USERS_SHEET) {
    const defaultAdmin = {
      username: 'admin',
      passwordHash: hashPassword('admin123'),
      role: 'Admin',
      status: 'Active',
    };
    sheet.appendRow(objectToRow(defaultAdmin, USER_HEADERS));
  }

  return sheet;
}

function ensureSheetHeaders(sheet, headers) {
  // FAST CHECK: if sheet row 1 already has headers, skip redundant sheet writes
  if (sheet.getLastRow() >= 1) {
    const firstCell = sheet.getRange(1, 1).getValue();
    if (firstCell) return;
  }
  const currentColumns = Math.max(1, sheet.getLastColumn());

  if (currentColumns < headers.length) {
    sheet.insertColumnsAfter(currentColumns, headers.length - currentColumns);
  }

  // Only write up to the number of defined headers (never exceed our schema)
  const colCount = Math.max(headers.length, sheet.getLastColumn());
  const headerRange = sheet.getRange(1, 1, 1, colCount);
  const headerRow = headers.concat(Array(Math.max(0, colCount - headers.length)).fill(''));
  headerRange.setValues([headerRow]);
  headerRange.setFontWeight('bold');
}

function getSheet() {
  return getOrCreateSheet(SHEET_NAME, RECORD_HEADERS);
}

function getPaymentsSheet() {
  return getOrCreateSheet(PAYMENTS_SHEET, PAYMENT_HEADERS);
}

function getUsersSheet() {
  return getOrCreateSheet(USERS_SHEET, USER_HEADERS);
}

function getAuditSheet() {
  return getOrCreateSheet(AUDIT_SHEET, AUDIT_HEADERS);
}

function getTransfersSheet() {
  return getOrCreateSheet(TRANSFERS_SHEET, TRANSFER_HEADERS);
}

function getReceivablesSheet() {
  return getOrCreateSheet(RECEIVABLES_SHEET, RECEIVABLE_HEADERS);
}

function getPayablesSheet() {
  return getOrCreateSheet(PAYABLES_SHEET, PAYABLE_HEADERS);
}

function getOpeningBalancesSheet() {
  return getOrCreateSheet(OPENING_BALANCES_SHEET, OPENING_BALANCE_HEADERS);
}

function getMonthClosingsSheet() {
  return getOrCreateSheet(MONTH_CLOSINGS_SHEET, MONTH_CLOSING_HEADERS);
}

function getOtherCashRecordsSheet() {
  return getOrCreateSheet(OTHER_CASH_RECORDS_SHEET, OTHER_CASH_HEADERS);
}

// Helper: read all rows from a sheet into an array of objects in one call.
// Avoids the per-action getDataRange().getValues() pattern that causes
// repeated Google Sheets reads when multiple actions fire in parallel.
// Also backfills a stable fallback ID for any rows that have a blank ID cell.
function readAllRows(sheet, headers) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const seenIds = new Set();
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const obj = rowToObject(data[i], headers);
    // If the row has no ID, generate a deterministic fallback so UI can reference it
    if (!obj.id || String(obj.id).trim() === '') {
      obj.id = headers[0] + '_row_' + (i + 1);
    }
    const idKey = String(obj.id).trim();
    if (seenIds.has(idKey)) {
      continue; // Skip duplicate rows with identical ID
    }
    seenIds.add(idKey);
    rows.push(obj);
  }
  return rows;
}

// Single consolidated read for every dataset the Dashboard needs.
// Fires only ONE getDataRange().getValues() per sheet (9 total, zero duplicates).
function getDashboardData() {
  const records          = readAllRows(getSheet(),                 RECORD_HEADERS);
  const payments         = readAllRows(getPaymentsSheet(),         PAYMENT_HEADERS);
  const transfers        = readAllRows(getTransfersSheet(),        TRANSFER_HEADERS);
  const receivables      = readAllRows(getReceivablesSheet(),      RECEIVABLE_HEADERS);
  const payables         = readAllRows(getPayablesSheet(),         PAYABLE_HEADERS);
  const openingBalances  = readAllRows(getOpeningBalancesSheet(),  OPENING_BALANCE_HEADERS);
  const monthClosings    = readAllRows(getMonthClosingsSheet(),    MONTH_CLOSING_HEADERS);
  const otherCashRecords = readAllRows(getOtherCashRecordsSheet(), OTHER_CASH_HEADERS);

  // Derive merchants from the records + payments data we already read
  // (replaces the old getMerchants action which read both sheets AGAIN)
  const merchantSet = new Set();
  records.forEach(r => { if (r.merchantName) merchantSet.add(String(r.merchantName)); });
  payments.forEach(p => { if (p.merchantName) merchantSet.add(String(p.merchantName)); });
  const merchants = Array.from(merchantSet).sort();

  return {
    records,
    payments,
    merchants,
    transfers,
    receivables,
    payables,
    openingBalances,
    monthClosings,
    otherCashRecords,
  };
}

// Helper: convert row array to object based on headers
function formatCellValue(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm:ss');
  }
  return value !== undefined && value !== null ? String(value) : '';
}

function rowToObject(row, headers) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = formatCellValue(row[i]);
  });
  return obj;
}

// Helper: convert object to row array based on headers
function objectToRow(obj, headers) {
  return headers.map(h => obj[h] || '');
}

// Helper: SHA-256 hashing
function hashPassword(password) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  let hex = '';
  for (let i = 0; i < digest.length; i++) {
    let byteVal = digest[i];
    if (byteVal < 0) byteVal += 256;
    let byteString = byteVal.toString(16);
    if (byteString.length === 1) byteString = '0' + byteString;
    hex += byteString;
  }
  return hex;
}

// Helper: compute HMAC signature for tokens
function computeSignature(username, expiry) {
  const data = username + '_' + expiry;
  const signatureBytes = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    data,
    SECRET_KEY
  );
  let hex = '';
  for (let i = 0; i < signatureBytes.length; i++) {
    let byteVal = signatureBytes[i];
    if (byteVal < 0) byteVal += 256;
    let byteString = byteVal.toString(16);
    if (byteString.length === 1) byteString = '0' + byteString;
    hex += byteString;
  }
  return hex;
}

// Helper: generate web-safe session token
function generateSessionToken(username) {
  const expiry = String(new Date().getTime() + SESSION_LIFETIME_MS);
  const signature = computeSignature(username, expiry);
  const tokenObj = { username, expiry, signature };
  return Utilities.base64EncodeWebSafe(JSON.stringify(tokenObj));
}

// Helper: verify token and return username if valid, otherwise null
function verifySessionToken(tokenStr) {
  if (!tokenStr) return null;
  try {
    const rawJson = Utilities.newBlob(Utilities.base64DecodeWebSafe(tokenStr)).getDataAsString();
    const tokenObj = JSON.parse(rawJson);
    const { username, expiry, signature } = tokenObj;

    if (new Date().getTime() > Number(expiry)) return null;

    const expected = computeSignature(username, expiry);
    if (signature !== expected) return null;

    // Check if user is still active in database
    const user = getUser(username);
    if (!user || user.status !== 'Active') return null;

    return user;
  } catch (err) {
    return null;
  }
}

// Get user data
function getUser(username) {
  const sheet = getUsersSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === username) {
      return rowToObject(data[i], USER_HEADERS);
    }
  }
  return null;
}

// Log audit trail
function logAudit(username, action, details) {
  const sheet = getAuditSheet();
  const id = new Date().getTime().toString() + '_' + Math.floor(Math.random() * 1000);
  const timestamp = new Date().toISOString();
  const row = objectToRow({ id, timestamp, username, action, details }, AUDIT_HEADERS);
  sheet.appendRow(row);
}

// Find row index by ID — dynamically determines ID column and prevents blank-row matching
function findRowById(sheet, id, headers) {
  const idStr = String(id || '').trim();
  if (!idStr) return -1; // Never match on empty ID

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;

  let idCol = 1; // 1-indexed for Sheets getRange
  const headerValues = sheet.getRange(1, 1, 1, Math.min(sheet.getLastColumn(), 25)).getValues()[0];
  if (headerValues && Array.isArray(headerValues)) {
    const sheetColIdx = headerValues.findIndex(h => String(h || '').trim().toLowerCase() === 'id');
    if (sheetColIdx !== -1) idCol = sheetColIdx + 1;
  } else if (headers && Array.isArray(headers)) {
    const headerIdx = headers.indexOf('id');
    if (headerIdx !== -1) idCol = headerIdx + 1;
  }

  // Read only the ID column range instead of getDataRange() (95% fewer cells to read)
  const idValues = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  for (let i = 0; i < idValues.length; i++) {
    if (String(idValues[i][0] || '').trim() === idStr) return i + 2;
  }
  return -1;
}

// Safe cleanup utility for existing duplicate rows in sheets
function cleanupDuplicateSalesRecords() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 2) return { success: true, removedCount: 0 };

    let idCol = 0;
    if (data[0] && Array.isArray(data[0])) {
      const idx = data[0].findIndex(h => String(h || '').trim().toLowerCase() === 'id');
      if (idx !== -1) idCol = idx;
    }

    const seenIds = new Set();
    const rowsToDelete = [];

    // Scan top to bottom; keep the first valid occurrence of each ID, mark later duplicates
    for (let i = 1; i < data.length; i++) {
      const rowId = String(data[i][idCol] || '').trim();
      if (!rowId) continue; // Don't delete legacy un-identified rows automatically
      if (seenIds.has(rowId)) {
        rowsToDelete.push(i + 1); // 1-indexed sheet row
      } else {
        seenIds.add(rowId);
      }
    }

    // Delete marked duplicate rows from bottom to top to preserve row indices
    for (let j = rowsToDelete.length - 1; j >= 0; j--) {
      sheet.deleteRow(rowsToDelete[j]);
    }

    SpreadsheetApp.flush();
    logAudit('SYSTEM', 'Cleanup Duplicate Sales Records', `Removed ${rowsToDelete.length} duplicate rows. Kept 1 valid row per ID.`);

    return { success: true, removedCount: rowsToDelete.length };
  } finally {
    lock.releaseLock();
  }
}

// Add custom menu to Google Sheets for one-click safe duplicate cleanup
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Financial Manager')
      .addItem('Clean Up Duplicate Records', 'cleanupDuplicateSalesRecords')
      .addToUi();
  } catch (e) {
    // Suppress if running in headless context
  }
}

// Find row index by a specific column value (e.g. monthKey)
function findRowByKey(sheet, headers, column, value) {
  const colIdx = headers.indexOf(column);
  if (colIdx === -1) return -1;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colIdx]) === String(value)) return i + 1;
  }
  return -1;
}

// Tolerant month lookup: matches "2026-09" against stored "2026-09",
// "2026-09-01" or "2026-09-01T00:00:00Z" (Google Sheets date values)
function findRowByMonthPrefix(sheet, headers, column, value) {
  const colIdx = headers.indexOf(column);
  if (colIdx === -1) return -1;
  const prefix = String(value).slice(0, 7);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const stored = String(data[i][colIdx]);
    if (stored === String(value) || stored.slice(0, 7) === prefix) return i + 1;
  }
  return -1;
}

function getOpeningBalancesList() {
  const sheet = getOpeningBalancesSheet();
  const data = sheet.getDataRange().getValues();
  return data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, OPENING_BALANCE_HEADERS));
}

function setOpeningBalanceEntry(entry, user) {
  if (!entry || !entry.monthKey) throw new Error('Opening balance requires a month key.');

  const currentMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  // Previous months must remain unchanged
  if (String(entry.monthKey) < currentMonth) {
    throw new Error('Opening balance for past months cannot be changed.');
  }

  const sheet = getOpeningBalancesSheet();
  const handCash = parseFloat(entry.handCash) || 0;
  const onlineCash = parseFloat(entry.onlineCash) || 0;
  const otherCash = parseFloat(entry.otherCash) || 0;

  const rowIndex = findRowByKey(sheet, OPENING_BALANCE_HEADERS, 'monthKey', String(entry.monthKey));

  // Preserve original metadata when updating an existing month record
  let id = entry.id || 'ob_' + new Date().getTime().toString();
  let createdAt = entry.createdAt || new Date().toISOString();
  let createdBy = entry.createdBy || user;
  if (rowIndex !== -1) {
    const existingRow = sheet.getRange(rowIndex, 1, 1, OPENING_BALANCE_HEADERS.length).getValues()[0];
    const existing = rowToObject(existingRow, OPENING_BALANCE_HEADERS);
    if (existing.id && !entry.id) id = existing.id;
    if (existing.createdAt && !entry.createdAt) createdAt = existing.createdAt;
    if (existing.createdBy && !entry.createdBy) createdBy = existing.createdBy;
  }

  const entryObj = {
    id,
    monthKey: String(entry.monthKey),
    month: entry.month || '',
    year: entry.year || '',
    handCash,
    onlineCash,
    otherCash,
    totalCash: entry.totalCash ? Number(entry.totalCash) : handCash + onlineCash + otherCash,
    source: entry.source === 'carried_forward' ? 'carried_forward' : 'manual',
    fromMonthKey: entry.fromMonthKey || '',
    createdAt,
    createdBy,
  };

  const row = objectToRow(entryObj, OPENING_BALANCE_HEADERS);
  if (rowIndex === -1) {
    sheet.appendRow(row);
  } else {
    sheet.getRange(rowIndex, 1, 1, OPENING_BALANCE_HEADERS.length).setValues([row]);
  }

  const sourceLabel = entryObj.source === 'carried_forward' ? 'Carried Forward' : 'Manual Entry';
  logAudit(
    user,
    'Set Opening Balance',
    `Month: ${entryObj.monthKey} — Total: ৳${entryObj.totalCash} (Hand: ৳${handCash}, Online: ৳${onlineCash}, Other: ৳${otherCash}) Source: ${sourceLabel}`
  );
  return { success: true, id: entryObj.id };
}

function deleteOpeningBalanceEntry(params, user) {
  const id = params && params.id ? String(params.id) : null;
  const monthKey = params && params.monthKey ? String(params.monthKey) : null;
  if (!id && !monthKey) throw new Error('Opening balance requires a month key.');

  const currentMonth = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
  if (monthKey && String(monthKey).slice(0, 7) < currentMonth) {
    throw new Error('Opening balance for past months cannot be removed.');
  }

  const sheet = getOpeningBalancesSheet();
  let rowIndex = -1;
  if (id) {
    rowIndex = findRowById(sheet, id, OPENING_BALANCE_HEADERS);
  }
  if (rowIndex === -1 && monthKey) {
    rowIndex = findRowByMonthPrefix(sheet, OPENING_BALANCE_HEADERS, 'monthKey', monthKey);
  }
  if (rowIndex === -1) throw new Error('Opening balance not found.');

  // Fetch details before delete for audit logs
  const detailsRow = sheet.getRange(rowIndex, 1, 1, OPENING_BALANCE_HEADERS.length).getValues()[0];
  const detailsObj = rowToObject(detailsRow, OPENING_BALANCE_HEADERS);

  sheet.deleteRow(rowIndex);
  logAudit(
    user,
    'Delete Opening Balance',
    `Month: ${detailsObj.monthKey} — Total: ৳${detailsObj.totalCash} (Hand: ৳${detailsObj.handCash}, Online: ৳${detailsObj.onlineCash}, Other: ৳${detailsObj.otherCash})`
  );
  return { success: true };
}

function getMonthClosingsList() {
  const sheet = getMonthClosingsSheet();
  const data = sheet.getDataRange().getValues();
  return data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, MONTH_CLOSING_HEADERS));
}

function createMonthClosingEntry(entry, user) {
  if (!entry || !entry.monthKey) throw new Error('Month closing requires a month key.');

  const sheet = getMonthClosingsSheet();

  // Duplicate guard — one closing per calendar month
  const rowIndex = findRowByKey(sheet, MONTH_CLOSING_HEADERS, 'monthKey', String(entry.monthKey));
  if (rowIndex !== -1) {
    throw new Error(`Month "${entry.month} ${entry.year}" is already closed. Only one closing per month is allowed.`);
  }

  const handCash = parseFloat(entry.handCash) || 0;
  const onlineCash = parseFloat(entry.onlineCash) || 0;
  const otherCash = parseFloat(entry.otherCash) || 0;

  const entryObj = {
    id: entry.id || 'mc_' + new Date().getTime().toString(),
    monthKey: String(entry.monthKey),
    month: entry.month || '',
    year: entry.year || '',
    handCash,
    onlineCash,
    otherCash,
    totalCash: entry.totalCash ? Number(entry.totalCash) : handCash + onlineCash + otherCash,
    closedAt: entry.closedAt || new Date().toISOString(),
    createdBy: entry.createdBy || user,
  };

  sheet.appendRow(objectToRow(entryObj, MONTH_CLOSING_HEADERS));

  logAudit(
    user,
    'Month Closing',
    `Closed ${entryObj.month} ${entryObj.year} — Total: ৳${entryObj.totalCash} (Hand: ৳${handCash}, Online: ৳${onlineCash}, Other: ৳${otherCash})`
  );
  return { success: true, id: entryObj.id };
}

// Handle GET request (JSONP / Fetch)
function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback;

  const record = parseJsonParam(e.parameter.record);
  const payment = parseJsonParam(e.parameter.payment);
  const transfer = parseJsonParam(e.parameter.transfer);
  const entry = parseJsonParam(e.parameter.entry);
  const id = e.parameter.id;
  const token = e.parameter.sessionToken;

  // Public actions
  if (action === 'login') {
    const username = e.parameter.username;
    const password = e.parameter.password;
    if (!username || !password) {
      return jsonResponse({ success: false, error: 'Username and password required' }, callback);
    }
    const user = getUser(username);
    if (!user) {
      logAudit('SYSTEM', 'Login Failed', `Username: ${username} (User not found)`);
      return jsonResponse({ success: false, error: 'Invalid credentials' }, callback);
    }
    if (user.status !== 'Active') {
      logAudit(username, 'Login Blocked', 'Account is suspended');
      return jsonResponse({ success: false, error: 'Account suspended' }, callback);
    }
    const enteredHash = hashPassword(password);
    if (user.passwordHash !== enteredHash) {
      logAudit(username, 'Login Failed', 'Incorrect password');
      return jsonResponse({ success: false, error: 'Invalid credentials' }, callback);
    }

    const sessionToken = generateSessionToken(username);
    logAudit(username, 'Login Success', 'User successfully authenticated');
    return jsonResponse(
      {
        success: true,
        username: user.username,
        role: user.role,
        sessionToken,
      },
      callback
    );
  }

  // For all other actions, verify token
  const currentUser = verifySessionToken(token);
  if (!currentUser) {
    return jsonResponse(
      { success: false, error: 'Unauthorized: Session invalid or expired' },
      callback
    );
  }

  const user = currentUser.username;
  const isAdmin = currentUser.role === 'Admin';

  try {
    // Sales Records Actions
    if (action === 'getAll') {
      const sheet = getSheet();
      const records = readAllRows(sheet, RECORD_HEADERS);
      return jsonResponse({ success: true, records }, callback);
    }

    if (action === 'create') {
      const tStart = new Date().getTime();
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const tLocked = new Date().getTime();
        const sheet = getSheet();
        if (!record.id) record.id = new Date().getTime().toString();
        if (!record.createdAt) record.createdAt = new Date().toISOString();
        // Idempotency: if a row with this ID already exists, return success without appending
        const existingRow = findRowById(sheet, record.id, RECORD_HEADERS);
        const tChecked = new Date().getTime();
        if (existingRow !== -1) {
          console.log(`[Perf] create sales record: duplicate prevented in ${tChecked - tStart}ms`);
          return jsonResponse({ success: true, id: record.id, duplicatePrevented: true }, callback);
        }
        sheet.appendRow(objectToRow(record, RECORD_HEADERS));
        SpreadsheetApp.flush();
        const tFlushed = new Date().getTime();
        logAudit(
          user,
          'Create Sales Record',
          `ID: ${record.id}, Merchant: ${record.merchantName}, Amount: ৳${record.salesAmount}`
        );
        console.log(`[Perf] create sales record: total ${tFlushed - tStart}ms (lock: ${tLocked - tStart}ms, check: ${tChecked - tLocked}ms, append: ${tFlushed - tChecked}ms)`);
        return jsonResponse({ success: true, id: record.id }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'update') {
      const sheet = getSheet();
      const row = findRowById(sheet, record.id, RECORD_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Record not found' }, callback);
      sheet
        .getRange(row, 1, 1, RECORD_HEADERS.length)
        .setValues([objectToRow(record, RECORD_HEADERS)]);
      logAudit(
        user,
        'Update Sales Record',
        `ID: ${record.id}, Merchant: ${record.merchantName}, Amount: ৳${record.salesAmount}`
      );
      return jsonResponse({ success: true }, callback);
    }

    if (action === 'delete') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getSheet();
        const row = findRowById(sheet, id, RECORD_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Record not found' }, callback);
        const detailsRow = sheet.getRange(row, 1, 1, RECORD_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, RECORD_HEADERS);
        sheet.deleteRow(row);
        logAudit(
          user,
          'Delete Sales Record',
          `ID: ${id}, Merchant: ${detailsObj.merchantName}, Amount: ৳${detailsObj.salesAmount}`
        );
        return jsonResponse({ success: true }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'deleteAllRecords') {
      const sheet = getSheet();
      const rowCount = sheet.getLastRow();
      if (rowCount > 1) {
        sheet.deleteRows(2, rowCount - 1);
      }
      logAudit(user, 'Delete All Sales Records', 'All sales records cleared');
      return jsonResponse({ success: true }, callback);
    }

    // Payment Actions
    if (action === 'getPayments') {
      const sheet = getPaymentsSheet();
      const data = sheet.getDataRange().getValues();
      const payments =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, PAYMENT_HEADERS));
      return jsonResponse({ success: true, payments }, callback);
    }

    if (action === 'createPayment') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getPaymentsSheet();
        if (!payment.id) payment.id = 'p' + new Date().getTime().toString();
        // Idempotency check
        if (findRowById(sheet, payment.id, PAYMENT_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: payment.id, duplicatePrevented: true }, callback);
        }
        sheet.appendRow(objectToRow(payment, PAYMENT_HEADERS));
        logAudit(
          user,
          'Record Payment',
          `ID: ${payment.id}, Merchant: ${payment.merchantName}, Paid: ৳${payment.paidAmount}`
        );
        return jsonResponse({ success: true, id: payment.id }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'updatePayment') {
      const sheet = getPaymentsSheet();
      const row = findRowById(sheet, payment.id, PAYMENT_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Payment not found' }, callback);
      sheet
        .getRange(row, 1, 1, PAYMENT_HEADERS.length)
        .setValues([objectToRow(payment, PAYMENT_HEADERS)]);
      logAudit(
        user,
        'Update Payment',
        `ID: ${payment.id}, Merchant: ${payment.merchantName}, Paid: ৳${payment.paidAmount}`
      );
      return jsonResponse({ success: true }, callback);
    }

    if (action === 'deletePayment') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getPaymentsSheet();
        const row = findRowById(sheet, id, PAYMENT_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Payment not found' }, callback);
        const detailsRow = sheet.getRange(row, 1, 1, PAYMENT_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, PAYMENT_HEADERS);
        sheet.deleteRow(row);
        logAudit(
          user,
          'Delete Payment',
          `ID: ${id}, Merchant: ${detailsObj.merchantName}, Paid: ৳${detailsObj.paidAmount}`
        );
        return jsonResponse({ success: true }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    // Transfer Actions
    if (action === 'getTransfers') {
      const sheet = getTransfersSheet();
      const data = sheet.getDataRange().getValues();
      const transfers =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, TRANSFER_HEADERS));
      return jsonResponse({ success: true, transfers }, callback);
    }

    if (action === 'createTransfer') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getTransfersSheet();
        if (!transfer.id) transfer.id = 't' + new Date().getTime().toString();
        // Idempotency check
        if (findRowById(sheet, transfer.id, TRANSFER_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: transfer.id, duplicatePrevented: true }, callback);
        }
        sheet.appendRow(objectToRow(transfer, TRANSFER_HEADERS));
        logAudit(
          user,
          'bKash Transfer',
          `ID: ${transfer.id}, Amount: ৳${transfer.amount}, Note: ${transfer.note || '—'}`
        );
        return jsonResponse({ success: true, id: transfer.id }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'deleteTransfer') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getTransfersSheet();
        const row = findRowById(sheet, id, TRANSFER_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Transfer not found' }, callback);
        const detailsRow = sheet.getRange(row, 1, 1, TRANSFER_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, TRANSFER_HEADERS);
        sheet.deleteRow(row);
        logAudit(
          user,
          'Delete bKash Transfer',
          `ID: ${id}, Amount: ৳${detailsObj.amount}`
        );
        return jsonResponse({ success: true }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    // Receivable Actions (Money I Will Receive)
    if (action === 'getReceivables') {
      const sheet = getReceivablesSheet();
      const data = sheet.getDataRange().getValues();
      const receivables =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, RECEIVABLE_HEADERS));
      return jsonResponse({ success: true, receivables }, callback);
    }

    if (action === 'createReceivable') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getReceivablesSheet();
        const receivable = parseJsonParam(e.parameter.receivable);
        if (!receivable) return jsonResponse({ success: false, error: 'Missing receivable data' }, callback);
        if (!receivable.id) receivable.id = 'recv_' + new Date().getTime().toString();
        if (!receivable.status) receivable.status = 'Not Received';
        if (findRowById(sheet, receivable.id, RECEIVABLE_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: receivable.id, duplicatePrevented: true }, callback);
        }
        sheet.appendRow(objectToRow(receivable, RECEIVABLE_HEADERS));
        logAudit(user, 'Create Receivable', `ID: ${receivable.id}, Name: ${receivable.name}, Amount: ৳${receivable.amount}`);
        return jsonResponse({ success: true, id: receivable.id }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'updateReceivable') {
      const sheet = getReceivablesSheet();
      const receivable = parseJsonParam(e.parameter.receivable);
      if (!receivable) return jsonResponse({ success: false, error: 'Missing receivable data' }, callback);
      const row = findRowById(sheet, receivable.id, RECEIVABLE_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Receivable not found' }, callback);
      sheet.getRange(row, 1, 1, RECEIVABLE_HEADERS.length).setValues([objectToRow(receivable, RECEIVABLE_HEADERS)]);
      logAudit(user, 'Update Receivable', `ID: ${receivable.id}, Name: ${receivable.name}, Status: ${receivable.status}`);
      return jsonResponse({ success: true }, callback);
    }

    if (action === 'deleteReceivable') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getReceivablesSheet();
        const row = findRowById(sheet, id, RECEIVABLE_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Receivable not found' }, callback);
        const detailsRow = sheet.getRange(row, 1, 1, RECEIVABLE_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, RECEIVABLE_HEADERS);
        sheet.deleteRow(row);
        logAudit(user, 'Delete Receivable', `ID: ${id}, Name: ${detailsObj.name}, Amount: ৳${detailsObj.amount}`);
        return jsonResponse({ success: true }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    // Payable Actions (Money I Owe)
    if (action === 'getPayables') {
      const sheet = getPayablesSheet();
      const data = sheet.getDataRange().getValues();
      const payables =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, PAYABLE_HEADERS));
      return jsonResponse({ success: true, payables }, callback);
    }

    if (action === 'createPayable') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getPayablesSheet();
        const payable = parseJsonParam(e.parameter.payable);
        if (!payable) return jsonResponse({ success: false, error: 'Missing payable data' }, callback);
        if (!payable.id) payable.id = 'pay_' + new Date().getTime().toString();
        if (!payable.status) payable.status = 'Unpaid';
        if (findRowById(sheet, payable.id, PAYABLE_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: payable.id, duplicatePrevented: true }, callback);
        }
        sheet.appendRow(objectToRow(payable, PAYABLE_HEADERS));
        logAudit(user, 'Create Payable', `ID: ${payable.id}, Name: ${payable.name}, Amount: ৳${payable.amount}`);
        return jsonResponse({ success: true, id: payable.id }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'updatePayable') {
      const sheet = getPayablesSheet();
      const payable = parseJsonParam(e.parameter.payable);
      if (!payable) return jsonResponse({ success: false, error: 'Missing payable data' }, callback);
      const row = findRowById(sheet, payable.id, PAYABLE_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Payable not found' }, callback);
      sheet.getRange(row, 1, 1, PAYABLE_HEADERS.length).setValues([objectToRow(payable, PAYABLE_HEADERS)]);
      logAudit(user, 'Update Payable', `ID: ${payable.id}, Name: ${payable.name}, Status: ${payable.status}`);
      return jsonResponse({ success: true }, callback);
    }

    if (action === 'deletePayable') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getPayablesSheet();
        const row = findRowById(sheet, id, PAYABLE_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Payable not found' }, callback);
        const detailsRow = sheet.getRange(row, 1, 1, PAYABLE_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, PAYABLE_HEADERS);
        sheet.deleteRow(row);
        logAudit(user, 'Delete Payable', `ID: ${id}, Name: ${detailsObj.name}, Amount: ৳${detailsObj.amount}`);
        return jsonResponse({ success: true }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    // Other Cash Records Actions
    if (action === 'getOtherCashRecords') {
      const sheet = getOtherCashRecordsSheet();
      const data = sheet.getDataRange().getValues();
      const otherCashRecords =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, OTHER_CASH_HEADERS));
      return jsonResponse({ success: true, otherCashRecords }, callback);
    }

    if (action === 'createOtherCashRecord') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getOtherCashRecordsSheet();
        const ocRecord = parseJsonParam(e.parameter.record);
        if (!ocRecord) return jsonResponse({ success: false, error: 'Missing record data' }, callback);
        if (!ocRecord.id) ocRecord.id = 'oc_' + new Date().getTime().toString();
        if (!ocRecord.createdAt) ocRecord.createdAt = new Date().toISOString();
        if (findRowById(sheet, ocRecord.id, OTHER_CASH_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: ocRecord.id, duplicatePrevented: true }, callback);
        }
        sheet.appendRow(objectToRow(ocRecord, OTHER_CASH_HEADERS));
        logAudit(user, 'Create Other Cash Record', `ID: ${ocRecord.id}, Type: ${ocRecord.type}, Source: ${ocRecord.source}, Amount: ৳${ocRecord.amount}`);
        return jsonResponse({ success: true, id: ocRecord.id }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'updateOtherCashRecord') {
      const sheet = getOtherCashRecordsSheet();
      const ocRecord = parseJsonParam(e.parameter.record);
      if (!ocRecord) return jsonResponse({ success: false, error: 'Missing record data' }, callback);
      const row = findRowById(sheet, ocRecord.id, OTHER_CASH_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Other cash record not found' }, callback);
      sheet.getRange(row, 1, 1, OTHER_CASH_HEADERS.length).setValues([objectToRow(ocRecord, OTHER_CASH_HEADERS)]);
      logAudit(user, 'Update Other Cash Record', `ID: ${ocRecord.id}, Type: ${ocRecord.type}, Source: ${ocRecord.source}, Amount: ৳${ocRecord.amount}`);
      return jsonResponse({ success: true }, callback);
    }

    if (action === 'deleteOtherCashRecord') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getOtherCashRecordsSheet();
        const row = findRowById(sheet, id, OTHER_CASH_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Other cash record not found' }, callback);
        const detailsRow = sheet.getRange(row, 1, 1, OTHER_CASH_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, OTHER_CASH_HEADERS);
        sheet.deleteRow(row);
        logAudit(user, 'Delete Other Cash Record', `ID: ${id}, Type: ${detailsObj.type}, Source: ${detailsObj.source}, Amount: ৳${detailsObj.amount}`);
        return jsonResponse({ success: true }, callback);
      } finally {
        lock.releaseLock();
      }
    }

    // Opening Balance Actions (One record per calendar month)
    if (action === 'getOpeningBalances') {
      return jsonResponse({ success: true, openingBalances: getOpeningBalancesList() }, callback);
    }

    if (action === 'setOpeningBalance') {
      return jsonResponse(setOpeningBalanceEntry(entry, user), callback);
    }

    if (action === 'deleteOpeningBalance') {
      return jsonResponse(deleteOpeningBalanceEntry(
        { id: e.parameter.id || (entry ? entry.id : null), monthKey: e.parameter.monthKey || (entry ? entry.monthKey : id) }, user
      ), callback);
    }

    // Month Closing Actions
    if (action === 'getMonthClosings') {
      return jsonResponse({ success: true, monthClosings: getMonthClosingsList() }, callback);
    }

    if (action === 'createMonthClosing') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        return jsonResponse(createMonthClosingEntry(entry, user), callback);
      } finally {
        lock.releaseLock();
      }
    }

    // Other Cash Records Actions
    if (action === 'getOtherCashRecords') {
      const sheet = getOtherCashRecordsSheet();
      const data = sheet.getDataRange().getValues();
      const otherCashRecords =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, OTHER_CASH_HEADERS));
      return jsonResponse({ success: true, otherCashRecords }, callback);
    }

    // Consolidated dashboard read — one call replaces 9 separate ones
    if (action === 'getDashboardData') {
      return jsonResponse({ success: true, ...getDashboardData() }, callback);
    }

    if (action === 'getMerchants') {
      const sheet = getSheet();
      const data = sheet.getDataRange().getValues();
      const merchants = new Set();
      if (data.length > 1) {
        data.slice(1).forEach(r => {
          if (r[3]) merchants.add(String(r[3]));
        });
      }
      const paySheet = getPaymentsSheet();
      const payData = paySheet.getDataRange().getValues();
      if (payData.length > 1) {
        payData.slice(1).forEach(p => {
          if (p[2]) merchants.add(String(p[2]));
        });
      }
      return jsonResponse({ success: true, merchants: Array.from(merchants).sort() }, callback);
    }

    // ADMIN ONLY ACTIONS
    if (action === 'getUsers') {
      if (!isAdmin)
        return jsonResponse({ success: false, error: 'Access Denied: Admins only' }, callback);
      const sheet = getUsersSheet();
      const data = sheet.getDataRange().getValues();
      const users =
        data.length <= 1
          ? []
          : data.slice(1).map(row => {
              const u = rowToObject(row, USER_HEADERS);
              delete u.passwordHash; // Don't expose hash to the frontend
              return u;
            });
      return jsonResponse({ success: true, users }, callback);
    }

    if (action === 'createUser') {
      if (!isAdmin)
        return jsonResponse({ success: false, error: 'Access Denied: Admins only' }, callback);
      const newUser = parseJsonParam(e.parameter.user);
      if (!newUser || !newUser.username || !newUser.password) {
        return jsonResponse({ success: false, error: 'Invalid user parameters' }, callback);
      }
      if (getUser(newUser.username)) {
        return jsonResponse({ success: false, error: 'Username already exists' }, callback);
      }
      const sheet = getUsersSheet();
      const rowObj = {
        username: newUser.username,
        passwordHash: hashPassword(newUser.password),
        role: newUser.role || 'User',
        status: newUser.status || 'Active',
      };
      sheet.appendRow(objectToRow(rowObj, USER_HEADERS));
      logAudit(user, 'Create User', `Username: ${newUser.username}, Role: ${rowObj.role}`);
      return jsonResponse({ success: true }, callback);
    }

    if (action === 'updateUser') {
      if (!isAdmin)
        return jsonResponse({ success: false, error: 'Access Denied: Admins only' }, callback);
      const userPayload = parseJsonParam(e.parameter.user);
      if (!userPayload || !userPayload.username) {
        return jsonResponse({ success: false, error: 'Username is required' }, callback);
      }
      const sheet = getUsersSheet();
      const row = findRowById(sheet, userPayload.username, USER_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'User not found' }, callback);

      const existingRow = sheet.getRange(row, 1, 1, USER_HEADERS.length).getValues()[0];
      const existingUser = rowToObject(existingRow, USER_HEADERS);

      // Update fields
      if (userPayload.role) existingUser.role = userPayload.role;
      if (userPayload.status) existingUser.status = userPayload.status;
      if (userPayload.password) existingUser.passwordHash = hashPassword(userPayload.password);

      // Prevent admin from suspending themselves
      if (existingUser.username === user && existingUser.status !== 'Active') {
        return jsonResponse(
          { success: false, error: 'You cannot suspend your own admin account' },
          callback
        );
      }

      sheet
        .getRange(row, 1, 1, USER_HEADERS.length)
        .setValues([objectToRow(existingUser, USER_HEADERS)]);
      logAudit(
        user,
        'Update User',
        `Username: ${userPayload.username}, Role: ${existingUser.role}, Status: ${existingUser.status}`
      );
      return jsonResponse({ success: true }, callback);
    }

    if (action === 'deleteUser') {
      if (!isAdmin)
        return jsonResponse({ success: false, error: 'Access Denied: Admins only' }, callback);
      const targetUser = e.parameter.targetUsername;
      if (!targetUser)
        return jsonResponse({ success: false, error: 'Target username required' }, callback);
      if (targetUser === user)
        return jsonResponse({ success: false, error: 'You cannot delete yourself' }, callback);

      const sheet = getUsersSheet();
      const row = findRowById(sheet, targetUser, USER_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'User not found' }, callback);

      sheet.deleteRow(row);
      logAudit(user, 'Delete User', `Username: ${targetUser}`);
      return jsonResponse({ success: true }, callback);
    }

    if (action === 'getAuditLogs') {
      if (!isAdmin)
        return jsonResponse({ success: false, error: 'Access Denied: Admins only' }, callback);
      const sheet = getAuditSheet();
      const data = sheet.getDataRange().getValues();
      const logs =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, AUDIT_HEADERS));
      return jsonResponse({ success: true, logs: logs.reverse() }, callback); // Return newest logs first
    }

    if (action === 'cleanupDuplicates') {
      if (!isAdmin)
        return jsonResponse({ success: false, error: 'Access Denied: Admins only' }, callback);
      const res = cleanupDuplicateSalesRecords();
      return jsonResponse(res, callback);
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action }, callback);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, callback);
  }
}

// POST handler for direct API execution (CORS-friendly apps)
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const {
      action,
      username,
      password,
      sessionToken,
      record,
      payment,
      transfer,
      receivable,
      payable,
      entry,
      id,
      user: userPayload,
      targetUsername,
    } = body;

    // Public actions
    if (action === 'login') {
      if (!username || !password) {
        return jsonResponse({ success: false, error: 'Username and password required' });
      }
      const user = getUser(username);
      if (!user) {
        logAudit('SYSTEM', 'Login Failed', `Username: ${username} (User not found)`);
        return jsonResponse({ success: false, error: 'Invalid credentials' });
      }
      if (user.status !== 'Active') {
        logAudit(username, 'Login Blocked', 'Account is suspended');
        return jsonResponse({ success: false, error: 'Account suspended' });
      }
      const enteredHash = hashPassword(password);
      if (user.passwordHash !== enteredHash) {
        logAudit(username, 'Login Failed', 'Incorrect password');
        return jsonResponse({ success: false, error: 'Invalid credentials' });
      }

      const token = generateSessionToken(username);
      logAudit(username, 'Login Success', 'User successfully authenticated');
      return jsonResponse({
        success: true,
        username: user.username,
        role: user.role,
        sessionToken: token,
      });
    }

    // Check credentials
    const currentUser = verifySessionToken(sessionToken);
    if (!currentUser) {
      return jsonResponse({ success: false, error: 'Unauthorized: Session invalid or expired' });
    }

    const user = currentUser.username;
    const isAdmin = currentUser.role === 'Admin';

    // Sales Records Actions
    if (action === 'getAll') {
      const sheet = getSheet();
      const records = readAllRows(sheet, RECORD_HEADERS);
      return jsonResponse({ success: true, records });
    }

    if (action === 'create') {
      const tStart = new Date().getTime();
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const tLocked = new Date().getTime();
        const sheet = getSheet();
        if (!record.id) record.id = new Date().getTime().toString();
        if (!record.createdAt) record.createdAt = new Date().toISOString();
        // Idempotency: if a row with this ID already exists, return success without appending
        const existingRow = findRowById(sheet, record.id, RECORD_HEADERS);
        const tChecked = new Date().getTime();
        if (existingRow !== -1) {
          console.log(`[Perf] create sales record (POST): duplicate prevented in ${tChecked - tStart}ms`);
          return jsonResponse({ success: true, id: record.id, duplicatePrevented: true });
        }
        sheet.appendRow(objectToRow(record, RECORD_HEADERS));
        SpreadsheetApp.flush();
        const tFlushed = new Date().getTime();
        logAudit(
          user,
          'Create Sales Record',
          `ID: ${record.id}, Merchant: ${record.merchantName}, Amount: ৳${record.salesAmount}`
        );
        console.log(`[Perf] create sales record (POST): total ${tFlushed - tStart}ms (lock: ${tLocked - tStart}ms, check: ${tChecked - tLocked}ms, append: ${tFlushed - tChecked}ms)`);
        return jsonResponse({ success: true, id: record.id });
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'update') {
      const sheet = getSheet();
      const row = findRowById(sheet, record.id, RECORD_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Record not found' });
      sheet
        .getRange(row, 1, 1, RECORD_HEADERS.length)
        .setValues([objectToRow(record, RECORD_HEADERS)]);
      logAudit(
        user,
        'Update Sales Record',
        `ID: ${record.id}, Merchant: ${record.merchantName}, Amount: ৳${record.salesAmount}`
      );
      return jsonResponse({ success: true });
    }

    if (action === 'delete') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getSheet();
        const row = findRowById(sheet, id, RECORD_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Record not found' });
        const detailsRow = sheet.getRange(row, 1, 1, RECORD_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, RECORD_HEADERS);
        sheet.deleteRow(row);
        logAudit(
          user,
          'Delete Sales Record',
          `ID: ${id}, Merchant: ${detailsObj.merchantName}, Amount: ৳${detailsObj.salesAmount}`
        );
        return jsonResponse({ success: true });
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'deleteAllRecords') {
      const sheet = getSheet();
      const rowCount = sheet.getLastRow();
      if (rowCount > 1) {
        sheet.deleteRows(2, rowCount - 1);
      }
      logAudit(user, 'Delete All Sales Records', 'All sales records cleared');
      return jsonResponse({ success: true });
    }

    // Payment Actions
    if (action === 'getPayments') {
      const sheet = getPaymentsSheet();
      const data = sheet.getDataRange().getValues();
      const payments =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, PAYMENT_HEADERS));
      return jsonResponse({ success: true, payments });
    }

    if (action === 'createPayment') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getPaymentsSheet();
        if (!payment.id) payment.id = 'p' + new Date().getTime().toString();
        // Idempotency check
        if (findRowById(sheet, payment.id, PAYMENT_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: payment.id, duplicatePrevented: true });
        }
        sheet.appendRow(objectToRow(payment, PAYMENT_HEADERS));
        logAudit(
          user,
          'Record Payment',
          `ID: ${payment.id}, Merchant: ${payment.merchantName}, Paid: ৳${payment.paidAmount}`
        );
        return jsonResponse({ success: true, id: payment.id });
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'updatePayment') {
      const sheet = getPaymentsSheet();
      const row = findRowById(sheet, payment.id, PAYMENT_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Payment not found' });
      sheet
        .getRange(row, 1, 1, PAYMENT_HEADERS.length)
        .setValues([objectToRow(payment, PAYMENT_HEADERS)]);
      logAudit(
        user,
        'Update Payment',
        `ID: ${payment.id}, Merchant: ${payment.merchantName}, Paid: ৳${payment.paidAmount}`
      );
      return jsonResponse({ success: true });
    }

    if (action === 'deletePayment') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getPaymentsSheet();
        const row = findRowById(sheet, id, PAYMENT_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Payment not found' });
        const detailsRow = sheet.getRange(row, 1, 1, PAYMENT_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, PAYMENT_HEADERS);
        sheet.deleteRow(row);
        logAudit(
          user,
          'Delete Payment',
          `ID: ${id}, Merchant: ${detailsObj.merchantName}, Paid: ৳${detailsObj.paidAmount}`
        );
        return jsonResponse({ success: true });
      } finally {
        lock.releaseLock();
      }
    }

    // Transfer Actions
    if (action === 'getTransfers') {
      const sheet = getTransfersSheet();
      const data = sheet.getDataRange().getValues();
      const transfers =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, TRANSFER_HEADERS));
      return jsonResponse({ success: true, transfers });
    }

    if (action === 'createTransfer') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getTransfersSheet();
        if (!transfer.id) transfer.id = 't' + new Date().getTime().toString();
        // Idempotency check
        if (findRowById(sheet, transfer.id, TRANSFER_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: transfer.id, duplicatePrevented: true });
        }
        sheet.appendRow(objectToRow(transfer, TRANSFER_HEADERS));
        logAudit(
          user,
          'bKash Transfer',
          `ID: ${transfer.id}, Amount: ৳${transfer.amount}, Note: ${transfer.note || '—'}`
        );
        return jsonResponse({ success: true, id: transfer.id });
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'deleteTransfer') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getTransfersSheet();
        const row = findRowById(sheet, id, TRANSFER_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Transfer not found' });
        const detailsRow = sheet.getRange(row, 1, 1, TRANSFER_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, TRANSFER_HEADERS);
        sheet.deleteRow(row);
        logAudit(
          user,
          'Delete bKash Transfer',
          `ID: ${id}, Amount: ৳${detailsObj.amount}`
        );
        return jsonResponse({ success: true });
      } finally {
        lock.releaseLock();
      }
    }

    // Receivable Actions (Money I Will Receive)
    if (action === 'getReceivables') {
      const sheet = getReceivablesSheet();
      const data = sheet.getDataRange().getValues();
      const receivables =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, RECEIVABLE_HEADERS));
      return jsonResponse({ success: true, receivables });
    }

    if (action === 'createReceivable') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getReceivablesSheet();
        if (!receivable.id) receivable.id = 'recv_' + new Date().getTime().toString();
        if (!receivable.status) receivable.status = 'Not Received';
        // Idempotency check
        if (findRowById(sheet, receivable.id, RECEIVABLE_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: receivable.id, duplicatePrevented: true });
        }
        sheet.appendRow(objectToRow(receivable, RECEIVABLE_HEADERS));
        logAudit(
          user,
          'Create Receivable',
          `ID: ${receivable.id}, Name: ${receivable.name}, Amount: ৳${receivable.amount}`
        );
        return jsonResponse({ success: true, id: receivable.id });
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'updateReceivable') {
      const sheet = getReceivablesSheet();
      const row = findRowById(sheet, receivable.id, RECEIVABLE_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Receivable not found' });
      sheet
        .getRange(row, 1, 1, RECEIVABLE_HEADERS.length)
        .setValues([objectToRow(receivable, RECEIVABLE_HEADERS)]);
      logAudit(
        user,
        'Update Receivable',
        `ID: ${receivable.id}, Name: ${receivable.name}, Status: ${receivable.status}`
      );
      return jsonResponse({ success: true });
    }

    if (action === 'deleteReceivable') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getReceivablesSheet();
        const row = findRowById(sheet, id, RECEIVABLE_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Receivable not found' });
        const detailsRow = sheet.getRange(row, 1, 1, RECEIVABLE_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, RECEIVABLE_HEADERS);
        sheet.deleteRow(row);
        logAudit(
          user,
          'Delete Receivable',
          `ID: ${id}, Name: ${detailsObj.name}, Amount: ৳${detailsObj.amount}`
        );
        return jsonResponse({ success: true });
      } finally {
        lock.releaseLock();
      }
    }

    // Payable Actions (Money I Owe)
    if (action === 'getPayables') {
      const sheet = getPayablesSheet();
      const data = sheet.getDataRange().getValues();
      const payables =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, PAYABLE_HEADERS));
      return jsonResponse({ success: true, payables });
    }

    // Opening Balance Actions (One record per calendar month)
    if (action === 'getOpeningBalances') {
      return jsonResponse({ success: true, openingBalances: getOpeningBalancesList() });
    }

    if (action === 'setOpeningBalance') {
      return jsonResponse(setOpeningBalanceEntry(entry, user));
    }

    if (action === 'deleteOpeningBalance') {
      return jsonResponse(deleteOpeningBalanceEntry(
        { id: body.id || (body.entry ? body.entry.id : null), monthKey: body.monthKey || (body.entry ? body.entry.monthKey : null) }, user
      ));
    }

    // Month Closing Actions
    if (action === 'getMonthClosings') {
      return jsonResponse({ success: true, monthClosings: getMonthClosingsList() });
    }

    if (action === 'createMonthClosing') {
      return jsonResponse(createMonthClosingEntry(entry, user));
    }

    // Other Cash Records Actions
    if (action === 'getOtherCashRecords') {
      const sheet = getOtherCashRecordsSheet();
      const data = sheet.getDataRange().getValues();
      const otherCashRecords =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, OTHER_CASH_HEADERS));
      return jsonResponse({ success: true, otherCashRecords });
    }

    if (action === 'createOtherCashRecord') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getOtherCashRecordsSheet();
        const ocRecord = body.record;
        if (!ocRecord.id) ocRecord.id = 'oc_' + new Date().getTime().toString();
        if (!ocRecord.createdAt) ocRecord.createdAt = new Date().toISOString();
        // Idempotency check
        if (findRowById(sheet, ocRecord.id, OTHER_CASH_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: ocRecord.id, duplicatePrevented: true });
        }
        sheet.appendRow(objectToRow(ocRecord, OTHER_CASH_HEADERS));
        logAudit(
          user,
          'Create Other Cash Record',
          `ID: ${ocRecord.id}, Type: ${ocRecord.type}, Source: ${ocRecord.source}, Amount: ৳${ocRecord.amount}`
        );
        return jsonResponse({ success: true, id: ocRecord.id });
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'updateOtherCashRecord') {
      const sheet = getOtherCashRecordsSheet();
      const record = body.record;
      const row = findRowById(sheet, record.id, OTHER_CASH_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Other cash record not found' });
      sheet
        .getRange(row, 1, 1, OTHER_CASH_HEADERS.length)
        .setValues([objectToRow(record, OTHER_CASH_HEADERS)]);
      logAudit(
        user,
        'Update Other Cash Record',
        `ID: ${record.id}, Type: ${record.type}, Source: ${record.source}, Amount: ৳${record.amount}`
      );
      return jsonResponse({ success: true });
    }

    if (action === 'deleteOtherCashRecord') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getOtherCashRecordsSheet();
        const row = findRowById(sheet, id, OTHER_CASH_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Other cash record not found' });
        const detailsRow = sheet.getRange(row, 1, 1, OTHER_CASH_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, OTHER_CASH_HEADERS);
        sheet.deleteRow(row);
        logAudit(
          user,
          'Delete Other Cash Record',
          `ID: ${id}, Type: ${detailsObj.type}, Source: ${detailsObj.source}, Amount: ৳${detailsObj.amount}`
        );
        return jsonResponse({ success: true });
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'createPayable') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getPayablesSheet();
        if (!payable.id) payable.id = 'pay_' + new Date().getTime().toString();
        if (!payable.status) payable.status = 'Unpaid';
        // Idempotency check
        if (findRowById(sheet, payable.id, PAYABLE_HEADERS) !== -1) {
          return jsonResponse({ success: true, id: payable.id, duplicatePrevented: true });
        }
        sheet.appendRow(objectToRow(payable, PAYABLE_HEADERS));
        logAudit(
          user,
          'Create Payable',
          `ID: ${payable.id}, Name: ${payable.name}, Amount: ৳${payable.amount}`
        );
        return jsonResponse({ success: true, id: payable.id });
      } finally {
        lock.releaseLock();
      }
    }

    if (action === 'updatePayable') {
      const sheet = getPayablesSheet();
      const row = findRowById(sheet, payable.id, PAYABLE_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Payable not found' });
      sheet
        .getRange(row, 1, 1, PAYABLE_HEADERS.length)
        .setValues([objectToRow(payable, PAYABLE_HEADERS)]);
      logAudit(
        user,
        'Update Payable',
        `ID: ${payable.id}, Name: ${payable.name}, Status: ${payable.status}`
      );
      return jsonResponse({ success: true });
    }

    if (action === 'deletePayable') {
      const lock = LockService.getScriptLock();
      try {
        lock.waitLock(10000);
        const sheet = getPayablesSheet();
        const row = findRowById(sheet, id, PAYABLE_HEADERS);
        if (row === -1) return jsonResponse({ success: false, error: 'Payable not found' });
        const detailsRow = sheet.getRange(row, 1, 1, PAYABLE_HEADERS.length).getValues()[0];
        const detailsObj = rowToObject(detailsRow, PAYABLE_HEADERS);
        sheet.deleteRow(row);
        logAudit(
          user,
          'Delete Payable',
          `ID: ${id}, Name: ${detailsObj.name}, Amount: ৳${detailsObj.amount}`
        );
        return jsonResponse({ success: true });
      } finally {
        lock.releaseLock();
      }
    }

    // Admin Actions
    if (action === 'getUsers') {
      if (!isAdmin) return jsonResponse({ success: false, error: 'Access Denied: Admins only' });
      const sheet = getUsersSheet();
      const data = sheet.getDataRange().getValues();
      const users =
        data.length <= 1
          ? []
          : data.slice(1).map(row => {
              const u = rowToObject(row, USER_HEADERS);
              delete u.passwordHash;
              return u;
            });
      return jsonResponse({ success: true, users });
    }

    if (action === 'createUser') {
      if (!isAdmin) return jsonResponse({ success: false, error: 'Access Denied: Admins only' });
      if (!userPayload || !userPayload.username || !userPayload.password) {
        return jsonResponse({ success: false, error: 'Invalid user parameters' });
      }
      if (getUser(userPayload.username)) {
        return jsonResponse({ success: false, error: 'Username already exists' });
      }
      const sheet = getUsersSheet();
      const rowObj = {
        username: userPayload.username,
        passwordHash: hashPassword(userPayload.password),
        role: userPayload.role || 'User',
        status: userPayload.status || 'Active',
      };
      sheet.appendRow(objectToRow(rowObj, USER_HEADERS));
      logAudit(user, 'Create User', `Username: ${userPayload.username}, Role: ${rowObj.role}`);
      return jsonResponse({ success: true });
    }

    if (action === 'updateUser') {
      if (!isAdmin) return jsonResponse({ success: false, error: 'Access Denied: Admins only' });
      if (!userPayload || !userPayload.username) {
        return jsonResponse({ success: false, error: 'Username is required' });
      }
      const sheet = getUsersSheet();
      const row = findRowById(sheet, userPayload.username, USER_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'User not found' });

      const existingRow = sheet.getRange(row, 1, 1, USER_HEADERS.length).getValues()[0];
      const existingUser = rowToObject(existingRow, USER_HEADERS);

      if (userPayload.role) existingUser.role = userPayload.role;
      if (userPayload.status) existingUser.status = userPayload.status;
      if (userPayload.password) existingUser.passwordHash = hashPassword(userPayload.password);

      if (existingUser.username === user && existingUser.status !== 'Active') {
        return jsonResponse({ success: false, error: 'You cannot suspend your own admin account' });
      }

      sheet
        .getRange(row, 1, 1, USER_HEADERS.length)
        .setValues([objectToRow(existingUser, USER_HEADERS)]);
      logAudit(
        user,
        'Update User',
        `Username: ${userPayload.username}, Role: ${existingUser.role}, Status: ${existingUser.status}`
      );
      return jsonResponse({ success: true });
    }

    if (action === 'deleteUser') {
      if (!isAdmin) return jsonResponse({ success: false, error: 'Access Denied: Admins only' });
      if (!targetUsername)
        return jsonResponse({ success: false, error: 'Target username required' });
      if (targetUsername === user)
        return jsonResponse({ success: false, error: 'You cannot delete yourself' });

      const sheet = getUsersSheet();
      const row = findRowById(sheet, targetUsername, USER_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'User not found' });

      sheet.deleteRow(row);
      logAudit(user, 'Delete User', `Username: ${targetUsername}`);
      return jsonResponse({ success: true });
    }

    if (action === 'getAuditLogs') {
      if (!isAdmin) return jsonResponse({ success: false, error: 'Access Denied: Admins only' });
      const sheet = getAuditSheet();
      const data = sheet.getDataRange().getValues();
      const logs =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, AUDIT_HEADERS));
      return jsonResponse({ success: true, logs: logs.reverse() });
    }

    // Consolidated dashboard read — one call replaces 9 separate ones
    if (action === 'getDashboardData') {
      return jsonResponse({ success: true, ...getDashboardData() });
    }

    if (action === 'cleanupDuplicates') {
      if (!isAdmin) return jsonResponse({ success: false, error: 'Access Denied: Admins only' });
      const res = cleanupDuplicateSalesRecords();
      return jsonResponse(res);
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// Utility: parse JSON query parameters
function parseJsonParam(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
}

// Utility: format response to JSON or JSONP
function jsonResponse(obj, callback) {
  const payload = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${payload});`).setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}
