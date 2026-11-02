import { Edit2, Plus } from 'lucide-react';
import Modal from '../shared/Modal';

// Add / edit payable record modal.
export default function PayableFormModal({
  open,
  onClose,
  editingPayable,
  payForm,
  setPayForm,
  isPaySubmitting,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={editingPayable ? Edit2 : Plus}
      iconClassName="p-2 rounded-xl bg-rose-500/10 text-rose-400"
      title={editingPayable ? 'Edit Payable' : 'New Payable Record'}
      subtitle={editingPayable ? 'Update record details' : 'Add money you owe to someone'}
    >
      <form onSubmit={onSubmit} className="p-6 space-y-4">
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
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
            value={payForm.note}
            onChange={e => setPayForm(prev => ({ ...prev, note: e.target.value }))}
            placeholder="e.g. Packaging materials, rent due, etc."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 resize-none"
          />
        </div>

        {/* Status Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300 block">Payment Status</label>
          <select
            value={payForm.status}
            onChange={e => setPayForm(prev => ({ ...prev, status: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
          >
            <option value="Unpaid">Unpaid (Pending)</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {/* যদি Paid select করা হয়, account selector দেখাবে */}
        {payForm.status === 'Paid' && (
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="text-[11px] font-medium text-slate-300 block">
              Deduct From Balance
            </label>
            <select
              value={payForm.paidAccount}
              onChange={e => setPayForm(prev => ({ ...prev, paidAccount: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
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
            disabled={isPaySubmitting}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isPaySubmitting
              ? 'Saving...'
              : editingPayable
                ? 'Update Record'
                : 'Save Payable'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
