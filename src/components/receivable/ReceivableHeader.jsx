import { Plus } from 'lucide-react';
import ExportCsvButton from '../shared/ExportCsvButton';

// Page title plus the section-aware "Add" action button.
export default function ReceivableHeader({
  activeTab,
  onAddReceivable,
  onAddPayable,
  onExport,
  exportDisabled = false,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-white">Receivables &amp; Payables</h1>
          <span className="badge-pill badge-indigo">Ledger</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Track money you will receive from clients and debts you owe to suppliers with auto cash
          balance deduction
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <ExportCsvButton onClick={onExport} disabled={exportDisabled} />
        {activeTab === 'receivable' ? (
          <button
            type="button"
            onClick={onAddReceivable}
            className="flex items-center justify-center gap-2 btn-emerald-gradient px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Receivable
          </button>
        ) : (
          <button
            type="button"
            id="btn-add-payable"
            onClick={onAddPayable}
            className="flex items-center justify-center gap-2 btn-rose-gradient px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Payable
          </button>
        )}
      </div>
    </div>
  );
}
