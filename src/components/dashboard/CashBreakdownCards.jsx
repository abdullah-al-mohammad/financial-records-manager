import { Coins, CreditCard, PiggyBank } from 'lucide-react';
import { formatAmount } from './dashboardLogic';

// Individual Hand / Online / Other cash breakdown cards.
export default function CashBreakdownCards({ paymentTotals, resolvedOpeningBalance }) {
  const fmt = formatAmount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 relative z-10">
      {/* Hand Cash */}
      <div className="glass-panel glass-card-hover border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Hand Cash
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-white tracking-tight block">
            ৳
            {paymentTotals.cash.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </span>
          {resolvedOpeningBalance && (Number(resolvedOpeningBalance.handCash) || 0) > 0 && (
            <span className="text-[10px] text-indigo-400 font-medium block mt-0.5">
              incl. ৳{fmt(Number(resolvedOpeningBalance.handCash))} opening
            </span>
          )}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/60">
            <span>Physical in-hand cash</span>
            <span className="font-bold text-amber-400 font-mono text-[10px]">
              {paymentTotals.totalCash > 0
                ? `${((Math.max(0, paymentTotals.cash) / paymentTotals.totalCash) * 100).toFixed(1)}%`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Online Cash */}
      <div className="glass-panel glass-card-hover border border-violet-500/20 rounded-2xl p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Online Cash
          </span>
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-white tracking-tight block">
            ৳
            {paymentTotals.online.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </span>
          {resolvedOpeningBalance && (Number(resolvedOpeningBalance.onlineCash) || 0) > 0 && (
            <span className="text-[10px] text-indigo-400 font-medium block mt-0.5">
              incl. ৳{fmt(Number(resolvedOpeningBalance.onlineCash))} opening
            </span>
          )}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/60">
            <span>Bank &amp; digital accounts</span>
            <span className="font-bold text-violet-400 font-mono text-[10px]">
              {paymentTotals.totalCash > 0
                ? `${((Math.max(0, paymentTotals.online) / paymentTotals.totalCash) * 100).toFixed(1)}%`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Other Cash */}
      <div className="glass-panel glass-card-hover border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Other Cash
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-white tracking-tight block">
            ৳
            {paymentTotals.otherCash.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </span>
          {resolvedOpeningBalance && (Number(resolvedOpeningBalance.otherCash) || 0) > 0 && (
            <span className="text-[10px] text-indigo-400 font-medium block mt-0.5">
              incl. ৳{fmt(Number(resolvedOpeningBalance.otherCash))} opening
            </span>
          )}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800/60">
            <span>Auxiliary / petty reserve</span>
            <span className="font-bold text-emerald-400 font-mono text-[10px]">
              {paymentTotals.totalCash > 0
                ? `${((Math.max(0, paymentTotals.otherCash) / paymentTotals.totalCash) * 100).toFixed(1)}%`
                : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
