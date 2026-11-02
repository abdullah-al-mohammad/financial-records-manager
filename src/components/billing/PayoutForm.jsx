import { format } from 'date-fns';
import DatePicker from 'react-datepicker';

// Merchant payout recorder / editor form.
export default function PayoutForm({
  paymentDate,
  setPaymentDate,
  merchants,
  selectedMerchant,
  setSelectedMerchant,
  paidAmount,
  setPaidAmount,
  notes,
  setNotes,
  editingPaymentId,
  isSubmitting,
  onSubmit,
  onCancelEdit,
}) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {editingPaymentId ? 'Modify Payment' : 'Record Payout'}
        </h3>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Submit merchant billing cleared transactions
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-slate-400">Date Paid</label>
          <DatePicker
            selected={paymentDate ? new Date(paymentDate) : null}
            onChange={date => {
              if (date) {
                setPaymentDate(format(date, 'yyyy-MM-dd'));
              }
            }}
            dateFormat="MMMM d, yyyy"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
            wrapperClassName="w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-medium text-slate-400">Select Merchant</label>
          <select
            required
            value={selectedMerchant}
            onChange={e => setSelectedMerchant(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
          >
            <option value="">Choose Merchant</option>
            {merchants.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-medium text-slate-400">
            Amount Transferred (৳)
          </label>
          <input
            type="number"
            required
            placeholder="e.g. 15000"
            value={paidAmount}
            onChange={e => setPaidAmount(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-medium text-slate-400">Notes (optional)</label>
          <input
            type="text"
            placeholder="e.g. Bank transfer reference"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all cursor-pointer text-center"
          >
            {isSubmitting ? 'Processing...' : editingPaymentId ? 'Update Log' : 'Log Payout'}
          </button>
          {editingPaymentId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
