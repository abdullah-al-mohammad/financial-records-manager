// One merchant ledger card with prior/billed/paid figures and balance.
export default function MerchantLedgerCard({ merchant, onViewHistory }) {
  return (
    <div className="glass-panel border border-slate-900 hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="font-bold text-white tracking-wide truncate pr-2">{merchant.name}</span>
        <span
          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${
            merchant.endingBalance > 0
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
        >
          {merchant.endingBalance > 0 ? 'Due' : 'Settled'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
        <div>
          <span className="block font-medium">Prior Due</span>
          <span className="block font-bold text-slate-300 mt-0.5">
            ৳{merchant.startingBalance.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="block font-medium">Billed</span>
          <span className="block font-bold text-indigo-400 mt-0.5">
            ৳{merchant.totalBilled.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="block font-medium">Paid</span>
          <span className="block font-bold text-emerald-400 mt-0.5">
            ৳{merchant.totalPaid.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
        <div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
            Balance Outstanding
          </span>
          <span
            className={`text-base font-extrabold block mt-0.5 ${merchant.endingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
          >
            ৳{merchant.endingBalance.toLocaleString()}
          </span>
        </div>

        <button
          onClick={() => onViewHistory(merchant.name)}
          className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
        >
          View History
        </button>
      </div>
    </div>
  );
}
