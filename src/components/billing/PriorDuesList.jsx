// Prior dues breakdown by merchant shown beside the cycle metrics.
export default function PriorDuesList({ billingLedger, priorTotal }) {
  return (
    <div className="w-full lg:w-64 bg-slate-950/40 border border-slate-900/60 rounded-xl p-4 flex flex-col justify-between min-h-[220px]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Prior Dues By Merchant
          </span>
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
          {billingLedger.filter(m => m.startingBalance > 0).length === 0 ? (
            <div className="text-[10px] text-slate-500 italic py-2">No outstanding prior dues.</div>
          ) : (
            billingLedger
              .filter(m => m.startingBalance > 0)
              .map(m => (
                <div
                  key={m.name}
                  className="flex justify-between items-center text-[10px] py-1 border-b border-slate-900/40 last:border-b-0"
                >
                  <span className="font-medium text-slate-300 truncate max-w-[120px]">{m.name}</span>
                  <span className="font-bold text-rose-400">
                    ৳{m.startingBalance.toLocaleString()}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
      <div className="pt-2 border-t border-slate-900 mt-2 flex items-center justify-between text-[10px]">
        <span className="text-slate-500 font-medium">Prior Total</span>
        <span className="font-bold text-rose-400">৳{priorTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}
