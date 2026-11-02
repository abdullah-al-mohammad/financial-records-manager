import { Coins, DollarSign } from 'lucide-react';

// Income / expense / net balance summary cards.
export default function OtherCashSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="glass-panel border border-emerald-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Income</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="text-2xl font-bold text-emerald-400">৳{summary.totalIncome.toLocaleString()}</span>
      </div>
      <div className="glass-panel border border-rose-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expense</span>
          <DollarSign className="w-4 h-4 text-rose-400" />
        </div>
        <span className="text-2xl font-bold text-rose-400">৳{summary.totalExpense.toLocaleString()}</span>
      </div>
      <div className="glass-panel border border-indigo-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Balance</span>
          <Coins className="w-4 h-4 text-indigo-400" />
        </div>
        <span className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          ৳{summary.netBalance.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
