import { getCurrentMonthKey } from './dates.js';

const SCRIPT_URL_KEY = 'financial_manager_script_url';
const SESSION_KEY = 'financial_manager_session';
const LIVE_MODE_KEY = 'financial_manager_live_mode';

// Default mock data seed lists
const DEFAULT_RECHANTS = [
  'Al Amin Store',
  'Dhaka Mart',
  'Rahim Traders',
  'Karim Brothers',
  'City Shop',
  'Bismillah Enterprise',
];

const DEFAULT_RECORDS = [
  {
    id: '1',
    date: '2026-05-05',
    month: 'May',
    merchantName: 'Al Amin Store',
    salesAmount: '50000',
    salesType: 'Regular',
    commissionPercent: '15',
    commissionAmount: '7500',
    merchantBill: '42500',
    discountPercent: '2',
    discountAmount: '1000',
    deliveryCharge: '150',
    paidByCustomer: '49150',
    otherCashSource: '',
    otherCashAmount: '0',
    riderName: 'Fahim',
    riderSalary: '1200',
    otherExpenseName: 'Packaging',
    otherExpense: '300',
    fixedExpenseName: 'Software Subscription',
    fixedExpense: '1500',
    expenseDescription: '',
    digitalPaymentMethod: 'bkash',
  },
  {
    id: '2',
    date: '2026-05-10',
    month: 'May',
    merchantName: 'Dhaka Mart',
    salesAmount: '80000',
    salesType: 'Custom Order',
    commissionPercent: '10',
    commissionAmount: '8000',
    merchantBill: '72000',
    discountPercent: '5',
    discountAmount: '4000',
    deliveryCharge: '250',
    paidByCustomer: '76250',
    otherCashSource: '',
    otherCashAmount: '0',
    riderName: 'Kabir',
    riderSalary: '1500',
    otherExpenseName: 'Icepacks',
    otherExpense: '200',
    fixedExpenseName: 'Rent Contribution',
    fixedExpense: '2000',
    expenseDescription: '',
    digitalPaymentMethod: 'cash',
  },
];

const DEFAULT_PAYMENTS = [
  {
    id: 'p1',
    date: '2026-05-08',
    merchantName: 'Al Amin Store',
    paidAmount: '20000',
    notes: 'Advance payment',
  },
  {
    id: 'p2',
    date: '2026-05-15',
    merchantName: 'Dhaka Mart',
    paidAmount: '40000',
    notes: 'Mid-month installment',
  },
];

const DEFAULT_RECEIVABLES = [
  {
    id: 'rec_1',
    name: 'Karim Enterprise',
    amount: '12000',
    date: '2026-09-01',
    note: 'Wholesale inventory refund',
    status: 'Not Received',
  },
  {
    id: 'rec_2',
    name: 'Rahim Chowdhury',
    amount: '8500',
    date: '2026-08-28',
    note: 'Consultation fee settlement',
    status: 'Received',
    receivedAccount: 'cash',
    receivedDate: '2026-08-30',
  },
  {
    id: 'rec_3',
    name: 'City Tech Agency',
    amount: '15000',
    date: '2026-09-02',
    note: 'Software dev advance payout',
    status: 'Not Received',
  },
];

const DEFAULT_PAYABLES = [
  {
    id: 'pay_1',
    name: 'Packaging World Ltd',
    amount: '6000',
    date: '2026-09-02',
    note: 'Delivery boxes and bubble wrap',
    status: 'Unpaid',
  },
  {
    id: 'pay_2',
    name: 'City Printing House',
    amount: '2500',
    date: '2026-08-27',
    note: 'Thermal bill rolls and marketing flyers',
    status: 'Paid',
    paidAccount: 'cash',
    paidDate: '2026-08-29',
  },
  {
    id: 'pay_3',
    name: 'Speedy Bike Workshop',
    amount: '4000',
    date: '2026-09-01',
    note: 'Fleet vehicle servicing and parts',
    status: 'Unpaid',
  },
];

// SHA-256 implementation using Web Crypto API
export async function hashPassword(password) {
  try {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback simple hash for older environments if web crypto is unavailable
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }
}

