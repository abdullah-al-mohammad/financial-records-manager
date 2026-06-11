import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  X,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  Printer
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SALES_TYPES = ['Regular', 'Parcel', 'Custom Order'];

const defaultForm = {
  date: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
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
  otherCashSource: '',
  otherCashAmount: '',
  riderName: '',
  riderSalary: '',
  otherExpenseName: '',
  otherExpense: '',
  fixedExpenseName: '',
  fixedExpense: '',
};

export default function SalesManager({ 
  records, 
  merchants, 
  onAddRecord, 
  onUpdateRecord, 
  onDeleteRecord, 
  onAddMerchant, 
  editTarget, 
  clearEditTarget 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editTarget) {
      handleOpenEdit(editTarget);
      if (clearEditTarget) clearEditTarget();
    }
  }, [editTarget]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  // New merchant creation inline
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState('');

  // Auto-derived calculations helper
  const computeDerived = (f) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-set month when date changes (datetime-local includes time)
      if (name === 'date' && value) {
        const d = new Date(value);
        updated.month = MONTHS[d.getMonth()] || prev.month;
      }
      
      const derived = computeDerived(updated);
      return { ...updated, ...derived };
    });
  };

  // Open drawer for creating a new record
  const handleOpenNew = () => {
    setForm({
      ...defaultForm,
      date: new Date().toISOString().slice(0, 10),
      month: MONTHS[new Date().getMonth()]
    });
    setEditingId(null);
    setIsOpen(true);
  };

  // Open drawer for editing a record
  const handleOpenEdit = (rec) => {
    setForm({
      ...rec,
      salesAmount: rec.salesAmount || '',
      commissionPercent: rec.commissionPercent || '15',
      discountPercent: rec.discountPercent || '',
      deliveryCharge: rec.deliveryCharge || '',
      otherCashAmount: rec.otherCashAmount || '',
      riderSalary: rec.riderSalary || '',
      otherExpense: rec.otherExpense || '',
      fixedExpense: rec.fixedExpense || '',
    });
    setEditingId(rec.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return; // prevent double submission
  setIsSubmitting(true);
  if (!form.merchantName) {
    alert('Merchant name is required');
    setIsSubmitting(false);
    return;
  }

  const payload = {
    ...form,
    id: editingId || String(Date.now()),
    salesAmount: form.salesAmount ? String(form.salesAmount) : '0',
    commissionAmount: String(form.commissionAmount),
    merchantBill: String(form.merchantBill),
    discountAmount: String(form.discountAmount),
    paidByCustomer: String(form.paidByCustomer),
    deliveryCharge: form.deliveryCharge ? String(form.deliveryCharge) : '0',
    otherCashAmount: form.otherCashAmount ? String(form.otherCashAmount) : '0',
    riderSalary: form.riderSalary ? String(form.riderSalary) : '0',
    otherExpense: form.otherExpense ? String(form.otherExpense) : '0',
    fixedExpense: form.fixedExpense ? String(form.fixedExpense) : '0',
  };

  try {
    if (editingId) {
      await onUpdateRecord(payload);
    } else {
      await onAddRecord(payload);
    }
  } finally {
    setIsOpen(false);
    setForm(defaultForm);
    setEditingId(null);
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

  // Filter & Search computation
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.riderName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMonth = filterMonth === 'All' || r.month === filterMonth;
      const matchType = filterType === 'All' || r.salesType === filterType;
      
      return matchSearch && matchMonth && matchType;
    });
  }, [records, searchTerm, filterMonth, filterType]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No data available to export');
      return;
    }

    const headers = [
      'Date', 'Month', 'Merchant', 'Sales Amount', 'Type', 
      'Commission %', 'Commission Amt', 'Merchant Bill', 
      'Discount %', 'Discount Amt', 'Delivery', 'Paid by Cust', 
      'Other Cash Src', 'Other Cash Amt', 'Rider Name', 'Rider Salary',
      'Other Exp Name', 'Other Expense', 'Fixed Exp Name', 'Fixed Expense'
    ];

    const rows = filteredRecords.map(r => [
      r.date, r.month, r.merchantName, r.salesAmount, r.salesType,
      r.commissionPercent, r.commissionAmount, r.merchantBill,
      r.discountPercent, r.discountAmount, r.deliveryCharge, r.paidByCustomer,
      r.otherCashSource, r.otherCashAmount, r.riderName, r.riderSalary,
      r.otherExpenseName, r.otherExpense, r.fixedExpenseName, r.fixedExpense
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Sales Records</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, input, or export financial transactions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showFilters 
                ? 'bg-slate-900 border-slate-700 text-white' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export CSV
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {(showFilters || searchTerm) && (
        <div className="glass-panel border border-slate-900 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search merchant or rider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Month</span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="All">All Months</option>
              {MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="All">All Types</option>
              {SALES_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-900 text-slate-400 font-bold">
                <th className="p-4 whitespace-nowrap">Date</th>
                <th className="p-4 whitespace-nowrap">Merchant</th>
                <th className="p-4 whitespace-nowrap">Sales Amt</th>
                <th className="p-4 whitespace-nowrap">Com. Amt</th>
                <th className="p-4 whitespace-nowrap">Bill Amount</th>
                <th className="p-4 whitespace-nowrap">Discount</th>
                <th className="p-4 whitespace-nowrap">Delivery</th>
                <th className="p-4 whitespace-nowrap">Paid by Cust</th>
                <th className="p-4 whitespace-nowrap">Rider Wage</th>
                <th className="p-4 whitespace-nowrap">Other Exp</th>
                <th className="p-4 whitespace-nowrap">Fixed Exp</th>
                <th className="p-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="12" className="p-8 text-center text-slate-500 font-medium">
                    No transactions found matching the parameters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/20 transition-all text-slate-300">
                    <td className="p-4 whitespace-nowrap font-medium text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                         {new Date(r.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap font-bold text-white">{r.merchantName || '—'}</td>
                    <td className="p-4 whitespace-nowrap font-semibold text-emerald-400">
                      ৳{Number(r.salesAmount || 0).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-400">
                      ৳{Number(r.commissionAmount || 0).toLocaleString()} 
                      <span className="text-[10px] text-slate-600 ml-1">({r.commissionPercent}%)</span>
                    </td>
                    <td className="p-4 whitespace-nowrap font-semibold text-indigo-400">
                      ৳{Number(r.merchantBill || 0).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-400">
                      {r.discountPercent ? (
                        <>
                          ৳{Number(r.discountAmount || 0).toLocaleString()}
                          <span className="text-[10px] text-slate-600 ml-1">({r.discountPercent}%)</span>
                        </>
                      ) : '—'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-400">
                      {r.deliveryCharge ? `৳${Number(r.deliveryCharge).toLocaleString()}` : '—'}
                    </td>
                    <td className="p-4 whitespace-nowrap font-bold text-slate-200">
                      ৳{Number(r.paidByCustomer || 0).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap text-rose-400/90">
                      {r.riderSalary ? (
                        <div>
                          <span>৳{Number(r.riderSalary).toLocaleString()}</span>
                          {r.riderName && <span className="text-[10px] text-slate-500 block truncate max-w-[80px]">{r.riderName}</span>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-rose-400/90">
                      {r.otherExpense ? (
                        <div>
                          <span>৳{Number(r.otherExpense).toLocaleString()}</span>
                          {r.otherExpenseName && <span className="text-[10px] text-slate-500 block truncate max-w-[80px]">{r.otherExpenseName}</span>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-rose-400/90 font-medium">
                      {r.fixedExpense ? (
                        <div>
                          <span>৳{Number(r.fixedExpense).toLocaleString()}</span>
                          {r.fixedExpenseName && <span className="text-[10px] text-slate-500 block truncate max-w-[80px]">{r.fixedExpenseName}</span>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          title="Edit Row"
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this sales record from the database?')) {
                              onDeleteRecord(r.id);
                            }
                          }}
                          title="Delete Row"
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* DATE & MERCHANT SECTION */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                  1. Date &amp; Merchant details
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Date</label>
                    <input
                      type="datetime-local"
                      required
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Active Cycle Month</label>
                    <select
                      name="month"
                      value={form.month}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {MONTHS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 block">Merchant Name</label>
                  <div className="flex gap-2">
                    <select
                      name="merchantName"
                      required
                      value={form.merchantName}
                      onChange={handleChange}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="">Select a merchant</option>
                      {merchants.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddMerchant(!showAddMerchant)}
                      className="px-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {showAddMerchant && (
                    <div className="flex gap-2 p-3 bg-slate-950/60 border border-slate-900 rounded-xl mt-2">
                      <input
                        type="text"
                        placeholder="Enter merchant title..."
                        value={newMerchant}
                        onChange={(e) => setNewMerchant(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewMerchant}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SALES METRICS SECTION */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                  2. Sales Transaction core
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Sales Amount (৳)</label>
                    <input
                      type="number"
                      required
                      name="salesAmount"
                      value={form.salesAmount}
                      onChange={handleChange}
                      placeholder="e.g. 5000"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Sales Type</label>
                    <select
                      name="salesType"
                      value={form.salesType}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {SALES_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Com. Percent</label>
                    <select
                      name="commissionPercent"
                      value={form.commissionPercent}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="15">15%</option>
                      <option value="10">10%</option>
                      <option value="5">5%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Com. Amount</label>
                    <input
                      type="text"
                      readOnly
                      value={`৳${form.commissionAmount}`}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-xl px-3 py-2 text-xs select-none cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Merchant Bill</label>
                    <input
                      type="text"
                      readOnly
                      value={`৳${form.merchantBill}`}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-xl px-3 py-2 text-xs select-none cursor-not-allowed"
                      title="Sales - Commission"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Discount Pct</label>
                    <input
                      type="number"
                      name="discountPercent"
                      value={form.discountPercent}
                      onChange={handleChange}
                      placeholder="e.g. 5"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Discount Amt</label>
                    <input
                      type="text"
                      readOnly
                      value={`৳${form.discountAmount}`}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-xl px-3 py-2 text-xs select-none cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Delivery Fee</label>
                    <input
                      type="number"
                      name="deliveryCharge"
                      value={form.deliveryCharge}
                      onChange={handleChange}
                      placeholder="e.g. 150"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    Customer Grand Total:
                    <span className="text-[10px] text-slate-600 block">(Sales + Delivery - Discount)</span>
                  </span>
                  <span className="text-sm font-bold text-emerald-400">৳{form.paidByCustomer}</span>
                </div>
              </div>

              {/* CASH FLOWS SECTION */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                  3. Supplementary Cash Sources
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Other Cash Company</label>
                    <input
                      type="text"
                      name="otherCashSource"
                      value={form.otherCashSource}
                      onChange={handleChange}
                      placeholder="e.g. Foodpanda"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Other Cash Amount (৳)</label>
                    <input
                      type="number"
                      name="otherCashAmount"
                      value={form.otherCashAmount}
                      onChange={handleChange}
                      placeholder="e.g. 2000"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* OVERHEAD EXPENSES SECTION */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                  4. Overhead Expenses
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Rider Name</label>
                    <input
                      type="text"
                      name="riderName"
                      value={form.riderName}
                      onChange={handleChange}
                      placeholder="e.g. Fahim"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Rider Wages (৳)</label>
                    <input
                      type="number"
                      name="riderSalary"
                      value={form.riderSalary}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Variable Expense Details</label>
                    <input
                      type="text"
                      name="otherExpenseName"
                      value={form.otherExpenseName}
                      onChange={handleChange}
                      placeholder="e.g. Fuel / Icepacks"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Variable Expense (৳)</label>
                    <input
                      type="number"
                      name="otherExpense"
                      value={form.otherExpense}
                      onChange={handleChange}
                      placeholder="e.g. 350"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Fixed Expense Type</label>
                    <input
                      type="text"
                      name="fixedExpenseName"
                      value={form.fixedExpenseName}
                      onChange={handleChange}
                      placeholder="e.g. Internet / Rent"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Fixed Expense (৳)</label>
                    <input
                      type="number"
                      name="fixedExpense"
                      value={form.fixedExpense}
                      onChange={handleChange}
                      placeholder="e.g. 1200"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
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
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (editingId ? 'Save Modifications' : 'Commit Record')}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
