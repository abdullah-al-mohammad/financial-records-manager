// Four summary metrics for the selected archive month.
export default function HistoryMetricCards({ targetMonthData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-panel border border-slate-900 rounded-2xl p-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
          Month Sales Volume
        </span>
        <span className="text-xl font-extrabold text-white block mt-1">
          ৳{targetMonthData.sales.toLocaleString()}
        </span>
      </div>

      <div className="glass-panel border border-slate-900 rounded-2xl p-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
          Month Net Revenue
        </span>
        <span className="text-xl font-extrabold text-indigo-400 block mt-1">
          ৳{targetMonthData.income.toLocaleString()}
        </span>
      </div>

      <div className="glass-panel border border-slate-900 rounded-2xl p-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
          Month Cost Overheads
        </span>
        <span className="text-xl font-extrabold text-rose-400 block mt-1">
          ৳{targetMonthData.expenses.toLocaleString()}
        </span>
      </div>

      <div className="glass-panel border border-slate-900 rounded-2xl p-5">
        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
          Month Profit / Loss
        </span>
        <span
          className={`text-xl font-extrabold block mt-1 ${targetMonthData.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          ৳{targetMonthData.profit.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
