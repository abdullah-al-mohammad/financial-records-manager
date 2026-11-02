import { CalendarClock, Coins, CreditCard, PiggyBank, Wallet, X } from 'lucide-react';
import { formatAmount, monthNameFromKey } from './dashboardLogic';

// Modal for creating/editing the current month's opening balance.
export default function OpeningBalanceModal({
  onClose,
  currentMonthName,
  currentYear,
  obSource,
  obFromMonthKey,
  previousMonthClosing,
  onCarryForward,
  obHand,
  setObHand,
  obOnline,
  setObOnline,
  obOther,
  setObOther,
  onSave,
  obSubmitting,
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
      <div className="glass-panel border border-indigo-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-indigo-950/30 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Opening Balance — {currentMonthName} {currentYear}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Starting cash for this month</p>
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

        {/* Source badge */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`badge-pill text-[10px] ${obSource === 'carried_forward' ? 'badge-indigo' : 'badge-amber'}`}
          >
            {obSource === 'carried_forward' ? 'Carried Forward from Previous Month' : 'Manual Entry'}
          </span>
          {obSource === 'carried_forward' && obFromMonthKey && (
            <span className="text-[10px] text-slate-500">
              from {monthNameFromKey(obFromMonthKey)}
            </span>
          )}
        </div>

        {/* Carry Forward action row (only when previous month closing exists) */}
        {previousMonthClosing && (
          <button
            type="button"
            onClick={onCarryForward}
            disabled={obSource === 'carried_forward'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            {obSource === 'carried_forward'
              ? 'Pre-filled from Previous Month Closing'
              : 'Carry Forward Previous Month Closing'}
          </button>
        )}

        {obSource === 'carried_forward' && previousMonthClosing && (
          <p className="text-[11px] text-indigo-200/80 bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-4 py-3 mb-4 leading-relaxed">
            Values pre-filled from{' '}
            <strong>
              {previousMonthClosing.month} {previousMonthClosing.year}
            </strong>{' '}
            closing (Total ৳{fmt(previousMonthClosing.totalCash)}). Review the amounts below — you
            can edit them before saving. This creates a separate opening balance record and will not
            book any income or cash transaction.
          </p>
        )}

        {/* Amount fields */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Hand Cash (৳)
            </label>
            <div className="relative">
              <PiggyBank className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="any"
                value={obHand}
                onChange={e => setObHand(e.target.value)}
                placeholder="e.g. 20000"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Online Cash (৳)
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-violet-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="any"
                value={obOnline}
                onChange={e => setObOnline(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Other Cash (৳)
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="any"
                value={obOther}
                onChange={e => setObOther(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Total — auto-synced */}
          <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-violet-600/20 border border-indigo-500/30">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-200">
              <Wallet className="w-4 h-4" />
              Total Opening Cash
            </div>
            <span className="text-xl font-extrabold font-mono text-white">
              ৳
              {fmt((parseFloat(obHand) || 0) + (parseFloat(obOnline) || 0) + (parseFloat(obOther) || 0))}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 bg-slate-800/40 rounded-xl px-4 py-3 mb-5 leading-relaxed">
          ⚠️ Hand + Online + Other stay synchronized and the total updates automatically. Only{' '}
          <strong className="text-slate-200">one opening balance per month</strong> is stored, and it
          <strong className="text-slate-200"> does not affect</strong> income, expenses, sales,
          payables, or receivable calculations.
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
            onClick={onSave}
            disabled={obSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-900/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-[0.98]"
          >
            {obSubmitting ? 'Saving…' : 'Save Opening Balance'}
          </button>
        </div>
      </div>
    </div>
  );
}
