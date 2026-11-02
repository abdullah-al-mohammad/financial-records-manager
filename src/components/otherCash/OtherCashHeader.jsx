import { Coins, PlusCircle } from 'lucide-react';
import ExportCsvButton from '../shared/ExportCsvButton';

// Other-cash page title and add action.
export default function OtherCashHeader({ onOpenNew, onExport, exportDisabled = false }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-emerald-500" />
          Other Cash Records
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage auxiliary cash transactions (petty cash, reserves, miscellaneous)
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <ExportCsvButton onClick={onExport} disabled={exportDisabled} />
        <button
          onClick={onOpenNew}
          className="flex items-center gap-1.5 btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Other Cash
        </button>
      </div>
    </div>
  );
}
