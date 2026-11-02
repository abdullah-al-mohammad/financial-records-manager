import { ArrowDownLeft, Info } from 'lucide-react';
import Modal from '../shared/Modal';
import AccountSelector from './AccountSelector';
import { ACCOUNT_LABELS } from './accountConfig';
import ModalSummaryBox from './ModalSummaryBox';

// Confirmation modal that marks a receivable as received and deposits it.
export default function ReceiveMoneyModal({
  open,
  onClose,
  receivingRecord,
  receiveForm,
  setReceiveForm,
  isSubmitting,
  onSubmit,
}) {
  if (!receivingRecord) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={ArrowDownLeft}
      iconClassName="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"
      title="Receive Money"
      subtitle="Record payment and add to selected cash balance"
      panelClassName="glass-panel border border-emerald-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl bg-slate-950"
    >
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        {/* Payment Summary Box */}
        <ModalSummaryBox
          nameLabel="From Person / Business:"
          name={receivingRecord.name}
          amountLabel="Receivable Amount:"
          amount={`৳${parseFloat(receivingRecord.amount || 0).toLocaleString()}`}
          amountClassName="text-emerald-400"
          note={receivingRecord.note}
        />

        {/* Deposit Into Account Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-300 block">
            Deposit Into Cash Balance <span className="text-rose-400">*</span>
          </label>
          <AccountSelector
            value={receiveForm.receivedAccount}
            onChange={id => setReceiveForm(prev => ({ ...prev, receivedAccount: id }))}
            variant="indigo"
          />
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
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
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
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
            to your <strong>{ACCOUNT_LABELS[receiveForm.receivedAccount]?.label}</strong> balance
            immediately.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
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
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Recording...' : 'Confirm & Add to Balance'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
