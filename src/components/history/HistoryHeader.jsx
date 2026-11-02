import { Calendar, History } from 'lucide-react';

// History page title plus the target archive month selector.
export default function HistoryHeader({ availableMonths, selectedMonth, onMonthChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" />
          History &amp; Archive Explorer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Browse audit books and performance logs of completed cycles
        </p>
      </div>

      {/* Month Dropdown */}
      {availableMonths.length > 0 && (
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Target Archive:
          </span>
          <select
            value={selectedMonth}
            onChange={e => onMonthChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white font-bold outline-none focus:border-indigo-500"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
