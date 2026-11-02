import { ArrowRightLeft, Trash2 } from 'lucide-react';

// Balance transfers archive table for the selected month.
export default function TransfersArchiveTable({
  selectedMonth,
  transfers,
  transferTotal,
  onDeleteTransfer,
}) {
  return (
    <div className="glass-panel border border-violet-500/10 rounded-2xl p-5 space-y-4 lg:col-span-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400/80 flex items-center gap-2">
        <ArrowRightLeft className="w-4 h-4" />
        {selectedMonth} Balance Transfers
      </h3>

      <div className="max-h-60 overflow-y-auto border border-slate-900 rounded-xl">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-950 text-slate-400 sticky top-0 font-bold">
            <tr>
              <th className="p-2.5">Date</th>
              <th className="p-2.5">Direction</th>
              <th className="p-2.5">Amount</th>
              <th className="p-2.5">Note</th>
              {onDeleteTransfer && <th className="p-2.5 text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/40 text-slate-300">
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={onDeleteTransfer ? 5 : 4} className="p-4 text-center text-slate-600">
                  No balance transfers in this month.
                </td>
              </tr>
            ) : (
              transfers.map((t, i) => {
                const isC2O = t.type === 'cash_to_online' || !t.type;
                return (
                  <tr key={t.id || i} className="hover:bg-violet-900/5">
                    <td className="p-2.5 text-slate-500">
                      {new Date(t.date + 'T00:00:00').toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isC2O ? 'bg-violet-500/10 text-violet-400' : 'bg-cyan-500/10 text-cyan-400'}`}
                      >
                        {isC2O ? 'Cash → Online' : 'Online → Cash'}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-violet-400">
                      ৳{Number(t.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-slate-500 italic max-w-xs truncate">{t.note || '—'}</td>
                    {onDeleteTransfer && (
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => onDeleteTransfer(t.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all cursor-pointer"
                          title="Remove transfer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {transfers.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Month Total Transferred
          </span>
          <span className="text-sm font-extrabold text-violet-400">
            ৳{transferTotal.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
