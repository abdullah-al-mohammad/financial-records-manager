import { CheckCircle2, Clock, CreditCard, HandCoins, PiggyBank, Wallet } from 'lucide-react';

// Four receivable-side summary cards (pending, received, total, deposit split).
export default function ReceivableSummaryCards({ stats, receivableCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pending Collection */}
      <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pending Collection
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-white tracking-tight">
            ৳{stats.pending.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-semibold text-amber-400">
              {stats.pendingCount} record{stats.pendingCount !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-slate-500">awaiting receipt</span>
          </div>
        </div>
      </div>

      {/* Total Collected */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Received
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-white tracking-tight">
            ৳{stats.received.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-semibold text-emerald-400">
              {stats.receivedCount} collected
            </span>
            <span className="text-[10px] text-slate-500">into balances</span>
          </div>
        </div>
      </div>

      {/* Total Receivables */}
      <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Receivable
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <HandCoins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-white tracking-tight">
            ৳{stats.total.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {receivableCount} total entries recorded
          </span>
        </div>
      </div>

      {/* Received Distribution breakdown */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-900 relative overflow-hidden">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Deposit Balances
        </span>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <PiggyBank className="w-3 h-3 text-amber-400" /> Hand Cash:
            </span>
            <span className="font-bold text-slate-200">
              ৳{stats.receivedInCash.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-violet-400" /> Online:
            </span>
            <span className="font-bold text-slate-200">
              ৳{stats.receivedInOnline.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Wallet className="w-3 h-3 text-emerald-400" /> Other Cash:
            </span>
            <span className="font-bold text-slate-200">
              ৳{stats.receivedInOtherCash.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
