import SearchField from '../shared/SearchField';

// Search bar for the merchant ledger grid.
export default function LedgerSearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-4 flex items-center justify-between">
      <SearchField
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search merchant records..."
        containerClassName="relative w-full max-w-sm"
        iconClassName="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500"
        inputClassName="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none"
      />
    </div>
  );
}
