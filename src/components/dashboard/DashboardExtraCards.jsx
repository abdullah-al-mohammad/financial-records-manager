import { HandCoins, Landmark, PiggyBank, Receipt } from 'lucide-react';

// Secondary cards row: merchant dues, receivables, payables and other cash.
export default function DashboardExtraCards({
  stats,
  pendingReceivables,
  pendingPayables,
  setActiveTab,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-panel border border-rose-500/15 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-rose-500/5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Merchant Unpaid Bills
            </span>
            <span className="text-xl font-bold text-white tracking-tight block mt-1">
              ৳{stats.totalDues.toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('billing')}
          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 py-1.5 px-3 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          Clear Dues
        </button>
      </div>

      <div className="glass-panel border border-amber-500/15 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-amber-500/5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400">
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Receivables
            </span>
            <span className="text-xl font-bold text-white tracking-tight block mt-1">
              ৳{pendingReceivables.total.toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('receivables')}
          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 py-1.5 px-3 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 transition-all cursor-pointer"
        >
          Collect
        </button>
      </div>

      <div className="glass-panel border border-rose-500/15 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-rose-500/5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Payables
            </span>
            <span className="text-xl font-bold text-white tracking-tight block mt-1">
              ৳{pendingPayables.total.toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('receivables')}
          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 py-1.5 px-3 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          Pay Now
        </button>
      </div>

      <div className="glass-panel border border-indigo-500/15 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-indigo-500/5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Other Cash Collected
            </span>
            <span className="text-xl font-bold text-white tracking-tight block mt-1">
              ৳{stats.otherCash.toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('sales')}
          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 py-1.5 px-3 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 transition-all cursor-pointer"
        >
          View Sources
        </button>
      </div>
    </div>
  );
}
