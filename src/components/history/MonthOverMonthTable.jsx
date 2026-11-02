import { Layers } from 'lucide-react';

// Month-over-month performance table; clicking a row selects that month.
export default function MonthOverMonthTable({
  monthlyMetricsSummary,
  selectedMonth,
  onSelectMonth,
}) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <Layers className="w-4 h-4 text-slate-500" />
        Month-over-Month Ledger Performance
      </h3>

      <div className="overflow-x-auto rounded-xl border border-slate-900/60">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-900">
              <th className="p-3">Audit Cycle Month</th>
              <th className="p-3">Sales Volume</th>
              <th className="p-3">Net Revenue (Income)</th>
              <th className="p-3">Overhead Expenses</th>
              <th className="p-3">Net Margin</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/40 text-slate-300">
            {monthlyMetricsSummary.map(m => (
              <tr
                key={m.month}
                className={`hover:bg-slate-900/10 cursor-pointer transition-all ${
                  selectedMonth === m.month ? 'bg-indigo-600/5 text-white font-medium' : ''
                }`}
                onClick={() => onSelectMonth(m.month)}
              >
                <td className="p-3 font-bold">{m.month}</td>
                <td className="p-3">৳{m.sales.toLocaleString()}</td>
                <td className="p-3 text-indigo-400 font-semibold">৳{m.income.toLocaleString()}</td>
                <td className="p-3 text-rose-400/90">৳{m.expenses.toLocaleString()}</td>
                <td
                  className={`p-3 font-bold ${m.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  ৳{m.profit.toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${
                      m.profit >= 0
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                    }`}
                  >
                    {m.profit >= 0 ? 'Profit' : 'Loss'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
