import {
  ArrowRightLeft,
  CalendarCheck,
  CheckCircle2,
  PencilLine,
  Wallet,
} from 'lucide-react';
import { formatAmount } from './dashboardLogic';

// Hero header of the cash summary: prominent total cash + quick actions.
export default function CashSummaryHero({
  paymentTotals,
  resolvedOpeningBalance,
  isCurrentMonthClosed,
  currentMonthName,
  onOpenOpeningModal,
  onOpenCloseModal,
  onOpenTransfer,
  setActiveTab,
}) {
  const fmt = formatAmount;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/70 relative z-10">
      <div className="flex items-start sm:items-center gap-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/25 shrink-0">
          <Wallet className="w-7 h-7" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Cash Balance
            </span>
            <span className="badge-pill badge-indigo text-[10px]">Combined Liquidity</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              ৳
              {paymentTotals.totalCash.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              All Cash Reserves
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Total Cash = <span className="text-amber-400 font-semibold">Hand Cash</span> +{' '}
              <span className="text-violet-400 font-semibold">Online Cash</span> +{' '}
              <span className="text-emerald-400 font-semibold">Other Cash</span>
              {resolvedOpeningBalance && (
                <span className="text-indigo-400">
                  {' '}
                  + <span className="font-semibold">Opening Balance</span> (৳
                  {fmt(
                    (Number(resolvedOpeningBalance.handCash) || 0) +
                      (Number(resolvedOpeningBalance.onlineCash) || 0) +
                      (Number(resolvedOpeningBalance.otherCash) || 0)
                  )}
                  )
                </span>
              )}
            </span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* Set Opening Balance Button — always accessible */}
        <button
          type="button"
          onClick={onOpenOpeningModal}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          <PencilLine className="w-3.5 h-3.5" />
          {resolvedOpeningBalance ? 'Edit Opening Balance' : 'Set Opening Balance'}
        </button>

        {/* Close Month Button */}
        {isCurrentMonthClosed ? (
          <span className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {currentMonthName} Closed
          </span>
        ) : (
          <button
            type="button"
            onClick={onOpenCloseModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Close Month
          </button>
        )}
        <button
          type="button"
          onClick={onOpenTransfer}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Transfer Funds
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl glass-panel border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          View Ledger
        </button>
      </div>
    </div>
  );
}
