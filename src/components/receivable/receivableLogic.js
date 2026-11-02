import { generateUniqueId } from '../../utils/api.js';
import { sortRecordsByDateDesc, toDateKey } from '../../utils/dates.js';

// Normalise an account key coming from the backend (may be "Other Cash").
export const normalizeAccount = value =>
  String(value || 'cash')
    .toLowerCase()
    .trim();

export const isOtherCashAccount = acc => acc === 'other_cash' || acc === 'other cash';

// Today's date in the YYYY-MM-DD format used by all date inputs.
export const todayDateKey = () => new Date().toISOString().slice(0, 10);

// ─── Form defaults ──────────────────────────────────────────────────────────

export const emptyReceivableForm = () => ({
  name: '',
  amount: '',
  date: todayDateKey(),
  note: '',
  status: 'Not Received',
  receivedAccount: 'cash',
});

export const receivableFormFromRecord = record => ({
  name: record.name || '',
  amount: record.amount || '',
  date: record.date ? toDateKey(record.date) || record.date : todayDateKey(),
  note: record.note || '',
  status: record.status || 'Not Received',
  receivedAccount: record.receivedAccount || 'cash',
});

export const emptyReceiveForm = record => ({
  receivedAccount: 'cash',
  receivedDate: todayDateKey(),
  receiptNote: record?.note || '',
});

export const emptyPayableForm = () => ({
  name: '',
  amount: '',
  date: todayDateKey(),
  note: '',
  status: 'Unpaid',
  paidAccount: 'cash',
});

export const payableFormFromRecord = payable => ({
  name: payable.name || '',
  amount: payable.amount || '',
  date: payable.date ? toDateKey(payable.date) || payable.date : todayDateKey(),
  note: payable.note || '',
  status: payable.status || 'Unpaid',
  paidAccount: payable.paidAccount || 'cash',
});

export const emptyPayModal = payable => ({
  paidAccount: 'cash',
  paidDate: todayDateKey(),
  payNote: payable?.note || '',
});

// ─── Metrics ────────────────────────────────────────────────────────────────

export const computeReceivableStats = (receivables = []) => {
  let total = 0;
  let received = 0;
  let pending = 0;
  let pendingCount = 0;
  let receivedCount = 0;

  let receivedInCash = 0;
  let receivedInOnline = 0;
  let receivedInOtherCash = 0;

  receivables.forEach(r => {
    const amt = parseFloat(r.amount) || 0;
    total += amt;
    const isRec = r.status === 'Received';

    if (isRec) {
      received += amt;
      receivedCount += 1;
      const acc = normalizeAccount(r.receivedAccount);
      if (isOtherCashAccount(acc)) {
        receivedInOtherCash += amt;
      } else if (acc === 'online') {
        receivedInOnline += amt;
      } else {
        receivedInCash += amt;
      }
    } else {
      pending += amt;
      pendingCount += 1;
    }
  });

  return {
    total,
    received,
    pending,
    pendingCount,
    receivedCount,
    receivedInCash,
    receivedInOnline,
    receivedInOtherCash,
  };
};

export const computePayableStats = (payables = []) => {
  let total = 0;
  let paid = 0;
  let unpaid = 0;
  let unpaidCount = 0;
  let paidCount = 0;
  let paidInCash = 0;
  let paidInOnline = 0;
  let paidInOtherCash = 0;

  payables.forEach(p => {
    const amt = parseFloat(p.amount) || 0;
    total += amt;
    const isPaid = p.status === 'Paid';

    if (isPaid) {
      paid += amt;
      paidCount += 1;
      const acc = normalizeAccount(p.paidAccount);
      if (isOtherCashAccount(acc)) {
        paidInOtherCash += amt;
      } else if (acc === 'online') {
        paidInOnline += amt;
      } else {
        paidInCash += amt;
      }
    } else {
      unpaid += amt;
      unpaidCount += 1;
    }
  });

  return {
    total,
    paid,
    unpaid,
    unpaidCount,
    paidCount,
    paidInCash,
    paidInOnline,
    paidInOtherCash,
  };
};

// ─── Filtering ──────────────────────────────────────────────────────────────

