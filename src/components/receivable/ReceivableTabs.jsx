import { ArrowDownLeft, Coins } from 'lucide-react';

// Segmented control switching between the receivable and payable ledgers.
export default function ReceivableTabs({
  activeTab,
  onTabChange,
  receivablePendingCount,
  payableUnpaidCount,
}) {
  return (
    <div className="glass-panel p-1 rounded-2xl flex items-center gap-1.5 border border-slate-800/80 w-full sm:w-fit shadow-md">
      <button
        type="button"
        onClick={() => onTabChange('receivable')}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
          activeTab === 'receivable'
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }`}
      >
        <ArrowDownLeft
          className={`w-3.5 h-3.5 ${activeTab === 'receivable' ? 'text-emerald-300' : 'text-emerald-400'}`}
        />
        <span>Receivables (Money to Receive)</span>
        {receivablePendingCount > 0 && (
          <span className="badge-pill badge-amber text-[9px] py-0.5 px-1.5 font-bold">
            {receivablePendingCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onTabChange('payable')}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
          activeTab === 'payable'
            ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }`}
      >
        <Coins
          className={`w-3.5 h-3.5 ${activeTab === 'payable' ? 'text-rose-200' : 'text-rose-400'}`}
        />
        <span>Payables (Money I Owe)</span>
        {payableUnpaidCount > 0 && (
          <span className="badge-pill badge-rose text-[9px] py-0.5 px-1.5 font-bold">
            {payableUnpaidCount}
          </span>
        )}
      </button>
    </div>
  );
}
