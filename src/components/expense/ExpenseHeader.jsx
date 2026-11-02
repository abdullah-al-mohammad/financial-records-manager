import { Plus } from 'lucide-react';
import ExportCsvButton from '../shared/ExportCsvButton';

// Expense section title + primary action.
export default function ExpenseHeader({ onNewExpense, onExport, exportDisabled = false }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Expense Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">
          Record operational costs separately and track remaining cash balance
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <ExportCsvButton onClick={onExport} disabled={exportDisabled} />
        <button
          type="button"
          onClick={onNewExpense}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Expense
        </button>
      </div>
    </div>
  );
}
