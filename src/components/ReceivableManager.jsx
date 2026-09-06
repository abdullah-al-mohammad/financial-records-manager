import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Edit2,
  HandCoins,
  Info,
  PiggyBank,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDisplayDate, toDateKey } from '../utils/dates';

const ACCOUNT_LABELS = {
  cash: {
    label: 'Hand Cash',
    icon: PiggyBank,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  online: {
    label: 'Online Cash',
    icon: CreditCard,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  other_cash: {
    label: 'Other Cash',
    icon: Wallet,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
};

export default function ReceivableManager({
  receivables = [],
  onAddReceivable,
  onUpdateReceivable,
  onDeleteReceivable,
  payables = [],
  onAddPayable,
  onUpdatePayable,
  onDeletePayable,
}) {
  const [activeTab, setActiveTab] = useState('receivable'); // 'receivable' or 'payable'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'received'
  const [accountFilter, setAccountFilter] = useState('all');

  // Modal States
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receivingRecord, setReceivingRecord] = useState(null);

  // Form State for Add / Edit
  const [form, setForm] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    status: 'Not Received',
    receivedAccount: 'cash',
  });

  // Receive Modal Form State
  const [receiveForm, setReceiveForm] = useState({
    receivedAccount: 'cash',
    receivedDate: new Date().toISOString().slice(0, 10),
    receiptNote: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Payable State ─────────────────────────────────────────────────────────
  // payable সার্চ এবং ফিল্টারের জন্য আলাদা state রাখা হয়েছে
  const [paySearchQuery, setPaySearchQuery] = useState('');
  const [payStatusFilter, setPayStatusFilter] = useState('all'); // 'all', 'unpaid', 'paid'
  const [payAccountFilter, setPayAccountFilter] = useState('all');

  // Payable Add/Edit modal এর জন্য state
  const [showPayAddEditModal, setShowPayAddEditModal] = useState(false);
  const [editingPayable, setEditingPayable] = useState(null);
  const [payForm, setPayForm] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    status: 'Unpaid',
    paidAccount: 'cash',
  });

  // Paid confirmation modal এর জন্য state
  // showPayModal: modal দেখাবে কিনা, payingRecord: কোন payable টা pay করা হচ্ছে
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingRecord, setPayingRecord] = useState(null);
  const [payModal, setPayModal] = useState({
    paidAccount: 'cash',
    paidDate: new Date().toISOString().slice(0, 10),
    payNote: '',
  });

  const [isPaySubmitting, setIsPaySubmitting] = useState(false);

  // Metric Computations
  const stats = useMemo(() => {
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
        const acc = String(r.receivedAccount || 'cash')
          .toLowerCase()
          .trim();
        if (acc === 'other_cash' || acc === 'other cash') {
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
  }, [receivables]);

  // ─── Payable Metric Computations ──────────────────────────────────────────
  // payables array থেকে মোট দেনা, paid এবং unpaid পরিমাণ হিসাব করা হচ্ছে
  const payStats = useMemo(() => {
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
      // status 'Paid' হলে paid হিসেবে গণনা করা হবে
      const isPaid = p.status === 'Paid';

      if (isPaid) {
        paid += amt;
        paidCount += 1;
        // কোন account থেকে pay করা হয়েছে সেই অনুযায়ী ভাগ করা হচ্ছে
        const acc = String(p.paidAccount || 'cash').toLowerCase().trim();
        if (acc === 'other_cash' || acc === 'other cash') {
          paidInOtherCash += amt;
        } else if (acc === 'online') {
          paidInOnline += amt;
        } else {
          // default: hand cash থেকে deduct হবে
          paidInCash += amt;
        }
      } else {
        unpaid += amt;
        unpaidCount += 1;
      }
    });

    return { total, paid, unpaid, unpaidCount, paidCount, paidInCash, paidInOnline, paidInOtherCash };
  }, [payables]);

  // Filtered List
  const filteredRecords = useMemo(() => {
    return receivables
      .filter(r => {
        // Status filter
        if (statusFilter === 'pending' && r.status === 'Received') return false;
        if (statusFilter === 'received' && r.status !== 'Received') return false;

        // Account filter (applies to received)
        if (accountFilter !== 'all') {
          if (r.status !== 'Received') return false;
          const acc = String(r.receivedAccount || 'cash')
            .toLowerCase()
            .trim();
          if (acc !== accountFilter) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = String(r.name || '')
            .toLowerCase()
            .includes(q);
          const noteMatch = String(r.note || '')
            .toLowerCase()
            .includes(q);
          const amtMatch = String(r.amount || '').includes(q);
          if (!nameMatch && !noteMatch && !amtMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pending first, then by date descending
        if (a.status !== b.status) {
          return a.status === 'Not Received' ? -1 : 1;
        }
        const dateA = toDateKey(a.date) || '';
        const dateB = toDateKey(b.date) || '';
        return dateB.localeCompare(dateA);
      });
  }, [receivables, statusFilter, accountFilter, searchQuery]);

  // Payable filtered list — payables filter এবং sort করা হচ্ছে
  const filteredPayables = useMemo(() => {
    return payables
      .filter(p => {
        // Status filter: unpaid শুধু দেখাবে, paid শুধু দেখাবে, অথবা all
        if (payStatusFilter === 'unpaid' && p.status === 'Paid') return false;
        if (payStatusFilter === 'paid' && p.status !== 'Paid') return false;

        // Account filter: শুধু paid records-এ apply হবে
        if (payAccountFilter !== 'all') {
          if (p.status !== 'Paid') return false;
          const acc = String(p.paidAccount || 'cash').toLowerCase().trim();
          if (acc !== payAccountFilter) return false;
        }

        // Search: নাম, নোট বা পরিমাণ দিয়ে খোঁজা যাবে
        if (paySearchQuery.trim()) {
          const q = paySearchQuery.toLowerCase().trim();
          const nameMatch = String(p.name || '').toLowerCase().includes(q);
          const noteMatch = String(p.note || '').toLowerCase().includes(q);
          const amtMatch = String(p.amount || '').includes(q);
          if (!nameMatch && !noteMatch && !amtMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Unpaid আগে দেখাবে (বকেয়া সবার আগে)
        if (a.status !== b.status) {
          return a.status === 'Unpaid' ? -1 : 1;
        }
        const dateA = toDateKey(a.date) || '';
        const dateB = toDateKey(b.date) || '';
        return dateB.localeCompare(dateA);
      });
  }, [payables, payStatusFilter, payAccountFilter, paySearchQuery]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setForm({
      name: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      note: '',
      status: 'Not Received',
      receivedAccount: 'cash',
    });
    setShowAddEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = record => {
    setEditingRecord(record);
    setForm({
      name: record.name || '',
      amount: record.amount || '',
      date: record.date
        ? toDateKey(record.date) || record.date
        : new Date().toISOString().slice(0, 10),
      note: record.note || '',
      status: record.status || 'Not Received',
      receivedAccount: record.receivedAccount || 'cash',
    });
    setShowAddEditModal(true);
  };

  // Open Receive Modal
  const handleOpenReceive = record => {
    setReceivingRecord(record);
    setReceiveForm({
      receivedAccount: 'cash',
      receivedDate: new Date().toISOString().slice(0, 10),
      receiptNote: record.note || '',
    });
    setShowReceiveModal(true);
  };

  // Handle Save (Add or Update)
  const handleSaveRecord = async e => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter a Person or Business Name.');
      return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRecord) {
        await onUpdateReceivable({
          ...editingRecord,
          name: form.name.trim(),
          amount: String(amt),
          date: form.date,
          note: form.note.trim(),
          status: form.status,
          receivedAccount: form.status === 'Received' ? form.receivedAccount : null,
          receivedDate: form.status === 'Received' ? editingRecord.receivedDate || form.date : null,
        });
      } else {
        await onAddReceivable({
          name: form.name.trim(),
          amount: String(amt),
          date: form.date,
          note: form.note.trim(),
          status: form.status,
          receivedAccount: form.status === 'Received' ? form.receivedAccount : null,
          receivedDate: form.status === 'Received' ? form.date : null,
        });
      }
      setShowAddEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Receive
  const handleConfirmReceive = async e => {
    e.preventDefault();
    if (!receivingRecord) return;

    setIsSubmitting(true);
    try {
      await onUpdateReceivable({
        ...receivingRecord,
        status: 'Received',
        receivedAccount: receiveForm.receivedAccount,
        receivedDate: receiveForm.receivedDate,
        note: receiveForm.receiptNote ? receiveForm.receiptNote.trim() : receivingRecord.note,
      });
      setShowReceiveModal(false);
      setReceivingRecord(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revert Received status back to Not Received
  const handleRevertStatus = async record => {
    const confirm = window.confirm(
      `Revert payment of ৳${parseFloat(record.amount || 0).toLocaleString()} from "${record.name}" back to "Not Received"?\n\nThis will subtract the amount from your ${ACCOUNT_LABELS[record.receivedAccount || 'cash']?.label || 'cash'} balance.`
    );
    if (!confirm) return;

    try {
      await onUpdateReceivable({
        ...record,
        status: 'Not Received',
        receivedAccount: null,
        receivedDate: null,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Record
  const handleDelete = async record => {
    const confirm = window.confirm(
      `Are you sure you want to delete receivable record for "${record.name}" (৳${parseFloat(record.amount || 0).toLocaleString()})?`
    );
    if (!confirm) return;

    try {
      await onDeleteReceivable(record.id);
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Payable Handlers ──────────────────────────────────────────────────────

  // নতুন Payable যোগ করার modal খোলা
  const handleOpenPayAdd = () => {
    setEditingPayable(null);
    setPayForm({
      name: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      note: '',
      status: 'Unpaid',
      paidAccount: 'cash',
    });
    setShowPayAddEditModal(true);
  };

  // বিদ্যমান Payable edit করার modal খোলা
  const handleOpenPayEdit = payable => {
    setEditingPayable(payable);
    setPayForm({
      name: payable.name || '',
      amount: payable.amount || '',
      date: payable.date ? toDateKey(payable.date) || payable.date : new Date().toISOString().slice(0, 10),
      note: payable.note || '',
      status: payable.status || 'Unpaid',
      paidAccount: payable.paidAccount || 'cash',
    });
    setShowPayAddEditModal(true);
  };

  // Payable Add/Edit form সংরক্ষণ করা
  const handleSavePayable = async e => {
    e.preventDefault();
    if (!payForm.name.trim()) {
      alert('Please enter a Person or Business Name.');
      return;
    }
    const amt = parseFloat(payForm.amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    setIsPaySubmitting(true);
    try {
      if (editingPayable) {
        // বিদ্যমান record আপডেট করা হচ্ছে
        await onUpdatePayable({
          ...editingPayable,
          name: payForm.name.trim(),
          amount: String(amt),
          date: payForm.date,
          note: payForm.note.trim(),
          status: payForm.status,
          paidAccount: payForm.status === 'Paid' ? payForm.paidAccount : null,
          paidDate: payForm.status === 'Paid' ? (editingPayable.paidDate || payForm.date) : null,
        });
      } else {
        // নতুন record তৈরি করা হচ্ছে
        await onAddPayable({
          name: payForm.name.trim(),
          amount: String(amt),
          date: payForm.date,
          note: payForm.note.trim(),
          status: payForm.status,
          paidAccount: payForm.status === 'Paid' ? payForm.paidAccount : null,
          paidDate: payForm.status === 'Paid' ? payForm.date : null,
        });
      }
      setShowPayAddEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaySubmitting(false);
    }
  };

  // "Paid" বাটনে ক্লিক করলে confirmation modal খোলা
  // isPaid চেক করে double-payment রোধ করা হয়েছে
  const handleOpenPayModal = payable => {
    // যদি ইতিমধ্যে paid হয়ে থাকে তাহলে modal খুলবে না — double payment prevent করা হচ্ছে
    if (payable.status === 'Paid') return;
    setPayingRecord(payable);
    setPayModal({
      paidAccount: 'cash',
      paidDate: new Date().toISOString().slice(0, 10),
      payNote: payable.note || '',
    });
    setShowPayModal(true);
  };

  // Confirmation modal-এ "Confirm Payment" বাটনে ক্লিক করলে এই function চলবে
  const handleConfirmPay = async e => {
    e.preventDefault();
    // payingRecord না থাকলে বের হয়ে যাবো — safety check
    if (!payingRecord) return;

    // Double-payment রোধ: যদি ইতিমধ্যে paid হয়ে থাকে তাহলে API call করা হবে না
    if (payingRecord.status === 'Paid') {
      setShowPayModal(false);
      return;
    }

    setIsPaySubmitting(true);
    try {
      // API call: payable record আপডেট করা হচ্ছে, status 'Paid' এবং paidAccount সেট করা হচ্ছে
      // finance.js এর computeNetCashBalance function এই paidAccount দেখে correct cash bucket থেকে deduct করবে
      await onUpdatePayable({
        ...payingRecord,               // existing সব field রাখা হচ্ছে
        status: 'Paid',                // status পরিবর্তন করা হচ্ছে Unpaid → Paid
        paidAccount: payModal.paidAccount,  // কোন account থেকে pay হয়েছে (cash/online/other_cash)
        paidDate: payModal.paidDate,        // কোন তারিখে pay হয়েছে
        note: payModal.payNote ? payModal.payNote.trim() : payingRecord.note, // আপডেটেড নোট
      });
      // সফল হলে modal বন্ধ করা হচ্ছে এবং state clear করা হচ্ছে
      setShowPayModal(false);
      setPayingRecord(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaySubmitting(false);
    }
  };

  // Paid status টাকে Unpaid-এ revert করার handler
  const handleRevertPayStatus = async payable => {
    const confirmed = window.confirm(
      `"${payable.name}"-এর ৳${parseFloat(payable.amount || 0).toLocaleString()} payment টাকে "Unpaid"-এ ফেরত নিবেন?\n\nএটি আপনার ${ACCOUNT_LABELS[payable.paidAccount || 'cash']?.label || 'cash'} balance-এ টাকা ফেরত যোগ করবে।`
    );
    if (!confirmed) return;

    try {
      await onUpdatePayable({
        ...payable,
        status: 'Unpaid',    // Paid → Unpaid
        paidAccount: null,   // account info মুছে ফেলা হচ্ছে
        paidDate: null,      // payment date মুছে ফেলা হচ্ছে
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Payable record ডিলিট করার handler
  const handleDeletePayable = async payable => {
    const confirmed = window.confirm(
      `"${payable.name}" (৳${parseFloat(payable.amount || 0).toLocaleString()})-এর payable record মুছে ফেলবেন?`
    );
    if (!confirmed) return;

    try {
      await onDeletePayable(payable.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Section Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Receivables &amp; Payables
            </h1>
            <span className="badge-pill badge-indigo">
              Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track money you will receive from clients and debts you owe to suppliers with auto cash balance deduction
          </p>
        </div>

        {/* Action Button for Receivable */}
        {activeTab === 'receivable' ? (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 btn-emerald-gradient px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Receivable
          </button>
        ) : (
          <button
            type="button"
            id="btn-add-payable"
            onClick={handleOpenPayAdd}
            className="flex items-center justify-center gap-2 btn-rose-gradient px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Payable
          </button>
        )}
      </div>

      {/* Sub-tab Navigation (Receivable vs Payable Segmented Control) */}
      <div className="glass-panel p-1 rounded-2xl flex items-center gap-1.5 border border-slate-800/80 w-full sm:w-fit shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab('receivable')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'receivable'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ArrowDownLeft className={`w-3.5 h-3.5 ${activeTab === 'receivable' ? 'text-emerald-300' : 'text-emerald-400'}`} />
          <span>Receivables (Money to Receive)</span>
          {stats.pendingCount > 0 && (
            <span className="badge-pill badge-amber text-[9px] py-0.5 px-1.5 font-bold">
              {stats.pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payable')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'payable'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Coins className={`w-3.5 h-3.5 ${activeTab === 'payable' ? 'text-rose-200' : 'text-rose-400'}`} />
          <span>Payables (Money I Owe)</span>
          {payStats.unpaidCount > 0 && (
            <span className="badge-pill badge-rose text-[9px] py-0.5 px-1.5 font-bold">
              {payStats.unpaidCount}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════ PAYABLE TAB CONTENT ═══════════════ */}
      {activeTab === 'payable' ? (
        <>
          {/* Payable Header Notice */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Manage suppliers &amp; debts you owe. Clicking <span className="font-semibold text-rose-400">"Pay Now"</span> deducts from cash balance.
            </p>
          </div>

          {/* Payable Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Unpaid (বকেয়া) */}
            <div className="glass-panel rounded-2xl p-5 border border-rose-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Debt</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">
                  ৳{payStats.unpaid.toLocaleString()}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold text-rose-400">{payStats.unpaidCount} record{payStats.unpaidCount !== 1 ? 's' : ''}</span>
                  <span className="text-[10px] text-slate-500">pending payment</span>
                </div>
              </div>
            </div>

            {/* Paid (পরিশোধিত) */}
            <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">
                  ৳{payStats.paid.toLocaleString()}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold text-emerald-400">{payStats.paidCount} settled</span>
                  <span className="text-[10px] text-slate-500">from balances</span>
                </div>
              </div>
            </div>

            {/* Total Payable */}
            <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payable</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">
                  ৳{payStats.total.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">{payables.length} total entries</span>
              </div>
            </div>

            {/* Deduction breakdown by account */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-900 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Deducted From</span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <PiggyBank className="w-3 h-3 text-amber-400" /> Hand Cash:
                  </span>
                  <span className="font-bold text-slate-200">৳{payStats.paidInCash.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-violet-400" /> Online:
                  </span>
                  <span className="font-bold text-slate-200">৳{payStats.paidInOnline.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-emerald-400" /> Other Cash:
                  </span>
                  <span className="font-bold text-slate-200">৳{payStats.paidInOtherCash.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search + Filter Toolbar */}
          <div className="glass-panel border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={paySearchQuery}
                onChange={e => setPaySearchQuery(e.target.value)}
                placeholder="Search supplier, note, or amount..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-900">
                {/* All filter */}
                <button
                  type="button"
                  onClick={() => setPayStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    payStatusFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({payables.length})
                </button>
                {/* Unpaid filter */}
                <button
                  type="button"
                  onClick={() => setPayStatusFilter('unpaid')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    payStatusFilter === 'unpaid' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unpaid ({payStats.unpaidCount})
                </button>
                {/* Paid filter */}
                <button
                  type="button"
                  onClick={() => setPayStatusFilter('paid')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    payStatusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paid ({payStats.paidCount})
                </button>
              </div>
              {/* Account filter */}
              <select
                value={payAccountFilter}
                onChange={e => setPayAccountFilter(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-rose-500"
              >
                <option value="all">All Accounts</option>
                <option value="cash">Hand Cash</option>
                <option value="online">Online Cash</option>
                <option value="other_cash">Other Cash</option>
              </select>
              {(paySearchQuery || payStatusFilter !== 'all' || payAccountFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => { setPaySearchQuery(''); setPayStatusFilter('all'); setPayAccountFilter('all'); }}
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Clear all filters"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Payable Records Table */}
          <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
            {filteredPayables.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Coins className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">No payable records found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {paySearchQuery || payStatusFilter !== 'all' || payAccountFilter !== 'all'
                    ? 'Try adjusting your search or filter settings.'
                    : 'Add a supplier or individual you owe money to.'}
                </p>
                {!paySearchQuery && payStatusFilter === 'all' && (
                  <button
                    type="button"
                    onClick={handleOpenPayAdd}
                    className="inline-flex items-center gap-1.5 px-4 py-2 btn-rose-gradient text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Payable
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Supplier / Person</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Note</th>
                      <th>Payment Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayables.map(pay => {
                      // pay.status === 'Paid' হলে button disabled করা হবে (double payment রোধ)
                      const isPaid = pay.status === 'Paid';
                      const accConfig = ACCOUNT_LABELS[pay.paidAccount || 'cash'] || ACCOUNT_LABELS.cash;

                      return (
                        <tr
                          key={pay.id}
                          className="text-slate-300 group"
                        >
                          {/* Supplier / Person Name */}
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center group-hover:border-rose-500/40 transition-colors">
                                <Building2 className="w-4 h-4 text-rose-400" />
                              </div>
                              <div>
                                <span className="font-bold text-white block text-xs">{pay.name}</span>
                                {/* Paid হলে কোন তারিখে pay করা হয়েছে তা দেখানো */}
                                {isPaid && pay.paidDate && (
                                  <span className="text-[10px] text-slate-500 block">
                                    Paid on {formatDisplayDate(pay.paidDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Amount: paid হলে emerald (সবুজ), unpaid হলে rose (লাল) */}
                          <td className="font-bold text-sm">
                            <span className={isPaid ? 'text-emerald-400' : 'text-rose-400'}>
                              ৳{parseFloat(pay.amount || 0).toLocaleString()}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="text-slate-400 font-medium">
                            {formatDisplayDate(pay.date)}
                          </td>

                          {/* Note */}
                          <td className="max-w-xs truncate text-slate-400">
                            {pay.note || <span className="text-slate-600">—</span>}
                          </td>

                          {/* Payment Status Badge */}
                          <td>
                            {isPaid ? (
                              <span className="badge-pill badge-emerald">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Paid</span>
                                <span className="text-[10px] opacity-80 font-normal">({accConfig.label})</span>
                              </span>
                            ) : (
                              <span className="badge-pill badge-rose">
                                <Clock className="w-3.5 h-3.5 animate-pulse" />
                                <span>Unpaid</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* PAID BUTTON: শুধু Unpaid record-এ দেখাবে */}
                              {!isPaid ? (
                                <button
                                  type="button"
                                  id={`btn-pay-${pay.id}`}
                                  onClick={() => handleOpenPayModal(pay)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-rose-gradient text-white font-semibold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                                  title="Mark as paid and deduct from cash balance"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                  <span>Pay Now</span>
                                </button>
                              ) : (
                                // Paid হলে revert বাটন দেখাবে
                                <button
                                  type="button"
                                  onClick={() => handleRevertPayStatus(pay)}
                                  className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer"
                                  title="Revert status to Unpaid"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenPayEdit(pay)}
                                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all cursor-pointer"
                                title="Edit payable record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeletePayable(pay)}
                                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
                                title="Delete payable record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending Collection */}
            <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pending Collection
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">
                  ৳{stats.pending.toLocaleString()}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold text-amber-400">
                    {stats.pendingCount} record{stats.pendingCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[10px] text-slate-500">awaiting receipt</span>
                </div>
              </div>
            </div>

            {/* Total Collected */}
            <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Received
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">
                  ৳{stats.received.toLocaleString()}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold text-emerald-400">
                    {stats.receivedCount} collected
                  </span>
                  <span className="text-[10px] text-slate-500">into balances</span>
                </div>
              </div>
            </div>

            {/* Total Receivables */}
            <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Receivable
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <HandCoins className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">
                  ৳{stats.total.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {receivables.length} total entries recorded
                </span>
              </div>
            </div>

            {/* Received Distribution breakdown */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-900 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Deposit Balances
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <PiggyBank className="w-3 h-3 text-amber-400" /> Hand Cash:
                  </span>
                  <span className="font-bold text-slate-200">
                    ৳{stats.receivedInCash.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-violet-400" /> Online:
                  </span>
                  <span className="font-bold text-slate-200">
                    ৳{stats.receivedInOnline.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-emerald-400" /> Other Cash:
                  </span>
                  <span className="font-bold text-slate-200">
                    ৳{stats.receivedInOtherCash.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Toolbar */}
          <div className="glass-panel border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search person, business, or note..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-900">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({receivables.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({stats.pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('received')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === 'received'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Received ({stats.receivedCount})
                </button>
              </div>

              {/* Account Filter */}
              <select
                value={accountFilter}
                onChange={e => setAccountFilter(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
              >
                <option value="all">All Accounts</option>
                <option value="cash">Hand Cash</option>
                <option value="online">Online Cash</option>
                <option value="other_cash">Other Cash</option>
              </select>

              {(searchQuery || statusFilter !== 'all' || accountFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setAccountFilter('all');
                  }}
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Clear all filters"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Records Table / List */}
          <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <HandCoins className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">
                  No receivable records found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all' || accountFilter !== 'all'
                    ? 'Try adjusting your search or filter settings.'
                    : 'Start by adding a person or business from whom you expect to receive money.'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-4 py-2 btn-emerald-gradient text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Receivable
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Person / Business Name</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Note</th>
                      <th>Payment Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(rec => {
                      const isReceived = rec.status === 'Received';
                      const accConfig =
                        ACCOUNT_LABELS[rec.receivedAccount || 'cash'] || ACCOUNT_LABELS.cash;
                      const AccIcon = accConfig.icon;

                      return (
                        <tr
                          key={rec.id}
                          className="text-slate-300 group"
                        >
                          {/* Person / Business Name */}
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:border-indigo-500/40 transition-colors">
                                <Building2 className="w-4 h-4 text-indigo-400" />
                              </div>
                              <div>
                                <span className="font-bold text-white block text-xs">
                                  {rec.name}
                                </span>
                                {isReceived && rec.receivedDate && (
                                  <span className="text-[10px] text-slate-500 block">
                                    Received on {formatDisplayDate(rec.receivedDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="font-bold text-sm">
                            <span className={isReceived ? 'text-emerald-400' : 'text-amber-400'}>
                              ৳{parseFloat(rec.amount || 0).toLocaleString()}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="text-slate-400 font-medium">
                            {formatDisplayDate(rec.date)}
                          </td>

                          {/* Note */}
                          <td className="max-w-xs truncate text-slate-400">
                            {rec.note || <span className="text-slate-600">—</span>}
                          </td>

                          {/* Payment Status */}
                          <td>
                            {isReceived ? (
                              <span className="badge-pill badge-emerald">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Received</span>
                                <span className="text-[10px] opacity-80 font-normal">
                                  ({accConfig.label})
                                </span>
                              </span>
                            ) : (
                              <span className="badge-pill badge-amber">
                                <Clock className="w-3.5 h-3.5 animate-pulse" />
                                <span>Not Received</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Receive Button (Only if Not Received) */}
                              {!isReceived ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReceive(rec)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-emerald-gradient text-white font-semibold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                                  title="Receive money and deposit to cash balance"
                                >
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                  <span>Receive</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRevertStatus(rec)}
                                  className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer"
                                  title="Revert status to Not Received"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(rec)}
                                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all cursor-pointer"
                                title="Edit record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDelete(rec)}
                                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════ PAY CONFIRMATION MODAL ═══════════════ */}
      {/* এই modal-টি Paid বাটনে ক্লিক করলে দেখা যাবে */}
      {showPayModal && payingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel border border-rose-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl bg-slate-950">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Confirm Payment</h3>
                  <span className="text-[10px] text-slate-400">Mark as paid and deduct from selected balance</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="p-6 space-y-5">
              {/* Payment Summary: কতটাকা কাকে দেওয়া হবে তা দেখানো */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">To Person / Supplier:</span>
                  <span className="font-bold text-white">{payingRecord.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Payable Amount:</span>
                  {/* payingRecord.amount থেকে টাকার পরিমাণ দেখানো হচ্ছে */}
                  <span className="font-bold text-base text-rose-400">
                    ৳{parseFloat(payingRecord.amount || 0).toLocaleString()}
                  </span>
                </div>
                {payingRecord.note && (
                  <div className="pt-2 border-t border-slate-850/60 text-[11px] text-slate-400">
                    <span className="text-slate-500">Note: </span>{payingRecord.note}
                  </div>
                )}
              </div>

              {/* Account Selector: কোন cash account থেকে pay হবে */}
              {/* এই paidAccount মানটি finance.js এর computeNetCashBalance-এ ব্যবহৃত হবে */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Deduct From Cash Balance <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Hand Cash', desc: 'Physical Cash', icon: PiggyBank, color: 'text-amber-400' },
                    { id: 'online', label: 'Online Cash', desc: 'bKash / Bank', icon: CreditCard, color: 'text-violet-400' },
                    { id: 'other_cash', label: 'Other Cash', desc: 'Extra Reserve', icon: Wallet, color: 'text-emerald-400' },
                  ].map(acc => {
                    const Icon = acc.icon;
                    // isSelected: বর্তমানে কোন account select করা আছে
                    const isSelected = payModal.paidAccount === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setPayModal(prev => ({ ...prev, paidAccount: acc.id }))}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600/15 border-rose-500 text-white shadow-sm'
                            : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`w-4 h-4 ${acc.color}`} />
                          {isSelected && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                        </div>
                        <div className="mt-2">
                          <span className="font-bold text-xs block leading-tight">{acc.label}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{acc.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Date: কোন তারিখে payment করা হচ্ছে */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Payment Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={payModal.paidDate}
                  onChange={e => setPayModal(prev => ({ ...prev, paidDate: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Optional Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Note / Reference (optional)
                </label>
                <input
                  type="text"
                  value={payModal.payNote}
                  onChange={e => setPayModal(prev => ({ ...prev, payNote: e.target.value }))}
                  placeholder="e.g. Paid via bKash / receipt #123..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                />
              </div>

              {/* Explanatory Banner: কি হবে তা ব্যাখ্যা করা হচ্ছে */}
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-2.5 text-[11px] text-slate-400">
                <Info className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  Confirming will mark this as <strong>Paid</strong> and deduct{' '}
                  <strong className="text-rose-400">৳{parseFloat(payingRecord.amount || 0).toLocaleString()}</strong> from your{' '}
                  <strong>{ACCOUNT_LABELS[payModal.paidAccount]?.label}</strong> balance immediately.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                {/* Submit বাটন: isPaySubmitting true হলে disabled করা হবে */}
                <button
                  type="submit"
                  id="btn-confirm-pay"
                  disabled={isPaySubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPaySubmitting ? 'Processing...' : 'Confirm & Deduct Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ PAYABLE ADD/EDIT MODAL ═══════════════ */}
      {showPayAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl bg-slate-950">
            <div className="p-5 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  {editingPayable ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingPayable ? 'Edit Payable' : 'New Payable Record'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {editingPayable ? 'Update record details' : 'Add money you owe to someone'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayAddEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayable} className="p-6 space-y-4">
              {/* Supplier / Person Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Supplier / Person Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={payForm.name}
                  onChange={e => setPayForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Packaging World Ltd or Hasan Bhai"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Amount (৳) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={payForm.amount}
                  onChange={e => setPayForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={payForm.date}
                  onChange={e => setPayForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">Note / Purpose (optional)</label>
                <textarea
                  rows={2}
                  value={payForm.note}
                  onChange={e => setPayForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="e.g. Packaging materials, rent due, etc."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">Payment Status</label>
                <select
                  value={payForm.status}
                  onChange={e => setPayForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                >
                  <option value="Unpaid">Unpaid (Pending)</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* যদি Paid select করা হয়, account selector দেখাবে */}
              {payForm.status === 'Paid' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-850">
                  <label className="text-[11px] font-medium text-slate-300 block">Deduct From Balance</label>
                  <select
                    value={payForm.paidAccount}
                    onChange={e => setPayForm(prev => ({ ...prev, paidAccount: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  >
                    <option value="cash">Hand Cash</option>
                    <option value="online">Online Cash</option>
                    <option value="other_cash">Other Cash</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowPayAddEditModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaySubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPaySubmitting ? 'Saving...' : editingPayable ? 'Update Record' : 'Save Payable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RECEIVE MONEY MODAL --- */}
      {showReceiveModal && receivingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel border border-emerald-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl bg-slate-950">
            <div className="p-5 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Receive Money</h3>
                  <span className="text-[10px] text-slate-400">
                    Record payment and add to selected cash balance
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceive} className="p-6 space-y-5">
              {/* Payment Summary Box */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-850 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">From Person / Business:</span>
                  <span className="font-bold text-white">{receivingRecord.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Receivable Amount:</span>
                  <span className="font-bold text-base text-emerald-400">
                    ৳{parseFloat(receivingRecord.amount || 0).toLocaleString()}
                  </span>
                </div>
                {receivingRecord.note && (
                  <div className="pt-2 border-t border-slate-850/60 text-[11px] text-slate-400">
                    <span className="text-slate-500">Note: </span>
                    {receivingRecord.note}
                  </div>
                )}
              </div>

              {/* Deposit Into Account Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Deposit Into Cash Balance <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'cash',
                      label: 'Hand Cash',
                      desc: 'Physical Cash',
                      icon: PiggyBank,
                      color: 'text-amber-400',
                    },
                    {
                      id: 'online',
                      label: 'Online Cash',
                      desc: 'bKash / Bank',
                      icon: CreditCard,
                      color: 'text-violet-400',
                    },
                    {
                      id: 'other_cash',
                      label: 'Other Cash',
                      desc: 'Extra Reserve',
                      icon: Wallet,
                      color: 'text-emerald-400',
                    },
                  ].map(acc => {
                    const Icon = acc.icon;
                    const isSelected = receiveForm.receivedAccount === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() =>
                          setReceiveForm(prev => ({ ...prev, receivedAccount: acc.id }))
                        }
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`w-4 h-4 ${acc.color}`} />
                          {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                        </div>
                        <div className="mt-2">
                          <span className="font-bold text-xs block leading-tight">{acc.label}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{acc.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Received */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Date Received <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={receiveForm.receivedDate}
                  onChange={e =>
                    setReceiveForm(prev => ({ ...prev, receivedDate: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Receipt Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Note / Reference (optional)
                </label>
                <input
                  type="text"
                  value={receiveForm.receiptNote}
                  onChange={e => setReceiveForm(prev => ({ ...prev, receiptNote: e.target.value }))}
                  placeholder="e.g. Paid in full via cash / bKash trx id..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Explanatory banner */}
              <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-2.5 text-[11px] text-slate-400">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>
                  Confirming will mark this status as <strong>Received</strong> and add{' '}
                  <strong className="text-emerald-400">
                    ৳{parseFloat(receivingRecord.amount || 0).toLocaleString()}
                  </strong>{' '}
                  to your <strong>{ACCOUNT_LABELS[receiveForm.receivedAccount]?.label}</strong>{' '}
                  balance immediately.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm & Add to Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT RECEIVABLE MODAL --- */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl bg-slate-950">
            <div className="p-5 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  {editingRecord ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingRecord ? 'Edit Receivable' : 'New Receivable Record'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {editingRecord ? 'Update record details' : 'Add money you will receive'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
              {/* Person / Business Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Person / Business Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Rahim Traders or John Doe"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Amount (৳) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.amount}
                  onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="e.g. 15000"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Note / Purpose (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.note}
                  onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="e.g. Wholesale goods refund, loan recovery, etc."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Initial Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Payment Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="Not Received">Not Received (Pending)</option>
                  <option value="Received">Received</option>
                </select>
              </div>

              {/* If marked Received upfront, select account */}
              {form.status === 'Received' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-850">
                  <label className="text-[11px] font-medium text-slate-300 block">
                    Deposit Into Balance
                  </label>
                  <select
                    value={form.receivedAccount}
                    onChange={e => setForm(prev => ({ ...prev, receivedAccount: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="cash">Hand Cash</option>
                    <option value="online">Online Cash</option>
                    <option value="other_cash">Other Cash</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Receivable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
