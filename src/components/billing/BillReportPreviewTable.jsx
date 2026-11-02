import { formatOrderDate, formatOrderDetails, getRecordMerchantBill } from './billingLogic';

// Preview table of a merchant's orders for the selected bill period.
export default function BillReportPreviewTable({
  activeReportMerchant,
  merchantBillReportData,
  billReportStartDate,
  billReportEndDate,
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] text-slate-400">
          Showing orders for{' '}
          <span className="font-bold text-white">{activeReportMerchant}</span>
          {billReportStartDate && billReportEndDate && (
            <span>
              {' '}
              from{' '}
              <span className="text-indigo-400">{formatOrderDate(billReportStartDate)}</span> to{' '}
              <span className="text-indigo-400">{formatOrderDate(billReportEndDate)}</span>
            </span>
          )}
          {!billReportStartDate && !billReportEndDate && (
            <span className="text-slate-500"> (all dates — set a range to filter)</span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-indigo-400">
            Total Bill: ৳{(merchantBillReportData?.totals?.commissionBill || 0).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto border border-slate-900 rounded-xl max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 sticky top-0">
            <tr>
              <th className="p-2.5 whitespace-nowrap">Order Date</th>
              <th className="p-2.5">Order Details</th>
              <th className="p-2.5 text-right whitespace-nowrap">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 text-slate-300">
            {merchantBillReportData.records.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-4 text-center text-slate-500">
                  {merchantBillReportData.totalMerchantRecords === 0
                    ? `No sales records found for ${activeReportMerchant}.`
                    : billReportStartDate || billReportEndDate
                      ? `No orders in this date range. This merchant has ${merchantBillReportData.totalMerchantRecords} order(s) outside the selected dates.`
                      : 'No orders found for this merchant.'}
                </td>
              </tr>
            ) : (
              merchantBillReportData.records.map(r => (
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
          {merchantBillReportData.records.length > 0 && (
            <tfoot className="border-t border-slate-800 bg-slate-950 font-semibold text-slate-200">
              <tr>
                <td colSpan="2" className="p-2.5">
                  Total
                </td>
                <td className="p-2.5 text-right text-indigo-400 whitespace-nowrap font-bold">
                  ৳{(merchantBillReportData?.totals?.commissionBill || 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  );
}
