// Merchant payouts ledger inside the merchant statement drawer.
export default function MerchantStatementPaymentsTable({ merchantBillReportData }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-900 pb-1">
        Payouts Ledger
      </h3>
      <div className="max-h-60 overflow-y-auto border border-slate-900 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 sticky top-0">
            <tr>
              <th className="p-2.5">Date</th>
              <th className="p-2.5">Amount Paid</th>
              <th className="p-2.5">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 text-slate-300">
            {merchantBillReportData?.payments.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center text-slate-500">
                  No payments logged.
                </td>
              </tr>
            ) : (
              merchantBillReportData?.payments.map(p => (
                <tr key={p.id}>
                  <td className="p-2.5">{p.date ? p.date.slice(0, 10) : '—'}</td>
                  <td className="p-2.5 font-bold text-emerald-400">
                    ৳{Number(p.paidAmount).toLocaleString()}
                  </td>
                  <td className="p-2.5 text-slate-500 italic truncate max-w-xs">
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
