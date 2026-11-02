import { Edit2, Plus } from 'lucide-react';
import Modal from '../shared/Modal';

// Add / edit receivable record modal.
export default function ReceivableFormModal({
  open,
  onClose,
  editingRecord,
  form,
  setForm,
  isSubmitting,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={editingRecord ? Edit2 : Plus}
      iconClassName="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"
      title={editingRecord ? 'Edit Receivable' : 'New Receivable Record'}
      subtitle={editingRecord ? 'Update record details' : 'Add money you will receive'}
    >
      <form onSubmit={onSubmit} className="p-6 space-y-4">
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Initial Status */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300 block">Payment Status</label>
          <select
            value={form.status}
            onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
          >
            <option value="Not Received">Not Received (Pending)</option>
            <option value="Received">Received</option>
          </select>
        </div>

        {/* If marked Received upfront, select account */}
        {form.status === 'Received' && (
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="text-[11px] font-medium text-slate-300 block">
              Deposit Into Balance
            </label>
            <select
              value={form.receivedAccount}
              onChange={e => setForm(prev => ({ ...prev, receivedAccount: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
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
            onClick={onClose}
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
    </Modal>
  );
}
