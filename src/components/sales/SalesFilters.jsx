import { MONTH_NAMES } from '../../utils/dates';
import SearchField from '../shared/SearchField';
import { SALES_TYPES } from './salesLogic';

// Advanced sales filters (search, month, type).
export default function SalesFilters({
  searchTerm,
  onSearchChange,
  filterMonth,
  onMonthChange,
  filterType,
  onTypeChange,
}) {
  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl p-4.5 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-lg">
      <SearchField
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search merchant or rider..."
        containerClassName="relative"
        iconClassName="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400"
        inputClassName="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
      />

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Month</span>
        <select
          value={filterMonth}
          onChange={e => onMonthChange(e.target.value)}
          className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all cursor-pointer"
        >
          <option value="All">All Months</option>
          {MONTH_NAMES.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
        <select
          value={filterType}
          onChange={e => onTypeChange(e.target.value)}
          className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all cursor-pointer"
        >
          <option value="All">All Types</option>
          {SALES_TYPES.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
