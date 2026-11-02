import { CalendarClock, ChevronDown, ChevronUp } from 'lucide-react';
import { formatAmount } from './dashboardLogic';

// Collapsible accordion listing monthly opening-balance records.
export default function OpeningBalanceHistory({
  openingBalances,
  currentMonthKey,
  showHistory,
  onToggle,
}) {
  const fmt = formatAmount;

  return (
    <div className="mt-3 relative z-10">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-indigo-800/30 hover:bg-indigo-800/50 border border-indigo-700/40 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Opening Balance History</span>
          <span className="badge-pill badge-indigo text-[10px]">
            {openingBalances.length} record{openingBalances.length !== 1 ? 's' : ''}
          </span>
        </div>
        {showHistory ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {showHistory && (
        <div className="mt-2 rounded-2xl overflow-hidden border border-indigo-700/40">
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
                  Source
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Set By
                </th>
              </tr>
            </thead>
            <tbody>
              {[...openingBalances]
                .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
                .map((o, idx) => (
                  <tr key={o.id} className={idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/20'}>
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        {o.monthKey === currentMonthKey && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {o.month} {o.year}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-amber-300">
                      ৳{fmt(o.handCash)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-violet-300">
                      ৳{fmt(o.onlineCash)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-300">
                      ৳{fmt(o.otherCash)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-white font-bold">
                      ৳{fmt(o.totalCash)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {o.source === 'carried_forward' ? (
                        <span className="badge-pill badge-indigo text-[10px]">
                          Carried Forward
                        </span>
                      ) : (
                        <span className="badge-pill badge-amber text-[10px]">Manual Entry</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">{o.createdBy || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
