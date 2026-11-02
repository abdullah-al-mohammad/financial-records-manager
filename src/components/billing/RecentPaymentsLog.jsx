import { Edit2, Trash2 } from 'lucide-react';

// Most recent eight payout records with edit/delete actions.
export default function RecentPaymentsLog({ payments, onEditPayment, onDeletePayment }) {
  const handleDelete = p => {
    if (!p?.id) return;
    if (window.confirm('Delete this payout log permanently?')) {
      onDeletePayment(p.id);
    }
  };

  return (
    <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl mt-8">
      <div className="p-4 bg-slate-900/40 border-b border-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Recent Payments Log
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-900">
              <th className="p-4">Date</th>
              <th className="p-4">Merchant Name</th>
              <th className="p-4">Paid Amount</th>
              <th className="p-4">Notes</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/40">
            {payments.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  No payouts logged yet.
                </td>
              </tr>
            ) : (
              payments
                .slice(-8)
                .reverse()
                .map(p => (
                  <tr key={p.id} className="hover:bg-slate-900/10 transition-all text-slate-300">
                    <td className="p-4 whitespace-nowrap text-slate-400">
                      {new Date(p.date).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 font-bold text-white">{p.merchantName}</td>
                    <td className="p-4 font-semibold text-emerald-400">
                      ৳{Number(p.paidAmount).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-500 italic max-w-xs truncate">
                      {p.notes || '—'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditPayment(p)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
