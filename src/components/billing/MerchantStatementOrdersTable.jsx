import { formatOrderDate, formatOrderDetails, getRecordMerchantBill } from './billingLogic';

// Billed orders table inside the merchant statement drawer.
export default function MerchantStatementOrdersTable({ merchantBillReportData }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-1">
        Billed Orders
      </h3>
      <div className="max-h-60 overflow-y-auto border border-slate-900 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 sticky top-0">
            <tr>
              <th className="p-2.5">Order Date</th>
              <th className="p-2.5">Order Details</th>
              <th className="p-2.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 text-slate-300">
            {merchantBillReportData?.records.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center text-slate-500">
                  No orders in this date range.
                </td>
              </tr>
            ) : (
              merchantBillReportData?.records.map(r => (
                <tr key={r.id}>
                  <td className="p-2.5 whitespace-nowrap">{formatOrderDate(r.date)}</td>
                  <td className="p-2.5">{formatOrderDetails(r)}</td>
                  <td className="p-2.5 text-right font-bold text-indigo-400 whitespace-nowrap">
                    ৳{getRecordMerchantBill(r).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {merchantBillReportData?.records.length > 0 && (
            <tfoot className="border-t border-slate-900 bg-slate-950/80 font-bold text-slate-200">
              <tr>
                <td colSpan="2" className="p-2.5">
                  Total
                </td>
                <td className="p-2.5 text-right text-indigo-400 whitespace-nowrap">
                  ৳{(merchantBillReportData?.totals?.commissionBill || 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
