// Outstanding dues from months prior to the current one.
export default function PreviousMonthDuesCard({ previousMonthDues }) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
          <span>Prior Month Dues</span>
          <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 uppercase tracking-widest">
            Due
          </span>
        </h3>
        {previousMonthDues.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            All previous dues settled.
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {previousMonthDues.map(m => (
              <div
                key={m.name}
                className="flex justify-between items-center text-xs py-1.5 border-b border-slate-900/60 last:border-b-0"
              >
                <span className="font-semibold text-slate-200">{m.name}</span>
                <span className="font-bold text-rose-400">৳{m.due.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="pt-3 border-t border-slate-900 mt-4 flex items-center justify-between">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
          Total Outstanding Prior
        </span>
        <span className="text-sm font-extrabold text-rose-400 block">
          ৳{previousMonthDues.reduce((sum, m) => sum + m.due, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
