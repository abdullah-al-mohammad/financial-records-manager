import { Plus, SlidersHorizontal, Trash2, Upload } from 'lucide-react';
import ExportCsvButton from '../shared/ExportCsvButton';

// Sales section title, entry count, filter toggle and bulk actions.
export default function SalesHeader({
  entryCount,
  showFilters,
  onToggleFilters,
  onDeleteAll,
  onNewEntry,
  onImport,
  onExport,
  exportDisabled = false,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-white">Sales Records</h1>
          <span className="badge-pill badge-indigo">
            {entryCount} {entryCount === 1 ? 'Entry' : 'Entries'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Browse, input, or export financial sales transactions with live ledger balance sync
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            showFilters
              ? 'bg-slate-800/80 border-indigo-500/40 text-white shadow-md shadow-indigo-950/20'
              : 'glass-panel border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          Filters
        </button>

        <button
          onClick={onImport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-800/80 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          Import
        </button>

        <ExportCsvButton onClick={onExport} disabled={exportDisabled} />

        <button
          onClick={onDeleteAll}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete All
        </button>

        <button
          onClick={onNewEntry}
          className="flex items-center gap-2 btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>
    </div>
  );
}