// LocalStorage Mock DB Helpers
const mockDb = {
  get(key, fallback = []) {
    try {
      const val = localStorage.getItem(`fm_mock_${key}`);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(`fm_mock_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error('Failed writing mock DB to localStorage', e);
    }
  },
  async init() {
    if (!localStorage.getItem('fm_mock_initialized')) {
      this.set('records', DEFAULT_RECORDS);
      this.set('payments', DEFAULT_PAYMENTS);
      this.set('merchants', DEFAULT_RECHANTS);
      this.set('transfers', []);
      this.set('withdrawals', []);
      this.set('receivables', DEFAULT_RECEIVABLES);
      this.set('payables', DEFAULT_PAYABLES);
      this.set('monthClosings', []);
      this.set('openingBalances', []);

      const adminHash = await hashPassword('admin123');
      const userHash = await hashPassword('user123');
      this.set('users', [
        { username: 'admin', passwordHash: adminHash, role: 'Admin', status: 'Active' },
        { username: 'user', passwordHash: userHash, role: 'User', status: 'Active' },
      ]);

      this.set('audit', [
        {
          id: 'a1',
          timestamp: new Date().toISOString(),
          username: 'SYSTEM',
          action: 'DB Init',
          details: 'Demo database seeded successfully.',
        },
      ]);

      localStorage.setItem('fm_mock_initialized', 'true');
    } else {
      if (!localStorage.getItem('fm_mock_receivables_initialized')) {
        if (!this.get('receivables', null)) {
          this.set('receivables', DEFAULT_RECEIVABLES);
        }
        localStorage.setItem('fm_mock_receivables_initialized', 'true');
      }
      if (!localStorage.getItem('fm_mock_payables_initialized')) {
        if (!this.get('payables', null)) {
          this.set('payables', DEFAULT_PAYABLES);
        }
        localStorage.setItem('fm_mock_payables_initialized', 'true');
      }
    }
  },
  logAudit(username, action, details) {
    const logs = this.get('audit');
    logs.unshift({
      id: String(Date.now()) + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      username,
      action,
      details,
    });
    this.set('audit', logs);
  },
};

// Initialize Mock DB
mockDb.init();

// Script URL settings
export function getScriptUrl() {
  return localStorage.getItem(SCRIPT_URL_KEY) || import.meta.env.VITE_APPS_SCRIPT_URL || '';
}

// Helper to delete all mock data and caches
export function deleteAllData() {
  // Remove all mock DB entries
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('fm_mock_')) {
      localStorage.removeItem(key);
    }
  });
  // Clear initialization flags
  localStorage.removeItem('fm_mock_initialized');
  localStorage.removeItem('fm_mock_receivables_initialized');
  localStorage.removeItem('fm_mock_payables_initialized');
  // Clear session storage
  clearSession();
  // Clear in-memory API cache
  clearApiCache();
}

export function setScriptUrl(url) {
  localStorage.setItem(SCRIPT_URL_KEY, url.trim());
}

export function isLiveMode() {
  const isLive = localStorage.getItem(LIVE_MODE_KEY) === 'true';
  return isLive && !!getScriptUrl();
}

export function setLiveMode(enabled) {
  localStorage.setItem(LIVE_MODE_KEY, enabled ? 'true' : 'false');
}

// Session Helpers
export function getCurrentSession() {
  try {
    const val = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export function saveSession(userObj, rememberMe = true) {
  const val = JSON.stringify(userObj);
  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, val);
  } else {
    sessionStorage.setItem(SESSION_KEY, val);
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  clearApiCache();
}

// JSONP request helper (avoids CORS)
function makeJsonpRequest(action, payload = {}) {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    return Promise.reject(new Error('Google Apps Script URL is not configured.'));
  }

  return new Promise((resolve, reject) => {
    const callbackName = `FM_JSONP_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const url = new URL(scriptUrl);

    // Attach default parameters
    url.searchParams.set('action', action);
    url.searchParams.set('callback', callbackName);

    const session = getCurrentSession();
    if (session?.sessionToken) {
      url.searchParams.set('sessionToken', session.sessionToken);
    }

    // Attach request specific parameters
    Object.entries(payload).forEach(([key, val]) => {
      if (val === null || val === undefined) return;
      url.searchParams.set(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
    });

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(
        new Error(
          'Network request timed out. Please check your internet connection or Google Apps Script health.'
        )
      );
    }, 30000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      const scriptEl = document.getElementById(callbackName);
      if (scriptEl) scriptEl.remove();
    }

    window[callbackName] = response => {
      cleanup();
      if (response && response.success) {
        resolve(response);
      } else {
        const errorMsg = response?.error || 'Operation failed on backend.';
        if (errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('session invalid') || errorMsg.toLowerCase().includes('expired')) {
          window.dispatchEvent(new CustomEvent('session-expired'));
        }
        reject(new Error(errorMsg));
      }
    };

    const script = document.createElement('script');
    script.id = callbackName;
    script.async = true;
    script.src = url.toString();
    script.onerror = () => {
      cleanup();
      reject(new Error('Connection failed. Please check your network and script configuration.'));
    };

    document.body.appendChild(script);
  });
}

// POST request helper (uses fetch, sends JSON body)
async function makePostRequest(action, payload = {}) {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    return Promise.reject(new Error('Google Apps Script URL is not configured.'));
  }

  // Build request body with action and optional session token
  const session = getCurrentSession();
  const body = { action, ...payload };
  if (session?.sessionToken) {
    body.sessionToken = session.sessionToken;
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (json && json.success) {
      return json;
    }
    const errorMsg = json?.error || 'Operation failed on backend.';
    if (
      String(errorMsg).toLowerCase().includes('unauthorized') ||
      String(errorMsg).toLowerCase().includes('session invalid') ||
      String(errorMsg).toLowerCase().includes('expired')
    ) {
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
    return Promise.reject(new Error(errorMsg));
  } catch (err) {
    return Promise.reject(new Error(err?.message || 'Network request failed.'));
  }
}

// Retry wrapper: retries the given async fn up to `maxRetries` times
// with exponential back-off (1s, 2s, 4s …). Returns the first success
// or rethrows the last error.
async function fetchWithRetry(fn, maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}


// --- IN-MEMORY CACHE & REQUEST DEDUPLICATION ---
const dataCache = new Map();
const inFlightRequests = new Map();
const inFlightMutations = new Map();
const DEFAULT_CACHE_TTL = 30000; // 30 seconds fresh window

