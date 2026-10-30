import { format } from 'date-fns';
import { Calendar, Edit2, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { generateUniqueId } from '../utils/api';
import { sortRecordsByDateDesc } from '../utils/dates';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SALES_TYPES = ['Regular', 'Parcel', 'Custom Order'];

const normalizePayment = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const ONLINE_KEYWORDS = ['bkash', 'nagad', 'rocket', 'online'];

const CASH_KEYWORDS = ['cash', 'cash on delivery', 'cod'];

const getPaymentBucket = value => {
  const v = normalizePayment(value);

  if (!v) return 'cash'; // fallback: empty = cash

  const isOnline = ONLINE_KEYWORDS.some(k => v.includes(k));
  if (isOnline) return 'online';
  return 'cash';
};

const defaultForm = {
  date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  month: MONTHS[new Date().getMonth()],
  merchantName: '',
  salesAmount: '',
  salesType: 'Regular',
  commissionPercent: '15',
  commissionAmount: '0.00',
  merchantBill: '0.00',
  discountPercent: '',
  discountAmount: '0.00',
  deliveryCharge: '',
  paidByCustomer: '0.00',
  riderName: '',
  riderSalary: '',
  otherExpenseName: '',
  otherExpense: '',
  fixedExpenseName: '',
  fixedExpense: '',
  expenseDescription: '',
  paymentSource: 'cash',
  digitalPaymentMethod: '',
};

export default function SalesManager({
  records,
  payments,
  merchants,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onDeleteAllRecords,
  onAddMerchant,
  editTarget,
  clearEditTarget,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (editTarget) {
      handleOpenEdit(editTarget);
      if (clearEditTarget) clearEditTarget();
    }
  }, [editTarget]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState('');

  const computeDerived = f => {
    const sales = parseFloat(f.salesAmount) || 0;
    const commissionPct = parseFloat(f.commissionPercent) || 0;
    const discountPct = parseFloat(f.discountPercent) || 0;
    const delivery = parseFloat(f.deliveryCharge) || 0;

    const commissionAmount = ((sales * commissionPct) / 100).toFixed(2);
    const discountAmount = ((sales * discountPct) / 100).toFixed(2);
    const merchantBill = (sales - parseFloat(commissionAmount)).toFixed(2);
    const paidByCustomer = (sales + delivery - parseFloat(discountAmount)).toFixed(2);

    return { commissionAmount, discountAmount, merchantBill, paidByCustomer };
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-set month when date changes (datetime-local includes time)
      if (name === 'date' && value) {
        const d = new Date(value);
        updated.month = MONTHS[d.getMonth()] || prev.month;
      }

      if (name === 'digitalPaymentMethod' && value === 'online') {
        updated.paymentSource = '';
      }

      const derived = computeDerived(updated);
      return { ...updated, ...derived };
    });
  };

  const handleOpenNew = () => {
    setForm({
      ...defaultForm,
      date: new Date().toISOString().slice(0, 10),
      month: MONTHS[new Date().getMonth()],
    });
    setEditingId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = rec => {
    setForm({
      ...rec,
      salesAmount: rec.salesAmount || '',
      commissionPercent: rec.commissionPercent || '15',
      discountPercent: rec.discountPercent || '',
      deliveryCharge: rec.deliveryCharge || '',
      riderSalary: rec.riderSalary || '',
      otherExpense: rec.otherExpense || '',
      fixedExpense: rec.fixedExpense || '',
      expenseDescription: rec.expenseDescription || '',
      paymentSource: rec.paymentSource || 'cash',
    });
    setEditingId(rec.id);
    setIsOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (!editingId && form.salesAmount && form.salesAmount !== '' && !form.merchantName) {
      toast.error('Merchant name is required for sales records');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    // Build payload with guaranteed permanent unique ID
    const recordId = editingId || generateUniqueId('rec');
    const payload = {
      id: recordId,
      date: form.date,
      month: form.month,
      merchantName: form.merchantName,
      salesAmount: form.salesAmount ? String(form.salesAmount) : '0',
      salesType: form.salesType,
      commissionPercent: form.commissionPercent,
      commissionAmount: String(form.commissionAmount),
      merchantBill: String(form.merchantBill),
      discountPercent: form.discountPercent,
      discountAmount: String(form.discountAmount),
      deliveryCharge: form.deliveryCharge ? String(form.deliveryCharge) : '0',
      paidByCustomer: String(form.paidByCustomer),
      riderName: form.riderName || '',
      riderSalary: form.riderSalary ? String(form.riderSalary) : '0',
      otherExpenseName: form.otherExpenseName || '',
      otherExpense: form.otherExpense ? String(form.otherExpense) : '0',
      fixedExpenseName: form.fixedExpenseName || '',
      fixedExpense: form.fixedExpense ? String(form.fixedExpense) : '0',
      expenseDescription: form.expenseDescription || '',
      digitalPaymentMethod: form.digitalPaymentMethod || '',
      paymentSource: form.paymentSource !== undefined ? form.paymentSource : 'cash',
    };

    // Preserve createdAt for updates (don't let user change creation timestamp)
    if (editingId && form.createdAt) {
      payload.createdAt = form.createdAt;
    }

    try {
      let success;
      if (editingId) {
        success = await onUpdateRecord(payload);
      } else {
        success = await onAddRecord(payload);
      }
      if (success !== false) {
        setIsOpen(false);
        setForm(defaultForm);
        setEditingId(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save sales record');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };
  const handleAddNewMerchant = () => {
    const name = newMerchant.trim();
    if (name) {
      onAddMerchant(name);
      setForm(prev => ({ ...prev, merchantName: name }));
      setNewMerchant('');
      setShowAddMerchant(false);
    }
  };

  const visibleRecords = useMemo(() => {
    const seen = new Set();
    const unique = [];
    for (const r of records || []) {
      if (!r) continue;
      const idKey = r.id !== undefined && r.id !== null ? String(r.id).trim() : '';
      if (idKey && seen.has(idKey)) continue;
      if (idKey) seen.add(idKey);
      if ((parseFloat(r.salesAmount) || 0) > 0 || (parseFloat(r.deliveryCharge) || 0) > 0) {
        unique.push(r);
      }
    }
    return sortRecordsByDateDesc(unique);
  }, [records]);

  // Filter & Search computation
  const filteredRecords = useMemo(() => {
    return visibleRecords.filter(r => {
      const matchSearch =
        r.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.salesType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMonth = filterMonth === 'All' || r.month === filterMonth;
      const matchType = filterType === 'All' || r.salesType === filterType;

      return matchSearch && matchMonth && matchType;
    });
  }, [visibleRecords, searchTerm, filterMonth, filterType]);

  const handleDeleteAll = async () => {
    const totalRecords = records.filter(
      r => (parseFloat(r.salesAmount) || 0) > 0 || (parseFloat(r.deliveryCharge) || 0) > 0
    ).length;
    if (!totalRecords) return;
    const confirmed = window.confirm(
      `Delete ALL ${totalRecords} sales ${totalRecords === 1 ? 'record' : 'records'} permanently? This cannot be undone.`
    );
    if (!confirmed) return;
    await onDeleteAllRecords();
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">Sales Records</h1>
            <span className="badge-pill badge-indigo">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, input, or export financial sales transactions with live ledger balance sync
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showFilters
                ? 'bg-slate-800/80 border-indigo-500/40 text-white shadow-md shadow-indigo-950/20'
                : 'glass-panel border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            Filters
          </button>

          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete All
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {(showFilters || searchTerm) && (
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-4.5 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant or rider..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Month
            </span>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all cursor-pointer"
            >
              <option value="All">All Months</option>
              {MONTHS.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Type
            </span>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all cursor-pointer"
            >
              <option value="All">All Types</option>
              {SALES_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Sales Amt</th>
                <th>Com. Amt</th>
                <th>Bill Amount</th>
                <th>Discount</th>
                <th>Delivery</th>
                <th>Payment Method</th>
                <th>Paid by Cust</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-10 text-center text-slate-500 font-medium">
                    No transactions found matching the parameters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => {
                  const isRecTransfer =
                    r.salesType === 'Hand Cash to Online Transfer' ||
                    r.salesType === 'Online to Hand Cash Transfer';
                  const isCash =
                    !r.digitalPaymentMethod || r.digitalPaymentMethod.toLowerCase() === 'cash';
                  return (
                    <tr key={r.id} className="text-slate-300">
                      <td className="font-medium text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400/70" />
                          {new Date(r.date).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="font-bold text-white">
                        {isRecTransfer ? (
                          <span className="badge-pill badge-rose">{r.salesType}</span>
                        ) : (
                          r.merchantName || '—'
                        )}
                      </td>
                      <td className="font-bold text-emerald-400">
                        ৳{Number(r.salesAmount || 0).toLocaleString()}
                      </td>
                      <td className="text-slate-300">
                        {isRecTransfer ? (
                          '—'
                        ) : (
                          <>
                            <span className="font-semibold text-slate-200">
                              ৳{Number(r.commissionAmount || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-1 font-mono">
                              ({r.commissionPercent}%)
                            </span>
                          </>
                        )}
                      </td>
                      <td className="font-bold text-indigo-400">
                        {isRecTransfer ? '—' : `৳${Number(r.merchantBill || 0).toLocaleString()}`}
                      </td>
                      <td className="text-slate-300">
                        {isRecTransfer || !r.discountPercent ? (
                          '—'
                        ) : (
                          <>
                            ৳{Number(r.discountAmount || 0).toLocaleString()}
                            <span className="text-[10px] text-slate-500 ml-1 font-mono">
                              ({r.discountPercent}%)
                            </span>
                          </>
                        )}
                      </td>
                      <td className="text-slate-300 font-medium">
                        {isRecTransfer || !r.deliveryCharge
                          ? '—'
                          : `৳${Number(r.deliveryCharge).toLocaleString()}`}
                      </td>

                      <td>
                        {isRecTransfer ? (
                          '—'
                        ) : isCash ? (
                          <span className="badge-pill badge-emerald">Cash</span>
                        ) : (
                          <span className="badge-pill badge-indigo">{r.digitalPaymentMethod}</span>
                        )}
                      </td>
                      <td className="font-bold">
                        {isRecTransfer ? '—' : `৳${Number(r.paidByCustomer || 0).toLocaleString()}`}
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            title="Edit Row"
                            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (!r?.id) {
                                toast.error('Cannot delete: Record ID is missing');
                                return;
                              }
                              if (window.confirm('Delete this sales record from the database?')) {
                                onDeleteRecord(r.id);
                              }
                            }}
                            title="Delete Row"
                            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Overlay for Side Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-lg bg-[#0a0f1d] border-l border-slate-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-900 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {editingId ? 'Modify Sales Record' : 'Create Sales Record'}
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Input transactional fields with auto calculations
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-950 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form
              id="sales-record-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-5 space-y-5"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}
            >
              {/* ── SECTION 1: Date & Merchant ── */}
              <div className="rounded-2xl border border-indigo-500/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-4 space-y-4 shadow-lg shadow-indigo-950/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                    1
                  </span>
                  <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    Date &amp; Merchant
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-400 transition-colors">
                      Date &amp; Time
                    </label>
                    <DatePicker
                      selected={form.date ? new Date(form.date) : null}
                      onChange={date => {
                        if (date) {
                          handleChange({
                            target: { name: 'date', value: format(date, "yyyy-MM-dd'T'HH:mm") },
                          });
                        }
                      }}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="MMM d, yyyy h:mm aa"
                      className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200"
                      wrapperClassName="w-full"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-400 transition-colors">
                      Cycle Month
                    </label>
                    <select
                      name="month"
                      value={form.month}
                      onChange={handleChange}
                      className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
                    >
                      {MONTHS.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-400 transition-colors">
                    Merchant Name
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="merchantName"
                      value={form.merchantName}
                      onChange={handleChange}
                      className="flex-1 bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="">Select a merchant…</option>
                      {merchants.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddMerchant(!showAddMerchant)}
                      title="Add new merchant"
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-lg font-bold transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  {showAddMerchant && (
                    <div className="flex gap-2 mt-2 p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
                      <input
                        type="text"
                        placeholder="New merchant name…"
                        value={newMerchant}
                        onChange={e => setNewMerchant(e.target.value)}
                        className="flex-1 bg-slate-950/80 border border-slate-700/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewMerchant}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── SECTION 2: Sales Core ── */}
              <div className="rounded-2xl border border-violet-500/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-4 space-y-4 shadow-lg shadow-violet-950/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                    2
                  </span>
                  <h3 className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    Sales Transaction Core
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
                      Sales Amount (৳)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">
                        ৳
                      </span>
                      <input
                        type="number"
                        name="salesAmount"
                        value={form.salesAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white outline-none transition-all duration-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
                      Sales Type
                    </label>
                    <select
                      name="salesType"
                      value={form.salesType}
                      onChange={handleChange}
                      className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
                    >
                      {SALES_TYPES.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="group">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
                      Com. %
                    </label>
                    <select
                      name="commissionPercent"
                      value={form.commissionPercent}
                      onChange={handleChange}
                      className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="15">15%</option>
                      <option value="10">10%</option>
                      <option value="5">5%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
                      Com. Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={`৳${form.commissionAmount}`}
                        className="w-full bg-slate-900/60 border border-slate-800/80 text-slate-500 rounded-xl px-3 py-2.5 text-xs font-mono select-none cursor-not-allowed"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-700 font-bold tracking-wider">
                        AUTO
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
                      Merchant Bill
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={`৳${form.merchantBill}`}
                        className="w-full bg-slate-900/60 border border-slate-800/80 text-slate-500 rounded-xl px-3 py-2.5 text-xs font-mono select-none cursor-not-allowed"
                        title="Sales - Commission"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-700 font-bold tracking-wider">
                        AUTO
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="group">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
                      Disc. %
                    </label>
                    <input
                      type="number"
                      name="discountPercent"
                      value={form.discountPercent}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
                      Disc. Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={`৳${form.discountAmount}`}
                        className="w-full bg-slate-900/60 border border-slate-800/80 text-slate-500 rounded-xl px-3 py-2.5 text-xs font-mono select-none cursor-not-allowed"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-700 font-bold tracking-wider">
                        AUTO
                      </span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
                      Delivery Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">
                        ৳
                      </span>
                      <input
                        type="number"
                        name="deliveryCharge"
                        value={form.deliveryCharge}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white outline-none transition-all duration-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: Payment ── */}
              <div className="rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-4 space-y-4 shadow-lg shadow-emerald-950/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    3
                  </span>
                  <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    Payment Method
                  </h3>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-emerald-400 transition-colors">
                    Customer Payment Method
                  </label>
                  <select
                    name="digitalPaymentMethod"
                    value={form.digitalPaymentMethod}
                    onChange={handleChange}
                    className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
                  >
                    <option value="">Cash / Physical Collection</option>
                    <optgroup label="── Online Payment Methods ──">
                      <option value="online">Online Payment (No Cash Deduction)</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                    </optgroup>
                  </select>
                </div>

                {['bkash', 'nagad', 'rocket'].includes(
                  String(form.digitalPaymentMethod || '').toLowerCase()
                ) && (
                  <div className="group">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-emerald-400 transition-colors">
                      Order Funded By
                      <span className="ml-1.5 text-slate-600 normal-case font-normal text-[9px]">
                        (where was the purchase money from?)
                      </span>
                    </label>
                    <select
                      name="paymentSource"
                      value={form.paymentSource || 'cash'}
                      onChange={handleChange}
                      className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="cash">Hand Cash (order bought using physical cash)</option>
                      <option value="online">
                        Online Balance (order bought using online funds)
                      </option>
                      <option value="other_cash">Other Cash (loan / asset sale etc.)</option>
                    </select>
                  </div>
                )}

                {/* Live accounting effect badges */}
                {form.digitalPaymentMethod &&
                  (() => {
                    const method = String(form.digitalPaymentMethod || '').toLowerCase();
                    const isOnlineMethod = ['bkash', 'nagad', 'rocket'].includes(method);
                    const source = form.paymentSource || 'cash';
                    if (method === 'online')
                      return (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          Online Balance INCREASES by ৳{form.paidByCustomer || 0} (No purchase cost
                          deduction)
                        </div>
                      );
                    if (isOnlineMethod && source === 'cash')
                      return (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                            Hand Cash DECREASES by ৳{form.salesAmount || 0} (purchase cost)
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            Online Balance INCREASES by ৳{form.paidByCustomer || 0} (customer paid)
                          </div>
                        </div>
                      );
                    if (isOnlineMethod && source === 'online')
                      return (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          Online Balance: ৳{form.paidByCustomer || 0} added, ৳
                          {form.salesAmount || 0} deducted
                        </div>
                      );
                    return (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Hand Cash: ৳{form.paidByCustomer || 0} added, ৳{form.salesAmount || 0}{' '}
                        deducted
                      </div>
                    );
                  })()}

                {/* Grand Total Card */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/50 to-slate-950/80 p-4 flex items-center justify-between shadow-lg">
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 60%)',
                    }}
                  />
                  <div className="relative">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                      Customer Grand Total
                    </p>
                    <p className="text-[9px] text-slate-600 mt-0.5">Sales + Delivery − Discount</p>
                  </div>
                  <span className="relative text-xl font-black text-emerald-400 tabular-nums tracking-tight">
                    ৳{form.paidByCustomer}
                  </span>
                </div>
              </div>
            </form>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Panel
              </button>

              <button
                type="submit"
                form="sales-record-form"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Record...</span>
                  </>
                ) : editingId ? (
                  'Save Modifications'
                ) : (
                  'Commit Record'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
