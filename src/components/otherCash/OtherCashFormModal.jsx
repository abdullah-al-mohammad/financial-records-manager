import { Calendar, DollarSign, FileText, X } from 'lucide-react';
import { MONTHS } from './otherCashLogic';

// Add / edit other-cash record modal.
export default function OtherCashFormModal({ isOpen, form, setForm, editingId, isSubmitting, onSubmit, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              {editingId ? 'Edit Other Cash Record' : 'Add Other Cash Record'}
            </h2>
            <button
              type="button"
              onClick={onClose}
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
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
