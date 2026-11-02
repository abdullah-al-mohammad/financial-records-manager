import { CalendarClock } from 'lucide-react';
import { formatAmount, monthNameFromKey, normalizeMonthKey } from './dashboardLogic';

// Banner shown when the current month has an opening-balance record.
export default function OpeningBalanceBanner({
  resolvedOpeningBalance,
  openingSource,
  currentMonthKey,
  currentMonthName,
  currentYear,
  onEdit,
  onRemove,
}) {
  const fmt = formatAmount;
  const openingMonthKey = normalizeMonthKey(resolvedOpeningBalance.monthKey);
  const carriedFromKey =
    openingMonthKey && openingMonthKey !== currentMonthKey ? openingMonthKey : null;
  const carriedFromLabel = carriedFromKey
    ? `${monthNameFromKey(carriedFromKey)} ${carriedFromKey.slice(0, 4)}`
    : null;

  return (
    <div className="mt-5 relative z-10 flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-500/8 border border-indigo-500/20">
      <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 shrink-0">
        <CalendarClock className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
          {openingSource === 'carryforward'
            ? 'Carried-Forward Opening Balance'
            : 'Manual Opening Balance'}
          <span className="normal-case font-medium text-slate-400">
            {' '}
            — {carriedFromLabel || `${currentMonthName} ${currentYear}`}
          </span>
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Hand ৳{fmt(resolvedOpeningBalance.handCash)} · Online ৳
          {fmt(resolvedOpeningBalance.onlineCash)} · Other ৳
          {fmt(resolvedOpeningBalance.otherCash)}
          &nbsp;—&nbsp;
          {carriedFromLabel
            ? `carried into ${currentMonthName} until a new opening balance is set`
            : "added as this month's opening cash"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="badge-pill badge-indigo text-[10px]">
          {carriedFromLabel
            ? `Carried from ${carriedFromLabel}`
            : openingSource === 'carryforward'
              ? 'Carried Forward from Previous Month'
              : 'Manual Entry'}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          Edit
        </button>
        {!carriedFromLabel && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
