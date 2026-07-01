import {
  AlertOctagon,
  Calendar,
  DollarSign,
  Edit2,
  Plus,
  Search,
  Settings,
  Trash2,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { getMonthFromDate } from '../utils/dates';
import { computeNetCashBalance, sumExpensesFromRecords } from '../utils/finance';
import OverheadExpenses from './OverheadExpenses';

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

const emptyExpenseForm = () => ({
  date: new Date().toISOString().slice(0, 16),
  month: MONTHS[new Date().getMonth()],
  merchantName: '',
  riderName: '',
  riderSalary: '',
  otherExpenseName: '',
  otherExpense: '',
  fixedExpenseName: '',
  fixedExpense: '',
  expenseDescription: '',
  paymentSource: 'cash',
});

const hasAnyExpense = form =>
  (parseFloat(form.riderSalary) || 0) > 0 ||
  (parseFloat(form.otherExpense) || 0) > 0 ||
  (parseFloat(form.fixedExpense) || 0) > 0;

const buildExpensePayload = (form, editingId, existingRecord = null) => ({
  ...(existingRecord || {}),
  id: editingId || String(Date.now()),
  date: form.date,
  month: form.month,
  merchantName: form.merchantName || '',
  salesAmount: existingRecord?.salesAmount ?? '0',
  salesType: existingRecord?.salesType || 'Regular',
  commissionPercent: existingRecord?.commissionPercent || '0',
  commissionAmount: existingRecord?.commissionAmount || '0',
  merchantBill: existingRecord?.merchantBill || '0',
  discountPercent: existingRecord?.discountPercent || '',
  discountAmount: existingRecord?.discountAmount || '0',
  deliveryCharge: existingRecord?.deliveryCharge || '0',
  paidByCustomer: existingRecord?.paidByCustomer || '0',
  otherCashSource: existingRecord?.otherCashSource || '',
  otherCashAmount: existingRecord?.otherCashAmount || '0',
  digitalPaymentMethod: existingRecord?.digitalPaymentMethod || '',
  paymentSource: form.paymentSource || 'cash',
  riderName: form.riderName,
  riderSalary: form.riderSalary ? String(form.riderSalary) : '0',
  otherExpenseName: form.otherExpenseName,
  otherExpense: form.otherExpense ? String(form.otherExpense) : '0',
  fixedExpenseName: form.fixedExpenseName,
  fixedExpense: form.fixedExpense ? String(form.fixedExpense) : '0',
  expenseDescription: form.expenseDescription,
});

export default function ExpenseManager({
  records,
  payments,
  merchants,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onAddMerchant,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyExpenseForm());
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState('');

  const cashBalance = useMemo(() => computeNetCashBalance(records, payments), [records, payments]);
  const stats = useMemo(() => sumExpensesFromRecords(records), [records]);

  const itemizedExpenses = useMemo(() => {
    const list = [];

    records.forEach(r => {
      const rs = parseFloat(r.riderSalary) || 0;
      const oe = parseFloat(r.otherExpense) || 0;
      const fe = parseFloat(r.fixedExpense) || 0;

      if (rs > 0) {
        list.push({
          id: `${r.id}_rider`,
          date: r.date,
          month: r.month,
          merchantName: r.merchantName,
          category: 'Rider Wages',
          name: r.riderName ? `Rider Wages: ${r.riderName}` : 'Rider Wages',
          amount: rs,
          originalRecord: r,
          field: 'rider',
        });
      }

      if (oe > 0) {
        list.push({
          id: `${r.id}_other`,
          date: r.date,
          month: r.month,
          merchantName: r.merchantName,
          category: 'Variable Overhead',
          name: r.otherExpenseName || r.expenseDescription || 'Variable Expense',
          amount: oe,
          originalRecord: r,
          field: 'other',
        });
      }

      if (fe > 0) {
        list.push({
          id: `${r.id}_fixed`,
          date: r.date,
          month: r.month,
          merchantName: r.merchantName,
          category: 'Fixed Cost',
          name: r.fixedExpenseName || 'Fixed Cost',
          amount: fe,
          originalRecord: r,
          field: 'fixed',
        });
      }
    });

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records]);

  const filteredItems = useMemo(() => {
    return itemizedExpenses.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.merchantName && item.merchantName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = filterCategory === 'All' || item.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [itemizedExpenses, searchTerm, filterCategory]);

  const maxBarVal = Math.max(stats.riders, stats.fixed, stats.variable, 100);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'date' && value) {
        updated.month = getMonthFromDate(value) || prev.month;
      }
      return updated;
    });
  };

  const handleOpenNew = () => {
    setForm(emptyExpenseForm());
    setEditingRecord(null);
    setIsOpen(true);
  };

  const handleOpenEdit = record => {
    setForm({
      date: record.date || new Date().toISOString().slice(0, 16),
      month: record.month || getMonthFromDate(record.date) || MONTHS[new Date().getMonth()],
      merchantName: record.merchantName || '',
      riderName: record.riderName || '',
      riderSalary: record.riderSalary || '',
      otherExpenseName: record.otherExpenseName || '',
      otherExpense: record.otherExpense || '',
      fixedExpenseName: record.fixedExpenseName || '',
      fixedExpense: record.fixedExpense || '',
      expenseDescription: record.expenseDescription || '',
      paymentSource: record.paymentSource || 'cash',
    });
    setEditingRecord(record);
    setIsOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!hasAnyExpense(form)) {
      alert('Enter at least one expense amount (rider wage, variable, or fixed).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildExpensePayload(form, editingRecord?.id, editingRecord);
      if (editingRecord?.id) {
        await onUpdateRecord(payload);
      } else {
        await onAddRecord(payload);
      }
      setIsOpen(false);
      setForm(emptyExpenseForm());
      setEditingRecord(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async item => {
    const record = item.originalRecord;
    const hasSales = (parseFloat(record.salesAmount) || 0) > 0;

    if (!hasSales) {
      if (window.confirm('Delete this expense entry permanently?')) {
        await onDeleteRecord(record.id);
      }
      return;
    }

    if (!window.confirm('Remove this expense line from the linked sales record?')) return;

    const updated = { ...record };
    if (item.field === 'rider') {
      updated.riderName = '';
      updated.riderSalary = '0';
    } else if (item.field === 'other') {
      updated.otherExpenseName = '';
      updated.otherExpense = '0';
    } else if (item.field === 'fixed') {
      updated.fixedExpenseName = '';
      updated.fixedExpense = '0';
    }

    await onUpdateRecord(updated);
  };

  const handleAddNewMerchant = () => {
    const name = newMerchant.trim();
    if (name && onAddMerchant) {
      onAddMerchant(name);
      setForm(prev => ({ ...prev, merchantName: name }));
      setNewMerchant('');
      setShowAddMerchant(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Expense Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Record operational costs separately and track remaining cash balance
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Expense
        </button>
      </div>

      {/* Cash balance summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel border border-slate-900 rounded-2xl p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Online Balance
          </span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            ৳{cashBalance.onlineBalance.toLocaleString()}
          </p>
        </div>
        <div className="glass-panel border border-slate-900 rounded-2xl p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Expenses
          </span>
          <p className="text-2xl font-bold text-rose-400 mt-2">
            ৳{cashBalance.expenses.total.toLocaleString()}
          </p>
        </div>
        <div className="glass-panel border border-slate-900 rounded-2xl p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Cash in Hand
          </span>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            ৳{cashBalance.cashBalance.toLocaleString()}
          </p>
        </div>
        <div className="glass-panel border border-amber-500/20 rounded-2xl p-5 bg-amber-500/5">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Net Cash Remaining
          </span>
          <p
            className={`text-2xl font-bold mt-2 ${cashBalance.netRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
          >
            ৳{cashBalance.netRemaining.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Cash in hand after expenses and merchant payouts
          </p>
        </div>
      </div>

      {/* Expense category metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Operational Costs',
            value: `৳${stats.total.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
          },
          {
            title: 'Courier Wages',
            value: `৳${stats.riders.toLocaleString()}`,
            icon: UserCheck,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
          },
          {
            title: 'Fixed Costs',
            value: `৳${stats.fixed.toLocaleString()}`,
            icon: Settings,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            title: 'Variable Overheads',
            value: `৳${stats.variable.toLocaleString()}`,
            icon: AlertOctagon,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
          },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="glass-panel border border-slate-900 rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {c.title}
                </span>
                <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">{c.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel border border-slate-900 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Category Cost Comparisons
          </h3>
          {stats.total === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-500">
              No expense cost data available.
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { name: 'Rider Wages', value: stats.riders, color: 'bg-rose-500' },
                { name: 'Fixed Costs', value: stats.fixed, color: 'bg-amber-500' },
                { name: 'Variable Overheads', value: stats.variable, color: 'bg-purple-500' },
              ].map((cat, idx) => {
                const percent = (cat.value / maxBarVal) * 100;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{cat.name}</span>
                      <span className="font-bold text-white">৳{cat.value.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Expense Entry Rules
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use the expense form to log rider wages, variable overheads, and fixed costs in their
              own section. Expenses reduce your net cash balance along with merchant bill payouts.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
            <span>Itemized expense lines:</span>
            <span className="font-bold text-white">{itemizedExpenses.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search items by name or merchant..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 min-w-45">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Category
          </span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Rider Wages">Rider Wages</option>
            <option value="Fixed Cost">Fixed Costs</option>
            <option value="Variable Overhead">Variable Overheads</option>
          </select>
        </div>
      </div>

      {/* Expense sheet */}
      <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/40 border-b border-slate-900">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Expense Sheet
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-900 text-slate-400 font-bold">
                <th className="p-4 whitespace-nowrap">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Linked Merchant</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                    No expenses recorded yet. Click &quot;New Expense&quot; to add one.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/10 transition-all text-slate-300">
                    <td className="p-4 whitespace-nowrap font-medium text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        {new Date(item.date).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                          item.category === 'Rider Wages'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : item.category === 'Fixed Cost'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-white">{item.name}</td>
                    <td className="p-4 text-slate-400">
                      {item.merchantName || 'General Overhead'}
                    </td>
                    <td className="p-4 font-bold text-rose-400">৳{item.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item.originalRecord)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
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

      {/* Expense form drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-(--drawer-bg) border-l border-slate-900 h-full shadow-2xl flex flex-col z-10">
            <div className="p-5 border-b border-slate-900 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {editingRecord ? 'Edit Expense' : 'New Expense Entry'}
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Log operational costs in the dedicated expense section
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                  Date &amp; Merchant
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
                    <label className="text-[11px] font-medium text-slate-400">Month</label>
                    <select
                      name="month"
                      value={form.month}
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {MONTHS.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400 block">
                    Linked Merchant (optional)
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="merchantName"
                      value={form.merchantName}
                      onChange={handleChange}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="">General overhead</option>
                      {merchants.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
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
                        placeholder="New merchant name..."
                        value={newMerchant}
                        onChange={e => setNewMerchant(e.target.value)}
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

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                  Expense Details
                </h3>
                <OverheadExpenses form={form} handleChange={handleChange} />
              </div>
            </form>

            <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : editingRecord ? 'Update Expense' : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
