const SHEET_NAME = 'MerchantData';
const PAYMENTS_SHEET = 'BillPayments';
const USERS_SHEET = 'Users';
const AUDIT_SHEET = 'AuditLogs';

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
  'digitalPaymentMethod',
];

const PAYMENT_HEADERS = ['id', 'date', 'merchantName', 'paidAmount', 'notes'];
const USER_HEADERS = ['username', 'passwordHash', 'role', 'status'];
const AUDIT_HEADERS = ['id', 'timestamp', 'username', 'action', 'details'];

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

// Helper: convert row array to object based on headers
function rowToObject(row, headers) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = row[i] !== undefined ? String(row[i]) : '';
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

// Find row index by ID
function findRowById(sheet, id, headers) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1;
  }
  return -1;
}

// Handle GET request (JSONP / Fetch)
function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback;

  const record = parseJsonParam(e.parameter.record);
  const payment = parseJsonParam(e.parameter.payment);
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
      const data = sheet.getDataRange().getValues();
      const records =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, RECORD_HEADERS));
      return jsonResponse({ success: true, records }, callback);
    }

    if (action === 'create') {
      const sheet = getSheet();
      if (!record.id) record.id = new Date().getTime().toString();
      console.log(JSON.stringify(record));
      sheet.appendRow(objectToRow(record, RECORD_HEADERS));
      logAudit(
        user,
        'Create Sales Record',
        `ID: ${record.id}, Merchant: ${record.merchantName}, Amount: ৳${record.salesAmount}`
      );
      return jsonResponse({ success: true, id: record.id }, callback);
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
      const sheet = getSheet();
      const row = findRowById(sheet, id, RECORD_HEADERS);
      if (row === -1) return jsonResponse({ success: false, error: 'Record not found' }, callback);

      // Fetch details before delete for audit logs
      const detailsRow = sheet.getRange(row, 1, 1, RECORD_HEADERS.length).getValues()[0];
      const detailsObj = rowToObject(detailsRow, RECORD_HEADERS);

      sheet.deleteRow(row);
      logAudit(
        user,
        'Delete Sales Record',
        `ID: ${id}, Merchant: ${detailsObj.merchantName}, Amount: ৳${detailsObj.salesAmount}`
      );
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
      const sheet = getPaymentsSheet();
      if (!payment.id) payment.id = 'p' + new Date().getTime().toString();
      sheet.appendRow(objectToRow(payment, PAYMENT_HEADERS));
      logAudit(
        user,
        'Record Payment',
        `ID: ${payment.id}, Merchant: ${payment.merchantName}, Paid: ৳${payment.paidAmount}`
      );
      return jsonResponse({ success: true, id: payment.id }, callback);
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
      const data = sheet.getDataRange().getValues();
      const records =
        data.length <= 1 ? [] : data.slice(1).map(row => rowToObject(row, RECORD_HEADERS));
      return jsonResponse({ success: true, records });
    }

    if (action === 'create') {
      const sheet = getSheet();
      if (!record.id) record.id = new Date().getTime().toString();
      sheet.appendRow(objectToRow(record, RECORD_HEADERS));
      logAudit(
        user,
        'Create Sales Record',
        `ID: ${record.id}, Merchant: ${record.merchantName}, Amount: ৳${record.salesAmount}`
      );
      return jsonResponse({ success: true, id: record.id });
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
      const sheet = getPaymentsSheet();
      if (!payment.id) payment.id = 'p' + new Date().getTime().toString();
      sheet.appendRow(objectToRow(payment, PAYMENT_HEADERS));
      logAudit(
        user,
        'Record Payment',
        `ID: ${payment.id}, Merchant: ${payment.merchantName}, Paid: ৳${payment.paidAmount}`
      );
      return jsonResponse({ success: true, id: payment.id });
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

    return jsonResponse({ success: false, error: 'Unknown action' });
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
