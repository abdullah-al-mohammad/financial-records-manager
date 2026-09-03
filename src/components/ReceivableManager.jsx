import {
  ArrowDownLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  Edit2,
  HandCoins,
  Info,
  Layers,
  PiggyBank,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDisplayDate, toDateKey } from '../utils/dates';

const ACCOUNT_LABELS = {
  cash: { label: 'Hand Cash', icon: PiggyBank, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  online: { label: 'Online Cash', icon: CreditCard, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  other_cash: { label: 'Other Cash', icon: Wallet, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

export default function ReceivableManager({
  receivables = [],
  onAddReceivable,
  onUpdateReceivable,
  onDeleteReceivable,
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
        const acc = String(r.receivedAccount || 'cash').toLowerCase().trim();
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
          const acc = String(r.receivedAccount || 'cash').toLowerCase().trim();
          if (acc !== accountFilter) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = String(r.name || '').toLowerCase().includes(q);
          const noteMatch = String(r.note || '').toLowerCase().includes(q);
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
      date: record.date ? toDateKey(record.date) || record.date : new Date().toISOString().slice(0, 10),
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
          receivedDate: form.status === 'Received' ? (editingRecord.receivedDate || form.date) : null,
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

  return (
    <div className="space-y-6">
      {/* Header & Section Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Receivables &amp; Payables
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
              Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track money you will receive from people or businesses and deposit directly into cash balances
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/15 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Receivable
        </button>
      </div>

      {/* Sub-tab Navigation (Receivable vs Payable) */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('receivable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'receivable'
              ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>1. Receivables (Money I Will Receive)</span>
          {stats.pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              {stats.pendingCount} Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'payable'
              ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-rose-400" />
          <span>2. Payables (Money I Will Pay)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
            Next
          </span>
        </button>
      </div>

      {/* If Payable Tab is clicked: show polite placeholder with next step preview */}
      {activeTab === 'payable' ? (
        <div className="glass-panel border border-slate-900 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <Coins className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">Payable Management (Money I Will Pay)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This companion section will allow you to track debts and money you owe to suppliers or individuals.
              Currently focused on <span className="text-emerald-400 font-semibold">Receivable Management</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('receivable')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow cursor-pointer"
          >
            Switch to Receivables
          </button>
        </div>
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
          <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <HandCoins className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">No receivable records found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all' || accountFilter !== 'all'
                    ? 'Try adjusting your search or filter settings.'
                    : 'Start by adding a person or business from whom you expect to receive money.'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Receivable
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4 whitespace-nowrap">Person / Business Name</th>
                      <th className="p-4 whitespace-nowrap">Amount</th>
                      <th className="p-4 whitespace-nowrap">Date</th>
                      <th className="p-4 whitespace-nowrap">Note</th>
                      <th className="p-4 whitespace-nowrap">Payment Status</th>
                      <th className="p-4 whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40">
                    {filteredRecords.map(rec => {
                      const isReceived = rec.status === 'Received';
                      const accConfig = ACCOUNT_LABELS[rec.receivedAccount || 'cash'] || ACCOUNT_LABELS.cash;
                      const AccIcon = accConfig.icon;

                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-slate-900/30 transition-all text-slate-300 group"
                        >
                          {/* Person / Business Name */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:border-slate-700">
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
                          <td className="p-4 whitespace-nowrap font-bold text-sm">
                            <span className={isReceived ? 'text-emerald-400' : 'text-amber-400'}>
                              ৳{parseFloat(rec.amount || 0).toLocaleString()}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-4 whitespace-nowrap text-slate-400">
                            {formatDisplayDate(rec.date)}
                          </td>

                          {/* Note */}
                          <td className="p-4 max-w-xs truncate text-slate-400">
                            {rec.note || <span className="text-slate-600">—</span>}
                          </td>

                          {/* Payment Status */}
                          <td className="p-4 whitespace-nowrap">
                            {isReceived ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Received</span>
                                <span className="text-[10px] text-emerald-500 font-normal">
                                  ({accConfig.label})
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
                                <Clock className="w-3.5 h-3.5 animate-pulse" />
                                <span>Not Received</span>
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Receive Button (Only if Not Received) */}
                              {!isReceived ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReceive(rec)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                                  title="Receive money and deposit to cash balance"
                                >
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                  <span>Receive</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRevertStatus(rec)}
                                  className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-400 hover:bg-amber-500/5 transition-all cursor-pointer"
                                  title="Revert status to Not Received"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(rec)}
                                className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all cursor-pointer"
                                title="Edit record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDelete(rec)}
                                className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
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
                    { id: 'cash', label: 'Hand Cash', desc: 'Physical Cash', icon: PiggyBank, color: 'text-amber-400' },
                    { id: 'online', label: 'Online Cash', desc: 'bKash / Bank', icon: CreditCard, color: 'text-violet-400' },
                    { id: 'other_cash', label: 'Other Cash', desc: 'Extra Reserve', icon: Wallet, color: 'text-emerald-400' },
                  ].map(acc => {
                    const Icon = acc.icon;
                    const isSelected = receiveForm.receivedAccount === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setReceiveForm(prev => ({ ...prev, receivedAccount: acc.id }))}
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
                  onChange={e => setReceiveForm(prev => ({ ...prev, receivedDate: e.target.value }))}
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
                  <strong className="text-emerald-400">৳{parseFloat(receivingRecord.amount || 0).toLocaleString()}</strong> to your{' '}
                  <strong>{ACCOUNT_LABELS[receiveForm.receivedAccount]?.label}</strong> balance immediately.
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
