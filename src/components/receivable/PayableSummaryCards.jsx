import { CheckCircle2, Clock, Coins, CreditCard, PiggyBank, Wallet } from 'lucide-react';

// Four payable-side summary cards (owed, paid, total, deduction split).
export default function PayableSummaryCards({ payStats, payableCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Unpaid (বকেয়া) */}
      <div className="glass-panel rounded-2xl p-5 border border-rose-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Outstanding Debt
          </span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-white tracking-tight">
            ৳{payStats.unpaid.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-semibold text-rose-400">
              {payStats.unpaidCount} record{payStats.unpaidCount !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-slate-500">pending payment</span>
          </div>
        </div>
      </div>

      {/* Paid (পরিশোধিত) */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Paid
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-white tracking-tight">
            ৳{payStats.paid.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-semibold text-emerald-400">
              {payStats.paidCount} settled
            </span>
            <span className="text-[10px] text-slate-500">from balances</span>
          </div>
        </div>
      </div>

      {/* Total Payable */}
      <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Payable
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-white tracking-tight">
            ৳{payStats.total.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {payableCount} total entries
          </span>
        </div>
      </div>

      {/* Deduction breakdown by account */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-900 relative overflow-hidden">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Deducted From
        </span>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <PiggyBank className="w-3 h-3 text-amber-400" /> Hand Cash:
            </span>
            <span className="font-bold text-slate-200">
              ৳{payStats.paidInCash.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-violet-400" /> Online:
            </span>
            <span className="font-bold text-slate-200">
              ৳{payStats.paidInOnline.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Wallet className="w-3 h-3 text-emerald-400" /> Other Cash:
            </span>
            <span className="font-bold text-slate-200">
              ৳{payStats.paidInOtherCash.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
