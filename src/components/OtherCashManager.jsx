import { useMemo, useState } from 'react';
import { X, Search, Filter, PlusCircle, Edit2, Trash2, Calendar, DollarSign, FileText, Coins } from 'lucide-react';
import { toast } from 'react-toastify';
import { sortRecordsByDateDesc } from '../utils/dates';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const defaultForm = {
  date: new Date().toISOString().slice(0, 10),
  month: MONTHS[new Date().getMonth()],
  source: '',
  amount: '',
  description: '',
  type: 'Income', // Income or Expense
};

export default function OtherCashManager({
  otherCashRecords,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterType, setFilterType] = useState('All');

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
      date: rec.date,
      month: rec.month,
      source: rec.source || '',
      amount: rec.amount || '',
      description: rec.description || '',
      type: rec.type || 'Income',
    });
    setEditingId(rec.id);
    setIsOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!form.source || !form.amount) {
      toast.error('Source and Amount are required');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      id: editingId || `oc_${Date.now()}`,
      date: form.date,
      month: form.month,
      source: form.source,
      amount: String(form.amount),
      description: form.description || '',
      type: form.type,
      createdAt: editingId && form.createdAt ? form.createdAt : new Date().toISOString(),
    };

    try {
      if (editingId) {
        await onUpdateRecord(payload);
      } else {
        await onAddRecord(payload);
      }
      setIsOpen(false);
      setForm(defaultForm);
      setEditingId(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this Other Cash record? This cannot be undone.')) return;
    try {
      await onDeleteRecord(id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const sortedRecords = useMemo(
    () => sortRecordsByDateDesc(otherCashRecords || []),
    [otherCashRecords]
  );

  const filteredRecords = useMemo(() => {
    return sortedRecords.filter(r => {
      const matchSearch =
        (r.source?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (r.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchMonth = filterMonth === 'All' || r.month === filterMonth;
      const matchType = filterType === 'All' || r.type === filterType;
      return matchSearch && matchMonth && matchType;
    });
  }, [sortedRecords, searchTerm, filterMonth, filterType]);

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    filteredRecords.forEach(r => {
      const amt = parseFloat(r.amount) || 0;
      if (r.type === 'Income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
      }
    });
    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    };
  }, [filteredRecords]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-500" />
            Other Cash Records
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage auxiliary cash transactions (petty cash, reserves, miscellaneous)
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Other Cash
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Income</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400">৳{summary.totalIncome.toLocaleString()}</span>
        </div>
        <div className="glass-panel border border-rose-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expense</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold text-rose-400">৳{summary.totalExpense.toLocaleString()}</span>
        </div>
        <div className="glass-panel border border-indigo-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Balance</span>
            <Coins className="w-4 h-4 text-indigo-400" />
          </div>
          <span className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ৳{summary.netBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel border border-slate-800 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search source or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option>All</option>
              {MONTHS.map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option>All</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-slate-500 py-8">
                    No other cash records found. Click "Add Other Cash" to create one.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => (
                  <tr key={rec.id}>
                    <td className="font-mono text-xs">{rec.date}</td>
                    <td className="font-semibold text-white">{rec.source}</td>
                    <td>
                      <span className={`badge-pill text-[10px] ${rec.type === 'Income' ? 'badge-emerald' : 'badge-rose'}`}>
                        {rec.type}
                      </span>
                    </td>
                    <td className={`font-bold font-mono ${rec.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ৳{parseFloat(rec.amount || 0).toLocaleString()}
                    </td>
                    <td className="text-slate-400 text-xs">{rec.description || '—'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          title="Delete"
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

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  {editingId ? 'Edit Other Cash Record' : 'Add Other Cash Record'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setForm(defaultForm);
                    setEditingId(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => {
                      const d = new Date(e.target.value);
                      setForm(prev => ({ ...prev, date: e.target.value, month: MONTHS[d.getMonth()] }));
                    }}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Source *
                </label>
                <input
                  type="text"
                  value={form.source}
                  onChange={e => setForm(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="e.g. Petty Cash, Reserve Fund, Miscellaneous"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  Amount * (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional notes or description"
                  rows="3"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98]"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Record' : 'Add Record'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setForm(defaultForm);
                    setEditingId(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
