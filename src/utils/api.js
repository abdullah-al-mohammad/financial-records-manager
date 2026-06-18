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
    }, 15000);

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
        reject(new Error(response?.error || 'Operation failed on backend.'));
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

// Main API Object
export const api = {
  // --- AUTHENTICATION ---
  async login(username, password) {
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

  // --- SALES RECORDS ---
  async getAllRecords() {
    if (isLiveMode()) {
      const resp = await makeJsonpRequest('getAll');
      const raw = resp.records || [];
      // Ensure uniqueness even if backend returns duplicate IDs
      return Array.from(new Map(raw.map(r => [r.id, r])).values());
    } else {
      await new Promise(r => setTimeout(r, 200));
      const raw = mockDb.get('records');
      // Remove any duplicate IDs (keep the latest entry)
      const deduped = Array.from(new Map(raw.map(r => [r.id, r])).values());
      // Persist cleaned data back to localStorage if duplicates were removed
      if (deduped.length !== raw.length) mockDb.set('records', deduped);
      return deduped;
    }
  },

  async createRecord(record) {
    if (isLiveMode()) {
      // Generate a UUID (fallback) to guarantee uniqueness
      const generateId = () =>
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let id = generateId();
      // Guard against rare collisions by checking existing IDs
      for (let attempts = 0; attempts < 5; attempts++) {
        const existing = await this.getAllRecords();
        if (!existing.some(r => r.id === id)) break;
        id = generateId();
      }
      const newRecord = { ...record, id };
      return await makeJsonpRequest('create', { record: newRecord });
    } else {
      await new Promise(r => setTimeout(r, 200));
      const records = mockDb.get('records');
      const newRecord = {
        ...record,
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      const updated = [...records, newRecord];
      // Remove any duplicate IDs (keep the latest entry)
      const deduped = Array.from(new Map(updated.map(r => [r.id, r])).values());
      mockDb.set('records', deduped);

      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Create Sales Record',
        `ID: ${newRecord.id}, Merchant: ${newRecord.merchantName}, Amount: ৳${newRecord.salesAmount}`
      );
      return { success: true, id: newRecord.id };
    }
  },

  async updateRecord(record) {
    if (isLiveMode()) {
      return makeJsonpRequest('update', { record });
    } else {
      await new Promise(r => setTimeout(r, 200));
      const records = mockDb.get('records');
      if (!records.some(r => r.id === record.id)) throw new Error('Record not found');
      const updated = records.map(r => (r.id === record.id ? record : r));
      mockDb.set('records', updated);

      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Update Sales Record',
        `ID: ${record.id}, Merchant: ${record.merchantName}, Amount: ৳${record.salesAmount}`
      );
      return { success: true };
    }
  },

  async deleteRecord(id) {
    if (isLiveMode()) {
      return makeJsonpRequest('delete', { id });
    } else {
      await new Promise(r => setTimeout(r, 200));
      const records = mockDb.get('records');
      const target = records.find(r => r.id === id);
      if (!target) throw new Error('Record not found');

      const filtered = records.filter(r => r.id !== id);
      mockDb.set('records', filtered);

      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Delete Sales Record',
        `ID: ${id}, Merchant: ${target.merchantName}, Amount: ৳${target.salesAmount}`
      );
      return { success: true };
    }
  },

  // --- BILL PAYMENTS ---
  async getAllPayments() {
    if (isLiveMode()) {
      const resp = await makeJsonpRequest('getPayments');
      return resp.payments || [];
    } else {
      await new Promise(r => setTimeout(r, 200));
      return mockDb.get('payments');
    }
  },

  async createPayment(payment) {
    if (isLiveMode()) {
      return makeJsonpRequest('createPayment', { payment });
    } else {
      await new Promise(r => setTimeout(r, 200));
      const payments = mockDb.get('payments');
      const newPayment = { ...payment, id: 'p' + Date.now() };
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
  },

  async updatePayment(payment) {
    if (isLiveMode()) {
      return makeJsonpRequest('updatePayment', { payment });
    } else {
      await new Promise(r => setTimeout(r, 200));
      const payments = mockDb.get('payments');
      const index = payments.findIndex(p => p.id === payment.id);
      if (index === -1) throw new Error('Payment not found');
      payments[index] = payment;
      mockDb.set('payments', payments);

      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Update Payment',
        `ID: ${payment.id}, Merchant: ${payment.merchantName}, Paid: ৳${payment.paidAmount}`
      );
      return { success: true };
    }
  },

  async deletePayment(id) {
    if (isLiveMode()) {
      return makeJsonpRequest('deletePayment', { id });
    } else {
      await new Promise(r => setTimeout(r, 200));
      const payments = mockDb.get('payments');
      const target = payments.find(p => p.id === id);
      if (!target) throw new Error('Payment not found');

      const filtered = payments.filter(p => p.id !== id);
      mockDb.set('payments', filtered);

      const session = getCurrentSession();
      mockDb.logAudit(
        session?.username || 'admin',
        'Delete Payment',
        `ID: ${id}, Merchant: ${target.merchantName}, Paid: ৳${target.paidAmount}`
      );
      return { success: true };
    }
  },

  // --- MERCHANT RETRIEVAL ---
  async getMerchants() {
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

  // --- ADMIN ACTIONS (USERS & AUDIT) ---
  async getUsers() {
    if (isLiveMode()) {
      const resp = await makeJsonpRequest('getUsers');
      return resp.users || [];
    } else {
      await new Promise(r => setTimeout(r, 200));
      return mockDb.get('users').map(({ username, role, status }) => ({ username, role, status }));
    }
  },

  async createUser(user) {
    if (isLiveMode()) {
      return makeJsonpRequest('createUser', { user });
    } else {
      await new Promise(r => setTimeout(r, 200));
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
    if (isLiveMode()) {
      return makeJsonpRequest('updateUser', { user });
    } else {
      await new Promise(r => setTimeout(r, 200));
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
    if (isLiveMode()) {
      return makeJsonpRequest('deleteUser', { targetUsername });
    } else {
      await new Promise(r => setTimeout(r, 200));
      const users = mockDb.get('users');
      const filtered = users.filter(u => u.username.toLowerCase() !== targetUsername.toLowerCase());
      mockDb.set('users', filtered);

      const session = getCurrentSession();
      mockDb.logAudit(session?.username || 'admin', 'Delete User', `Username: ${targetUsername}`);
      return { success: true };
    }
  },

  async getAuditLogs() {
    if (isLiveMode()) {
      const resp = await makeJsonpRequest('getAuditLogs');
      return resp.logs || [];
    } else {
      await new Promise(r => setTimeout(r, 200));
      return mockDb.get('audit');
    }
  },
};
