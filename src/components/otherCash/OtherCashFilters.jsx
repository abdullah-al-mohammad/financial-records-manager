import { Filter, Search } from 'lucide-react';
import { MONTHS } from './otherCashLogic';

// Search, month and type filters for the other-cash table.
export default function OtherCashFilters({
  searchTerm,
  onSearchChange,
  filterMonth,
  onMonthChange,
  filterType,
  onTypeChange,
}) {
  return (
    <div className="glass-panel border border-slate-800 rounded-2xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search source or description..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filterMonth}
            onChange={e => onMonthChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
          >
            <option>All</option>
            {MONTHS.map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filterType}
            onChange={e => onTypeChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
          >
            <option>All</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
        </div>
      </div>
    </div>
  );
}
