import { ArrowUpRight, Info } from 'lucide-react';
import Modal from '../shared/Modal';
import AccountSelector from './AccountSelector';
import { ACCOUNT_LABELS } from './accountConfig';
import ModalSummaryBox from './ModalSummaryBox';

// Confirmation modal that marks a payable as paid and deducts the balance.
export default function PayPayableModal({
  open,
  onClose,
  payingRecord,
  payModal,
  setPayModal,
  isPaySubmitting,
  onSubmit,
}) {
  if (!payingRecord) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={ArrowUpRight}
      iconClassName="p-2 rounded-xl bg-rose-500/10 text-rose-400"
      title="Confirm Payment"
      subtitle="Mark as paid and deduct from selected balance"
      panelClassName="glass-panel border border-rose-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl bg-slate-950"
    >
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        {/* Payment Summary: কতটাকা কাকে দেওয়া হবে তা দেখানো */}
        <ModalSummaryBox
          nameLabel="To Person / Supplier:"
          name={payingRecord.name}
          amountLabel="Payable Amount:"
          amount={`৳${parseFloat(payingRecord.amount || 0).toLocaleString()}`}
          amountClassName="text-rose-400"
          note={payingRecord.note}
        />

        {/* Account Selector: কোন cash account থেকে pay হবে */}
        {/* এই paidAccount মানটি finance.js এর computeNetCashBalance-এ ব্যবহৃত হবে */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-300 block">
            Deduct From Cash Balance <span className="text-rose-400">*</span>
          </label>
          <AccountSelector
            value={payModal.paidAccount}
            onChange={id => setPayModal(prev => ({ ...prev, paidAccount: id }))}
            variant="rose"
          />
        </div>

        {/* Payment Date: কোন তারিখে payment করা হচ্ছে */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300 block">
            Payment Date <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            value={payModal.paidDate}
            onChange={e => setPayModal(prev => ({ ...prev, paidDate: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            required
          />
        </div>

        {/* Optional Note */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300 block">
            Note / Reference (optional)
          </label>
          <input
            type="text"
            value={payModal.payNote}
            onChange={e => setPayModal(prev => ({ ...prev, payNote: e.target.value }))}
            placeholder="e.g. Paid via bKash / receipt #123..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
          />
        </div>

        {/* Explanatory Banner: কি হবে তা ব্যাখ্যা করা হচ্ছে */}
        <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-2.5 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>
            Confirming will mark this as <strong>Paid</strong> and deduct{' '}
            <strong className="text-rose-400">
              ৳{parseFloat(payingRecord.amount || 0).toLocaleString()}
            </strong>{' '}
            from your <strong>{ACCOUNT_LABELS[payModal.paidAccount]?.label}</strong> balance
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
          {/* Submit বাটন: isPaySubmitting true হলে disabled করা হবে */}
          <button
            type="submit"
            id="btn-confirm-pay"
            disabled={isPaySubmitting}
            className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isPaySubmitting ? 'Processing...' : 'Confirm & Deduct Balance'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