const matchesSearch = (record, query) => {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  const nameMatch = String(record.name || '')
    .toLowerCase()
    .includes(q);
  const noteMatch = String(record.note || '')
    .toLowerCase()
    .includes(q);
  const amtMatch = String(record.amount || '').includes(q);
  return nameMatch || noteMatch || amtMatch;
};

export const filterReceivables = (
  receivables = [],
  { searchQuery = '', statusFilter = 'all', accountFilter = 'all' } = {}
) => {
  const filtered = receivables.filter(r => {
    if (statusFilter === 'pending' && r.status === 'Received') return false;
    if (statusFilter === 'received' && r.status !== 'Received') return false;

    if (accountFilter !== 'all') {
      if (r.status !== 'Received') return false;
      if (normalizeAccount(r.receivedAccount) !== accountFilter) return false;
    }

    return matchesSearch(r, searchQuery);
  });

  return sortRecordsByDateDesc(filtered);
};

export const filterPayables = (
  payables = [],
  { paySearchQuery = '', payStatusFilter = 'all', payAccountFilter = 'all' } = {}
) => {
  const filtered = payables.filter(p => {
    if (payStatusFilter === 'unpaid' && p.status === 'Paid') return false;
    if (payStatusFilter === 'paid' && p.status !== 'Paid') return false;

    if (payAccountFilter !== 'all') {
      if (p.status !== 'Paid') return false;
      if (normalizeAccount(p.paidAccount) !== payAccountFilter) return false;
    }

    return matchesSearch(p, paySearchQuery);
  });

  return sortRecordsByDateDesc(filtered);
};

// ─── Payload builders ───────────────────────────────────────────────────────

export const buildReceivablePayload = (form, editingRecord = null) => {
  const amount = parseFloat(form.amount);
  const isReceived = form.status === 'Received';

  if (editingRecord) {
    return {
      ...editingRecord,
      name: form.name.trim(),
      amount: String(amount),
      date: form.date,
      note: form.note.trim(),
      status: form.status,
      receivedAccount: isReceived ? form.receivedAccount : null,
      receivedDate: isReceived ? editingRecord.receivedDate || form.date : null,
    };
  }

  return {
    id: generateUniqueId('recv'),
    name: form.name.trim(),
    amount: String(amount),
    date: form.date,
    note: form.note.trim(),
    status: form.status,
    receivedAccount: isReceived ? form.receivedAccount : null,
    receivedDate: isReceived ? form.date : null,
  };
};

export const buildReceivePayload = (receivingRecord, receiveForm) => ({
  ...receivingRecord,
  status: 'Received',
  receivedAccount: receiveForm.receivedAccount,
  receivedDate: receiveForm.receivedDate,
  note: receiveForm.receiptNote ? receiveForm.receiptNote.trim() : receivingRecord.note,
});

export const buildRevertedReceivable = record => ({
  ...record,
  status: 'Not Received',
  receivedAccount: null,
  receivedDate: null,
});

export const buildPayablePayload = (payForm, editingPayable = null) => {
  const amount = parseFloat(payForm.amount);
  const isPaid = payForm.status === 'Paid';

  if (editingPayable) {
    return {
      ...editingPayable,
      name: payForm.name.trim(),
      amount: String(amount),
      date: payForm.date,
      note: payForm.note.trim(),
      status: payForm.status,
      paidAccount: isPaid ? payForm.paidAccount : null,
      paidDate: isPaid ? editingPayable.paidDate || payForm.date : null,
    };
  }

  return {
    id: generateUniqueId('payab'),
    name: payForm.name.trim(),
    amount: String(amount),
    date: payForm.date,
    note: payForm.note.trim(),
    status: payForm.status,
    paidAccount: isPaid ? payForm.paidAccount : null,
    paidDate: isPaid ? payForm.date : null,
  };
};

export const buildPayPayload = (payingRecord, payModal) => ({
  ...payingRecord,
  status: 'Paid',
  paidAccount: payModal.paidAccount,
  paidDate: payModal.paidDate,
  note: payModal.payNote ? payModal.payNote.trim() : payingRecord.note,
});

export const buildRevertedPayable = payable => ({
  ...payable,
  status: 'Unpaid',
  paidAccount: null,
  paidDate: null,
});
