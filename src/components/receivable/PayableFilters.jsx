import { X } from 'lucide-react';
import SearchField from '../shared/SearchField';

// Search, status pills and account dropdown for the payable ledger.
export default function PayableFilters({
  paySearchQuery,
  onSearchChange,
  payStatusFilter,
  onStatusChange,
  payAccountFilter,
  onAccountChange,
  totalCount,
  unpaidCount,
  paidCount,
}) {
  const hasFilters =
    paySearchQuery || payStatusFilter !== 'all' || payAccountFilter !== 'all';

  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
      <SearchField
        value={paySearchQuery}
        onChange={onSearchChange}
        placeholder="Search supplier, note, or amount..."
        containerClassName="relative w-full md:w-80"
        iconClassName="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
        inputClassName="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 transition-all"
      />

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-900">
          {/* All filter */}
          <button
            type="button"
            onClick={() => onStatusChange('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              payStatusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          {/* Unpaid filter */}
          <button
            type="button"
            onClick={() => onStatusChange('unpaid')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              payStatusFilter === 'unpaid'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unpaid ({unpaidCount})
          </button>
          {/* Paid filter */}
          <button
            type="button"
            onClick={() => onStatusChange('paid')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              payStatusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paid ({paidCount})
          </button>
        </div>

        {/* Account filter */}
        <select
          value={payAccountFilter}
          onChange={e => onAccountChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-rose-500"
        >
          <option value="all">All Accounts</option>
          <option value="cash">Hand Cash</option>
          <option value="online">Online Cash</option>
          <option value="other_cash">Other Cash</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onStatusChange('all');
              onAccountChange('all');
            }}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Clear all filters"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
