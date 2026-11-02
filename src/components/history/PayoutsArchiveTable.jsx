import { FileSpreadsheet } from 'lucide-react';

// Payouts archive table for the selected month.
export default function PayoutsArchiveTable({ selectedMonth, payments }) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4 text-slate-500" />
        {selectedMonth} Payouts Archive
      </h3>

      <div className="max-h-80 overflow-y-auto border border-slate-900 rounded-xl">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-950 text-slate-400 sticky top-0 font-bold">
            <tr>
              <th className="p-2.5">Date</th>
              <th className="p-2.5">Merchant Name</th>
              <th className="p-2.5">Amount Paid</th>
              <th className="p-2.5">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/40 text-slate-300">
            {payments.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-600">
                  No payouts logged.
                </td>
              </tr>
            ) : (
              payments.map((p, i) => (
                <tr key={p.id || i} className="hover:bg-slate-900/10">
                  <td className="p-2.5 text-slate-500">
                    {new Date(p.date).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-2.5 font-semibold">{p.merchantName}</td>
                  <td className="p-2.5 font-bold text-emerald-400">
                    ৳{Number(p.paidAmount || 0).toLocaleString()}
                  </td>
                  <td className="p-2.5 text-slate-500 italic max-w-xs truncate">
                    {p.notes || '—'}
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
