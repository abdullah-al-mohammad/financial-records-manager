import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { formatAmount } from './dashboardLogic';

// Collapsible accordion listing snapshotted month closings.
export default function MonthClosingHistory({
  monthClosings,
  sortedClosings,
  currentMonthKey,
  showHistory,
  onToggle,
}) {
  const fmt = formatAmount;

  return (
    <div className="mt-5 relative z-10">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Monthly Closing History</span>
          <span className="badge-pill badge-indigo text-[10px]">
            {monthClosings.length} record{monthClosings.length !== 1 ? 's' : ''}
          </span>
        </div>
        {showHistory ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {showHistory && (
        <div className="mt-2 rounded-2xl overflow-hidden border border-slate-700/40">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-800/60">
                <th className="px-4 py-3 text-left font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Month
                </th>
                <th className="px-4 py-3 text-right font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
                  Hand Cash
                </th>
                <th className="px-4 py-3 text-right font-semibold text-violet-400 uppercase tracking-wider text-[10px]">
                  Online Cash
                </th>
                <th className="px-4 py-3 text-right font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">
                  Other Cash
                </th>
                <th className="px-4 py-3 text-right font-semibold text-white uppercase tracking-wider text-[10px]">
                  Total
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Closed By
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedClosings.map((c, idx) => (
                <tr key={c.id} className={idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/20'}>
                  <td className="px-4 py-3 font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      {c.monthKey === currentMonthKey && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      {c.month} {c.year}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(c.closedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-300">
                    ৳{fmt(c.handCash)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-violet-300">
                    ৳{fmt(c.onlineCash)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-300">
                    ৳{fmt(c.otherCash)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white font-bold">
                    ৳{fmt(c.totalCash)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">{c.closedBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
