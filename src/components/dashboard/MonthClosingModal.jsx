import { CalendarCheck, Coins, CreditCard, PiggyBank, Wallet, X } from 'lucide-react';
import { formatAmount } from './dashboardLogic';

// Confirmation modal that snapshots the current cash balance as a month closing.
export default function MonthClosingModal({
  onClose,
  onConfirm,
  closeSubmitting,
  currentMonthName,
  currentYear,
  paymentTotals,
}) {
  const fmt = formatAmount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-panel border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-amber-950/30 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Close {currentMonthName} {currentYear}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Snapshot &amp; carry forward to next month
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Breakdown */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <PiggyBank className="w-4 h-4" />
              Hand Cash
            </div>
            <span className="font-bold font-mono text-white">৳{fmt(paymentTotals.cash)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-violet-500/8 border border-violet-500/20">
            <div className="flex items-center gap-2 text-sm text-violet-300">
              <CreditCard className="w-4 h-4" />
              Online Cash
            </div>
            <span className="font-bold font-mono text-white">৳{fmt(paymentTotals.online)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <Coins className="w-4 h-4" />
              Other Cash
            </div>
            <span className="font-bold font-mono text-white">৳{fmt(paymentTotals.otherCash)}</span>
          </div>
          {/* Total divider */}
          <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-violet-600/20 border border-indigo-500/30">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-200">
              <Wallet className="w-4 h-4" />
              Total Closing Cash
            </div>
            <span className="text-xl font-extrabold font-mono text-white">
              ৳{fmt(paymentTotals.totalCash)}
            </span>
          </div>
        </div>

        {/* Info note */}
        <p className="text-[11px] text-slate-400 bg-slate-800/40 rounded-xl px-4 py-3 mb-5 leading-relaxed">
          💡 This closing balance is snapshotted and will be available to{' '}
          <strong className="text-slate-200">carry forward as next month's opening cash</strong>.
          &nbsp;This action cannot be undone and can only be done{' '}
          <strong className="text-slate-200">once per month</strong>.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-700/40 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={closeSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-900/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98]"
          >
            {closeSubmitting ? 'Saving…' : `✓ Confirm &amp; Close Month`}
          </button>
        </div>
      </div>
    </div>
  );
}