// Collision-proof unique ID generator for records across all managers
export function generateUniqueId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 7)}`;
}

// Ensures every item in a list has a valid, distinct permanent ID and removes duplicate entries with identical IDs
export function ensureUniqueListIds(list, prefix = 'id') {
  if (!Array.isArray(list)) return { items: [], wasUpdated: false };
  const seenIds = new Set();
  let wasUpdated = false;
  const items = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    let id = item.id !== undefined && item.id !== null ? String(item.id).trim() : '';
    if (!id) {
      id = generateUniqueId(prefix);
      wasUpdated = true;
      seenIds.add(id);
      items.push({ ...item, id });
    } else if (seenIds.has(id)) {
      // Duplicate record with identical ID: discard duplicate copy
      wasUpdated = true;
    } else {
      seenIds.add(id);
      items.push({ ...item, id });
    }
  }
  return { items, wasUpdated };
}

// Mutation deduplication wrapper: prevents identical concurrent in-flight mutations
export async function deduplicateMutation(key, mutationFn) {
  if (inFlightMutations.has(key)) {
    return inFlightMutations.get(key);
  }
  const promise = (async () => {
    try {
      return await mutationFn();
    } finally {
      inFlightMutations.delete(key);
    }
  })();
  inFlightMutations.set(key, promise);
  return promise;
}

export function invalidateApiCache(pattern) {
  if (!pattern) {
    dataCache.clear();
    return;
  }
  for (const key of dataCache.keys()) {
    if (key.includes(pattern)) {
      dataCache.delete(key);
    }
  }
}

export function clearApiCache() {
  dataCache.clear();
  inFlightRequests.clear();
  inFlightMutations.clear();
}

async function fetchWithCache(cacheKey, fetcher, ttl = DEFAULT_CACHE_TTL, forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && dataCache.has(cacheKey)) {
    const cached = dataCache.get(cacheKey);
    if (now - cached.timestamp < ttl) {
      return cached.data;
    }
  }

  // Deduplicate concurrent in-flight requests for the same key
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const promise = (async () => {
    try {
      const data = await fetcher();
      dataCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

// Main API Object
export const api = {
  // --- AUTHENTICATION ---
  async login(username, password) {
    clearApiCache();
    const live = isLiveMode();
    if (live) {
      return makeJsonpRequest('login', { username, password });
    } else {
      // Mock validation
      await new Promise(r => setTimeout(r, 600));
      const users = mockDb.get('users');
      const targetUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

      if (!targetUser) {
        mockDb.logAudit('SYSTEM', 'Login Failed', `Username: ${username} (User not found)`);
        throw new Error('Invalid credentials');
      }
      if (targetUser.status !== 'Active') {
        mockDb.logAudit(username, 'Login Blocked', 'Account is suspended');
        throw new Error('Account suspended');
      }

      const passHash = await hashPassword(password);
      if (targetUser.passwordHash !== passHash) {
        mockDb.logAudit(username, 'Login Failed', 'Incorrect password');
        throw new Error('Invalid credentials');
      }

      mockDb.logAudit(username, 'Login Success', 'User authenticated in Demo Mode');
      return {
        success: true,
        username: targetUser.username,
        role: targetUser.role,
        sessionToken: `demo_token_${Date.now()}`,
      };
    }
  },
  // --- CONSOLIDATED DASHBOARD FETCH (single API call, replaces 9 parallel requests) ---
  async getDashboardData({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'dashboardData',
      async () => {
        if (isLiveMode()) {
          const resp = await fetchWithRetry(() => makeJsonpRequest('getDashboardData'));
          return {
            records:          ensureUniqueListIds(resp.records || [], 'rec').items,
            payments:         ensureUniqueListIds(resp.payments || [], 'pay').items,
            merchants:        resp.merchants || [],
            transfers:        ensureUniqueListIds(resp.transfers || [], 'tr').items,
            receivables:      ensureUniqueListIds(resp.receivables || [], 'recv').items,
            payables:         ensureUniqueListIds(resp.payables || [], 'payab').items,
            openingBalances:  resp.openingBalances || [],
            monthClosings:    resp.monthClosings || [],
            otherCashRecords: ensureUniqueListIds(resp.otherCashRecords || [], 'oc').items,
          };
        } else {
          // Mock mode: return all datasets at once with guaranteed unique IDs
          const { items: records, wasUpdated: recUpdated } = ensureUniqueListIds(mockDb.get('records', []), 'rec');
          if (recUpdated) mockDb.set('records', records);

          const { items: payments, wasUpdated: payUpdated } = ensureUniqueListIds(mockDb.get('payments', []), 'pay');
          if (payUpdated) mockDb.set('payments', payments);

          const { items: transfers, wasUpdated: trUpdated } = ensureUniqueListIds(mockDb.get('transfers', []), 'tr');
          if (trUpdated) mockDb.set('transfers', transfers);

          const { items: receivables, wasUpdated: recvUpdated } = ensureUniqueListIds(mockDb.get('receivables', DEFAULT_RECEIVABLES), 'recv');
          if (recvUpdated) mockDb.set('receivables', receivables);

          const { items: payables, wasUpdated: payabUpdated } = ensureUniqueListIds(mockDb.get('payables', DEFAULT_PAYABLES), 'payab');
          if (payabUpdated) mockDb.set('payables', payables);

          const { items: otherCashRecords, wasUpdated: ocUpdated } = ensureUniqueListIds(mockDb.get('otherCashRecords', []), 'oc');
          if (ocUpdated) mockDb.set('otherCashRecords', otherCashRecords);

          return {
            records,
            payments,
            merchants: (() => {
              const seeded = mockDb.get('merchants');
              const set = new Set([...seeded]);
              records.forEach(r => r.merchantName && set.add(r.merchantName));
              payments.forEach(p => p.merchantName && set.add(p.merchantName));
              return Array.from(set).sort();
            })(),
            transfers,
            receivables,
            payables,
            openingBalances: (() => {
              try {
                const raw = localStorage.getItem('fm_opening_balance');
                if (raw) {
                  const legacy = JSON.parse(raw);
                  localStorage.removeItem('fm_opening_balance');
                  if (legacy) {
                    const list = mockDb.get('openingBalances', []);
                    const monthKey = getCurrentMonthKey();
                    if (!list.some(o => o.monthKey === monthKey)) {
                      const handCash = parseFloat(legacy.handCash) || 0;
                      const onlineCash = parseFloat(legacy.onlineCash) || 0;
                      const otherCash = parseFloat(legacy.otherCash) || 0;
                      const today = new Date();
                      list.push({
                        id: generateUniqueId('ob'),
                        monthKey,
                        month: today.toLocaleString('default', { month: 'long' }),
                        year: today.getFullYear(),
                        handCash, onlineCash, otherCash,
                        totalCash: handCash + onlineCash + otherCash,
                        source: 'manual',
                        fromMonthKey: null,
                        createdAt: new Date().toISOString(),
                        createdBy: 'SYSTEM',
                      });
                      mockDb.set('openingBalances', list);
                    }
                  }
                }
              } catch { localStorage.removeItem('fm_opening_balance'); }
              return Array.from(
                new Map((mockDb.get('openingBalances') || []).map(o => [o.monthKey, o])).values()
              );
            })(),
            monthClosings: mockDb.get('monthClosings', []),
            otherCashRecords,
          };
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  // --- SALES RECORDS ---
  async getAllRecords({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'records',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getAll');
          const raw = resp.records || [];
          return ensureUniqueListIds(raw, 'rec').items;
        } else {
          await new Promise(r => setTimeout(r, 100));
          const raw = mockDb.get('records', []);
          const { items, wasUpdated } = ensureUniqueListIds(raw, 'rec');
          if (wasUpdated) mockDb.set('records', items);
          return items;
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  async createRecord(record) {
    const id = record.id && String(record.id).trim() !== ''
      ? String(record.id).trim()
      : generateUniqueId('rec');
    const newRecord = {
      ...record,
      id,
      createdAt: record.createdAt || new Date().toISOString(),
    };

    return deduplicateMutation(`create_record_${id}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('records');
      if (isLiveMode()) {
        return await makeJsonpRequest('create', { record: newRecord });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const records = mockDb.get('records', []);
        // Idempotency: if record with this ID already exists, do not duplicate
        const existing = records.find(r => String(r.id) === String(id));
        if (existing) {
          return { success: true, id, duplicatePrevented: true };
        }
        const updated = [...records, newRecord];
        mockDb.set('records', updated);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Create Sales Record',
          `ID: ${newRecord.id}, Merchant: ${newRecord.merchantName}, Amount: ৳${newRecord.salesAmount}`
        );
        return { success: true, id: newRecord.id };
      }
    });
  },

  async updateRecord(record) {
    if (!record || !record.id) throw new Error('Record ID is required for update');
    const targetId = String(record.id).trim();

    return deduplicateMutation(`update_record_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('records');
      if (isLiveMode()) {
        return makeJsonpRequest('update', { record: { ...record, id: targetId } });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const records = mockDb.get('records', []);
        const idx = records.findIndex(r => String(r.id) === targetId);
        if (idx === -1) throw new Error('Record not found');
        records[idx] = { ...record, id: targetId };
        mockDb.set('records', records);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Update Sales Record',
          `ID: ${targetId}, Merchant: ${record.merchantName}, Amount: ৳${record.salesAmount}`
        );
        return { success: true };
      }
    });
  },

  async deleteRecord(id) {
    if (!id || !String(id).trim()) {
      throw new Error('Valid record ID is required for deletion');
    }
    const targetId = String(id).trim();

    return deduplicateMutation(`delete_record_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('records');
      if (isLiveMode()) {
        return makeJsonpRequest('delete', { id: targetId });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const records = mockDb.get('records', []);
        const targetIndex = records.findIndex(r => String(r.id) === targetId);
        if (targetIndex === -1) throw new Error('Record not found');

        const target = records[targetIndex];
        // Delete ONLY the exact record at targetIndex
        records.splice(targetIndex, 1);
        mockDb.set('records', records);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Delete Sales Record',
          `ID: ${targetId}, Merchant: ${target.merchantName}, Amount: ৳${target.salesAmount}`
        );
        return { success: true };
      }
    });
  },

  // Delete all sales records
  async deleteAllRecords() {
    return deduplicateMutation('delete_all_records', async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('records');
      if (isLiveMode()) {
        return makeJsonpRequest('deleteAllRecords');
      }
      mockDb.set('records', []);
      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Delete All Records',
        'All sales records have been cleared from mock database'
      );
      return { success: true };
    });
  },

  // --- BILL PAYMENTS ---
  async getAllPayments({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'payments',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getPayments');
          const raw = resp.payments || [];
          return ensureUniqueListIds(raw, 'pay').items;
        } else {
          await new Promise(r => setTimeout(r, 100));
          const raw = mockDb.get('payments', []);
          const { items, wasUpdated } = ensureUniqueListIds(raw, 'pay');
          if (wasUpdated) mockDb.set('payments', items);
          return items;
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  async createPayment(payment) {
    const id = payment.id && String(payment.id).trim() !== ''
      ? String(payment.id).trim()
      : generateUniqueId('pay');
    const newPayment = { ...payment, id };

    return deduplicateMutation(`create_payment_${id}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('payments');
      if (isLiveMode()) {
        return makeJsonpRequest('createPayment', { payment: newPayment });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const payments = mockDb.get('payments', []);
        // Idempotency: if payment with this ID already exists, do not duplicate
        if (payments.some(p => String(p.id) === String(id))) {
          return { success: true, id, duplicatePrevented: true };
        }
        payments.push(newPayment);
        mockDb.set('payments', payments);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Record Payment',
          `ID: ${newPayment.id}, Merchant: ${newPayment.merchantName}, Paid: ৳${newPayment.paidAmount}`
        );
        return { success: true, id: newPayment.id };
      }
    });
  },

  async updatePayment(payment) {
    if (!payment || !payment.id) throw new Error('Payment ID is required for update');
    const targetId = String(payment.id).trim();

    return deduplicateMutation(`update_payment_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('payments');
      if (isLiveMode()) {
        return makeJsonpRequest('updatePayment', { payment: { ...payment, id: targetId } });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const payments = mockDb.get('payments', []);
        const index = payments.findIndex(p => String(p.id) === targetId);
        if (index === -1) throw new Error('Payment not found');
        payments[index] = { ...payment, id: targetId };
        mockDb.set('payments', payments);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Update Payment',
          `ID: ${targetId}, Merchant: ${payment.merchantName}, Paid: ৳${payment.paidAmount}`
        );
        return { success: true };
      }
    });
  },

  async deletePayment(id) {
    if (!id || !String(id).trim()) {
      throw new Error('Valid payment ID is required for deletion');
    }
    const targetId = String(id).trim();

    return deduplicateMutation(`delete_payment_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('payments');
      if (isLiveMode()) {
        return makeJsonpRequest('deletePayment', { id: targetId });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const payments = mockDb.get('payments', []);
        const targetIndex = payments.findIndex(p => String(p.id) === targetId);
        if (targetIndex === -1) throw new Error('Payment not found');

        const target = payments[targetIndex];
        // Delete ONLY the exact record at targetIndex
        payments.splice(targetIndex, 1);
        mockDb.set('payments', payments);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Delete Payment',
          `ID: ${targetId}, Merchant: ${target.merchantName}, Paid: ৳${target.paidAmount}`
        );
        return { success: true };
      }
    });
  },

  // --- BALANCE TRANSFERS (Hand Cash ↔ Online) ---
  async getAllTransfers({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'transfers',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getTransfers');
          const raw = resp.transfers || [];
          return ensureUniqueListIds(raw, 'tr').items;
        } else {
          await new Promise(r => setTimeout(r, 100));
          const raw = mockDb.get('transfers', []);
          const { items, wasUpdated } = ensureUniqueListIds(raw, 'tr');
          if (wasUpdated) mockDb.set('transfers', items);
          return items;
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  async createTransfer(transfer) {
    const id = transfer.id && String(transfer.id).trim() !== ''
      ? String(transfer.id).trim()
      : generateUniqueId('tr');
    const newTransfer = { ...transfer, id };

    return deduplicateMutation(`create_transfer_${id}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('transfers');
      if (isLiveMode()) {
        return makeJsonpRequest('createTransfer', { transfer: newTransfer });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const transfers = mockDb.get('transfers', []);
        // Idempotency: if transfer with this ID already exists, do not duplicate
        if (transfers.some(t => String(t.id) === String(id))) {
          return { success: true, id, duplicatePrevented: true };
        }
        transfers.push(newTransfer);
        mockDb.set('transfers', transfers);

        const session = getCurrentSession();
        const typeLabel = transfer.type === 'cash_to_online' ? 'Cash → Online' : 'Online → Cash';
        mockDb.logAudit(
          session?.username || 'admin',
          'Balance Transfer',
          `ID: ${newTransfer.id}, Type: ${typeLabel}, Amount: ৳${newTransfer.amount}, Note: ${newTransfer.note || '—'}`
        );
        return { success: true, id: newTransfer.id };
      }
    });
  },

  async deleteTransfer(id) {
    if (!id || !String(id).trim()) {
      throw new Error('Valid transfer ID is required for deletion');
    }
    const targetId = String(id).trim();

    return deduplicateMutation(`delete_transfer_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('transfers');
      if (isLiveMode()) {
        return makeJsonpRequest('deleteTransfer', { id: targetId });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const transfers = mockDb.get('transfers', []);
        const targetIndex = transfers.findIndex(t => String(t.id) === targetId);
        if (targetIndex === -1) throw new Error('Transfer not found');

        const target = transfers[targetIndex];
        // Delete ONLY the exact record at targetIndex
        transfers.splice(targetIndex, 1);
        mockDb.set('transfers', transfers);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Delete Transfer',
          `ID: ${targetId}, Amount: ৳${target.amount}`
        );
        return { success: true };
      }
    });
  },

  // --- RECEIVABLES (Money I Will Receive) ---
  async getAllReceivables({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'receivables',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getReceivables');
          const raw = resp.receivables || [];
          return ensureUniqueListIds(raw, 'recv').items;
        } else {
          await new Promise(r => setTimeout(r, 100));
          const recs = mockDb.get('receivables', null) || DEFAULT_RECEIVABLES;
          const { items, wasUpdated } = ensureUniqueListIds(recs, 'recv');
          if (wasUpdated) mockDb.set('receivables', items);
          return items;
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  async createReceivable(receivable) {
    const id = receivable.id && String(receivable.id).trim() !== ''
      ? String(receivable.id).trim()
      : generateUniqueId('recv');
    const newRec = {
      ...receivable,
      id,
      status: receivable.status || 'Not Received',
      createdAt: receivable.createdAt || new Date().toISOString(),
    };

    return deduplicateMutation(`create_receivable_${id}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('receivables');
      if (isLiveMode()) {
        // Use JSONP for CORS reliability
        return makeJsonpRequest('createReceivable', { receivable: newRec });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const list = mockDb.get('receivables', null) || DEFAULT_RECEIVABLES;
        // Idempotency
        if (list.some(r => String(r.id) === String(id))) {
          return { success: true, id, duplicatePrevented: true };
        }
        const updated = [...list, newRec];
        mockDb.set('receivables', updated);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Create Receivable',
          `ID: ${newRec.id}, Name: ${newRec.name}, Amount: ৳${newRec.amount}`
        );
        return { success: true, id: newRec.id };
      }
    });
  },

  async updateReceivable(receivable) {
    if (!receivable || !receivable.id) throw new Error('Receivable ID is required for update');
    const targetId = String(receivable.id).trim();

    return deduplicateMutation(`update_receivable_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('receivables');
      if (isLiveMode()) {
        return makeJsonpRequest('updateReceivable', { receivable: { ...receivable, id: targetId } });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const list = mockDb.get('receivables', null) || DEFAULT_RECEIVABLES;
        const idx = list.findIndex(r => String(r.id) === targetId);
        if (idx === -1) throw new Error('Receivable record not found');

        const oldRec = list[idx];
        list[idx] = { ...oldRec, ...receivable, id: targetId };
        mockDb.set('receivables', list);

        const session = getCurrentSession();
        const actionDesc =
          receivable.status === 'Received' && oldRec.status !== 'Received'
            ? `Received ৳${receivable.amount} from ${receivable.name} into ${receivable.receivedAccount || 'cash'}`
            : `Update Receivable: ${receivable.name}, ৳${receivable.amount}`;

        mockDb.logAudit(session?.username || 'admin', 'Update Receivable', actionDesc);
        return { success: true };
      }
    });
  },

  async deleteReceivable(id) {
    if (!id || !String(id).trim()) {
      throw new Error('Valid receivable ID is required for deletion');
    }
    const targetId = String(id).trim();

    return deduplicateMutation(`delete_receivable_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('receivables');
      if (isLiveMode()) {
        return makeJsonpRequest('deleteReceivable', { id: targetId });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const list = mockDb.get('receivables', null) || DEFAULT_RECEIVABLES;
        const targetIndex = list.findIndex(r => String(r.id) === targetId);
        if (targetIndex === -1) throw new Error('Receivable record not found');

        const target = list[targetIndex];
        // Delete ONLY the exact record at targetIndex
        list.splice(targetIndex, 1);
        mockDb.set('receivables', list);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Delete Receivable',
          `ID: ${targetId}, Name: ${target.name}, Amount: ৳${target.amount}`
        );
        return { success: true };
      }
    });
  },

  // --- PAYABLES (Money I Owe) ---
  async getAllPayables({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'payables',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getPayables');
          const raw = resp.payables || [];
          return ensureUniqueListIds(raw, 'payab').items;
        } else {
          await new Promise(r => setTimeout(r, 100));
          const pays = mockDb.get('payables', null) || DEFAULT_PAYABLES;
          const { items, wasUpdated } = ensureUniqueListIds(pays, 'payab');
          if (wasUpdated) mockDb.set('payables', items);
          return items;
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  async createPayable(payable) {
    const id = payable.id && String(payable.id).trim() !== ''
      ? String(payable.id).trim()
      : generateUniqueId('payab');
    const newPay = {
      ...payable,
      id,
      status: payable.status || 'Unpaid',
      createdAt: payable.createdAt || new Date().toISOString(),
    };

    return deduplicateMutation(`create_payable_${id}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('payables');
      if (isLiveMode()) {
        return makeJsonpRequest('createPayable', { payable: newPay });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const list = mockDb.get('payables', null) || DEFAULT_PAYABLES;
        // Idempotency
        if (list.some(p => String(p.id) === String(id))) {
          return { success: true, id, duplicatePrevented: true };
        }
        const updated = [...list, newPay];
        mockDb.set('payables', updated);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Create Payable',
          `ID: ${newPay.id}, Name: ${newPay.name}, Amount: ৳${newPay.amount}`
        );
        return { success: true, id: newPay.id };
      }
    });
  },

  async updatePayable(payable) {
    if (!payable || !payable.id) throw new Error('Payable ID is required for update');
    const targetId = String(payable.id).trim();

    return deduplicateMutation(`update_payable_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('payables');
      if (isLiveMode()) {
        return makeJsonpRequest('updatePayable', { payable: { ...payable, id: targetId } });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const list = mockDb.get('payables', null) || DEFAULT_PAYABLES;
        const idx = list.findIndex(p => String(p.id) === targetId);
        if (idx === -1) throw new Error('Payable record not found');

        const oldPay = list[idx];
        list[idx] = { ...oldPay, ...payable, id: targetId };
        mockDb.set('payables', list);

        const session = getCurrentSession();
        const actionDesc =
          payable.status === 'Paid' && oldPay.status !== 'Paid'
            ? `Paid ৳${payable.amount} to ${payable.name} from ${payable.paidAccount || 'cash'}`
            : `Update Payable: ${payable.name}, ৳${payable.amount}`;

        mockDb.logAudit(session?.username || 'admin', 'Update Payable', actionDesc);
        return { success: true };
      }
    });
  },

  async deletePayable(id) {
    if (!id || !String(id).trim()) {
      throw new Error('Valid payable ID is required for deletion');
    }
    const targetId = String(id).trim();

    return deduplicateMutation(`delete_payable_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('payables');
      if (isLiveMode()) {
        return makeJsonpRequest('deletePayable', { id: targetId });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const list = mockDb.get('payables', null) || DEFAULT_PAYABLES;
        const targetIndex = list.findIndex(p => String(p.id) === targetId);
        if (targetIndex === -1) throw new Error('Payable record not found');

        const target = list[targetIndex];
        // Delete ONLY the exact record at targetIndex
        list.splice(targetIndex, 1);
        mockDb.set('payables', list);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Delete Payable',
          `ID: ${targetId}, Name: ${target.name}, Amount: ৳${target.amount}`
        );
        return { success: true };
      }
    });
  },

  // --- OPENING BALANCES (One record per calendar month) ---
  // Migrates the legacy single opening balance (fm_opening_balance) into the
  // per-month collection as a manual entry for the current month.
  _migrateLegacyOpeningBalance() {
    try {
      const raw = localStorage.getItem('fm_opening_balance');
      if (!raw) return;
      const legacy = JSON.parse(raw);
      localStorage.removeItem('fm_opening_balance');
      if (!legacy) return;

      const list = mockDb.get('openingBalances', []);
      const monthKey = getCurrentMonthKey();
      if (list.some(o => o.monthKey === monthKey)) return;

      const handCash = parseFloat(legacy.handCash) || 0;
      const onlineCash = parseFloat(legacy.onlineCash) || 0;
      const otherCash = parseFloat(legacy.otherCash) || 0;
      const today = new Date();

      list.push({
        id: 'ob_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        monthKey,
        month: today.toLocaleString('default', { month: 'long' }),
        year: today.getFullYear(),
        handCash,
        onlineCash,
        otherCash,
        totalCash: handCash + onlineCash + otherCash,
        source: 'manual',
        fromMonthKey: null,
        createdAt: new Date().toISOString(),
        createdBy: 'SYSTEM',
      });
      mockDb.set('openingBalances', list);
      mockDb.logAudit('SYSTEM', 'Migrate Opening Balance', 'Legacy opening balance converted into monthly records');
    } catch {
      localStorage.removeItem('fm_opening_balance');
    }
  },

  async getOpeningBalances({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'openingBalances',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getOpeningBalances');
          return resp.openingBalances || [];
        } else {
          await new Promise(r => setTimeout(r, 100));
          this._migrateLegacyOpeningBalance();
          const list = mockDb.get('openingBalances', []);
          return Array.from(new Map(list.map(o => [o.monthKey, o])).values());
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  async setOpeningBalance(entry) {
    invalidateApiCache('dashboardData');
    invalidateApiCache('openingBalances');
    if (isLiveMode()) {
      return makePostRequest('setOpeningBalance', { entry });
    } else {
      await new Promise(r => setTimeout(r, 100));
      if (!entry || !entry.monthKey) throw new Error('Opening balance requires a month key.');

      const currentMonthKey = getCurrentMonthKey();
      // Previous months must remain unchanged
      if (entry.monthKey < currentMonthKey) {
        throw new Error('Opening balance for past months cannot be changed.');
      }

      const list = mockDb.get('openingBalances', []);
      const handCash = parseFloat(entry.handCash) || 0;
      const onlineCash = parseFloat(entry.onlineCash) || 0;
      const otherCash = parseFloat(entry.otherCash) || 0;
      const index = list.findIndex(o => o.monthKey === entry.monthKey);
      const session = getCurrentSession();

      let savedId;
      if (index === -1) {
        // Create — guaranteed one opening balance per month
        const newEntry = {
          id: 'ob_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          monthKey: entry.monthKey,
          month: entry.month || '',
          year: entry.year || '',
          handCash,
          onlineCash,
          otherCash,
          totalCash: parseFloat(entry.totalCash) || handCash + onlineCash + otherCash,
          source: entry.source === 'carried_forward' ? 'carried_forward' : 'manual',
          fromMonthKey: entry.fromMonthKey || null,
          createdAt: new Date().toISOString(),
          createdBy: session?.username || 'admin',
        };
        list.push(newEntry);
        savedId = newEntry.id;
      } else {
        // Update existing month record — no duplicates
        const prev = list[index];
        list[index] = {
          ...prev,
          month: entry.month || prev.month,
          year: entry.year || prev.year,
          handCash,
          onlineCash,
          otherCash,
          totalCash: parseFloat(entry.totalCash) || handCash + onlineCash + otherCash,
          source: entry.source === 'carried_forward' ? 'carried_forward' : prev.source || 'manual',
          fromMonthKey: entry.fromMonthKey || prev.fromMonthKey || null,
          updatedAt: new Date().toISOString(),
        };
        savedId = prev.id;
      }

      mockDb.set('openingBalances', list);

      const sourceLabel = entry.source === 'carried_forward'
        ? 'Carried Forward'
        : 'Manual Entry';
      mockDb.logAudit(
        session?.username || 'admin',
        'Set Opening Balance',
        `Month: ${entry.monthKey} — Total: ৳${handCash + onlineCash + otherCash} (Hand: ৳${handCash}, Online: ৳${onlineCash}, Other: ৳${otherCash}) Source: ${sourceLabel}`
      );
      return { success: true, id: savedId };
    }
  },

  async deleteOpeningBalance(entry) {
    invalidateApiCache('dashboardData');
    invalidateApiCache('openingBalances');
    const id = entry && entry.id ? String(entry.id) : null;
    const monthKey = entry && entry.monthKey ? String(entry.monthKey) : null;
    if (isLiveMode()) {
      return makeJsonpRequest('deleteOpeningBalance', { id, monthKey });
    } else {
      await new Promise(r => setTimeout(r, 100));
      if (!id && !monthKey) throw new Error('Opening balance requires a month key.');

      const currentMonthKey = getCurrentMonthKey();
      // Previous months must remain unchanged
      if (monthKey && String(monthKey).slice(0, 7) < currentMonthKey) {
        throw new Error('Opening balance for past months cannot be removed.');
      }

      const list = mockDb.get('openingBalances', []);
      // Tolerant month match: accepts "2026-09" against stored "2026-09-01T…"
      const index = list.findIndex(o =>
        (id && o.id === id) ||
        (monthKey && (o.monthKey === monthKey || String(o.monthKey).slice(0, 7) === String(monthKey).slice(0, 7)))
      );
      if (index === -1) throw new Error('Opening balance not found.');

      const target = list[index];
      list.splice(index, 1);
      mockDb.set('openingBalances', list);

      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Delete Opening Balance',
        `Month: ${target.monthKey} — Total: ৳${target.totalCash}`
      );
      return { success: true };
    }
  },

  // --- MONTH CLOSINGS ---
  async getAllMonthClosings({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'monthClosings',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getMonthClosings');
          return resp.monthClosings || [];
        } else {
          await new Promise(r => setTimeout(r, 100));
          return mockDb.get('monthClosings', []);
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  async createMonthClosing(entry) {
    invalidateApiCache('dashboardData');
    invalidateApiCache('monthClosings');
    if (isLiveMode()) {
      return makePostRequest('createMonthClosing', { entry });
    } else {
      await new Promise(r => setTimeout(r, 100));
      const list = mockDb.get('monthClosings', []);
      // Duplicate guard — one closing per calendar month
      if (list.some(c => c.monthKey === entry.monthKey)) {
        throw new Error(`Month "${entry.month} ${entry.year}" is already closed. Only one closing per month is allowed.`);
      }
      const newEntry = {
        ...entry,
        id: 'mc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        closedAt: new Date().toISOString(),
      };
      const updated = [...list, newEntry];
      mockDb.set('monthClosings', updated);

      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Month Closing',
        `Closed ${entry.month} ${entry.year} — Total: ৳${entry.totalCash} (Hand: ৳${entry.handCash}, Online: ৳${entry.onlineCash}, Other: ৳${otherCash})`
      );
      return { success: true, id: newEntry.id };
    }
  },

  // --- MERCHANT RETRIEVAL ---
  async getMerchants({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'merchants',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getMerchants');
          return resp.merchants || [];
        } else {
          const records = mockDb.get('records');
          const payments = mockDb.get('payments');
          const seeded = mockDb.get('merchants');

          const set = new Set([...seeded]);
          records.forEach(r => r.merchantName && set.add(r.merchantName));
          payments.forEach(p => p.merchantName && set.add(p.merchantName));
          return Array.from(set).sort();
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  // --- ADMIN ACTIONS (USERS & AUDIT) ---
  async getUsers({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'users',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getUsers');
          return resp.users || [];
        } else {
          await new Promise(r => setTimeout(r, 100));
          return mockDb.get('users').map(({ username, role, status }) => ({ username, role, status }));
        }
      },
      60000,
      forceRefresh
    );
  },

  async createUser(user) {
    invalidateApiCache('users');
    invalidateApiCache('auditLogs');
    if (isLiveMode()) {
      return makeJsonpRequest('createUser', { user });
    } else {
      await new Promise(r => setTimeout(r, 100));
      const users = mockDb.get('users');
      if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
        throw new Error('Username already exists');
      }

      const hash = await hashPassword(user.password);
      const newUser = {
        username: user.username,
        passwordHash: hash,
        role: user.role || 'User',
        status: user.status || 'Active',
      };

      users.push(newUser);
      mockDb.set('users', users);

      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Create User',
        `Username: ${user.username}, Role: ${user.role}`
      );
      return { success: true };
    }
  },

  async updateUser(user) {
    invalidateApiCache('users');
    invalidateApiCache('auditLogs');
    if (isLiveMode()) {
      return makeJsonpRequest('updateUser', { user });
    } else {
      await new Promise(r => setTimeout(r, 100));
      const users = mockDb.get('users');
      const index = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
      if (index === -1) throw new Error('User not found');

      // Update fields
      if (user.role) users[index].role = user.role;
      if (user.status) users[index].status = user.status;
      if (user.password) {
        users[index].passwordHash = await hashPassword(user.password);
      }

      mockDb.set('users', users);

      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Update User',
        `Username: ${user.username}, Role: ${users[index].role}, Status: ${users[index].status}`
      );
      return { success: true };
    }
  },

  async deleteUser(targetUsername) {
    invalidateApiCache('users');
    invalidateApiCache('auditLogs');
    if (isLiveMode()) {
      return makeJsonpRequest('deleteUser', { targetUsername });
    } else {
      await new Promise(r => setTimeout(r, 100));
      const users = mockDb.get('users');
      const filtered = users.filter(u => u.username.toLowerCase() !== targetUsername.toLowerCase());
      mockDb.set('users', filtered);

      const session = getCurrentSession();
      mockDb.logAudit(session?.username || 'admin', 'Delete User', `Username: ${targetUsername}`);
      return { success: true };
    }
  },

  async getAuditLogs({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'auditLogs',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getAuditLogs');
          return resp.logs || [];
        } else {
          await new Promise(r => setTimeout(r, 100));
          return mockDb.get('audit');
        }
      },
      30000,
      forceRefresh
    );
  },

  // --- OTHER CASH RECORDS (Separate from Sales Records) ---
  async getAllOtherCashRecords({ forceRefresh = false } = {}) {
    return fetchWithCache(
      'otherCashRecords',
      async () => {
        if (isLiveMode()) {
          const resp = await makeJsonpRequest('getOtherCashRecords');
          const raw = resp.otherCashRecords || [];
          return ensureUniqueListIds(raw, 'oc').items;
        } else {
          await new Promise(r => setTimeout(r, 100));
          const raw = mockDb.get('otherCashRecords', []);
          const { items, wasUpdated } = ensureUniqueListIds(raw, 'oc');
          if (wasUpdated) mockDb.set('otherCashRecords', items);
          return items;
        }
      },
      DEFAULT_CACHE_TTL,
      forceRefresh
    );
  },

  async createOtherCashRecord(record) {
    const id = record.id && String(record.id).trim() !== ''
      ? String(record.id).trim()
      : generateUniqueId('oc');
    const newRecord = {
      ...record,
      id,
      createdAt: record.createdAt || new Date().toISOString(),
    };

    return deduplicateMutation(`create_other_cash_${id}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('otherCashRecords');
      if (isLiveMode()) {
        return makeJsonpRequest('createOtherCashRecord', { record: newRecord });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const list = mockDb.get('otherCashRecords', []);
        // Idempotency: if record with this ID already exists, do not duplicate
        if (list.some(r => String(r.id) === String(id))) {
          return { success: true, id, duplicatePrevented: true };
        }
        const updated = [...list, newRecord];
        mockDb.set('otherCashRecords', updated);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Create Other Cash Record',
          `ID: ${newRecord.id}, Type: ${newRecord.type}, Source: ${newRecord.source}, Amount: ৳${newRecord.amount}`
        );
        return { success: true, id: newRecord.id };
      }
    });
  },

  async updateOtherCashRecord(record) {
    if (!record || !record.id) throw new Error('Other cash record ID is required for update');
    const targetId = String(record.id).trim();

    return deduplicateMutation(`update_other_cash_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('otherCashRecords');
      if (isLiveMode()) {
        return makeJsonpRequest('updateOtherCashRecord', { record: { ...record, id: targetId } });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const list = mockDb.get('otherCashRecords', []);
        const idx = list.findIndex(r => String(r.id) === targetId);
        if (idx === -1) throw new Error('Other cash record not found');
        list[idx] = { ...record, id: targetId };
        mockDb.set('otherCashRecords', list);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Update Other Cash Record',
          `ID: ${targetId}, Type: ${record.type}, Source: ${record.source}, Amount: ৳${record.amount}`
        );
        return { success: true };
      }
    });
  },

  async deleteOtherCashRecord(id) {
    if (!id || !String(id).trim()) {
      throw new Error('Valid other cash record ID is required for deletion');
    }
    const targetId = String(id).trim();

    return deduplicateMutation(`delete_other_cash_${targetId}`, async () => {
      invalidateApiCache('dashboardData');
      invalidateApiCache('otherCashRecords');
      if (isLiveMode()) {
        return makeJsonpRequest('deleteOtherCashRecord', { id: targetId });
      } else {
        await new Promise(r => setTimeout(r, 100));
        const list = mockDb.get('otherCashRecords', []);
        const targetIndex = list.findIndex(r => String(r.id) === targetId);
        if (targetIndex === -1) throw new Error('Other cash record not found');

        const target = list[targetIndex];
        // Delete ONLY the exact record at targetIndex
        list.splice(targetIndex, 1);
        mockDb.set('otherCashRecords', list);

        const session = getCurrentSession();
        mockDb.logAudit(
          session?.username || 'admin',
          'Delete Other Cash Record',
          `ID: ${targetId}, Type: ${target.type}, Source: ${target.source}, Amount: ৳${target.amount}`
        );
        return { success: true };
      }
    });
  },
};
