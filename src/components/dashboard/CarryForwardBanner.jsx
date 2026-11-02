import { CalendarClock } from 'lucide-react';
import { formatAmount } from './dashboardLogic';

// Banner offering to carry a closed previous month forward as opening balance.
export default function CarryForwardBanner({ previousMonthClosing, currentMonthName, onCarryForward }) {
  const fmt = formatAmount;

  return (
    <div className="mt-5 relative z-10 flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/8 border border-amber-500/25">
      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
        <CalendarClock className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
          Previous Month Closing Available
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {previousMonthClosing.month} {previousMonthClosing.year} closed with a total of ৳
          {fmt(previousMonthClosing.totalCash)}
          &nbsp;—&nbsp;carry it forward as {currentMonthName}'s opening balance?
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onCarryForward}
          className="text-[10px] font-bold text-amber-300 hover:text-amber-200 py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
        >
          ✓ Carry Forward Previous Month
        </button>
      </div>
    </div>
  );
}
