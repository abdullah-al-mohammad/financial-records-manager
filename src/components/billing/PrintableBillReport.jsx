import fatafatLogo from '../../assets/fatafat-logo.svg';
import { formatOrderDate, formatOrderDetails, getRecordMerchantBill } from './billingLogic';

// Hidden print-only merchant statement view.
export default function PrintableBillReport({
  activeReportMerchant,
  merchantBillReportData,
  billReportStartDate,
  billReportEndDate,
}) {
  return (
    <div className="printable-report-area hidden bg-white text-black p-8 font-sans w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-start border-b-2 border-slate-300 pb-4 mb-6">
        <div className="flex flex-col gap-4">
          <div
            className="bg-black inline-flex p-2.5 rounded-xl shadow-sm self-start"
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            <img src={fatafatLogo} alt="Fatafat" className="h-7 w-auto" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Merchant Statement of Accounts
            </h1>
            <p className="text-[10px] text-slate-500 mt-1">
              Generated: {new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-base font-bold text-slate-900">{activeReportMerchant}</h2>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Period: {billReportStartDate ? formatOrderDate(billReportStartDate) : 'All History'} to{' '}
            {billReportEndDate ? formatOrderDate(billReportEndDate) : 'Present'}
          </p>
        </div>
      </div>

      {/* Invoice Sales Table */}
      <div className="space-y-3 mb-8">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Merchant Bill Orders
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-100/80 font-bold text-slate-700">
              <th className="py-2 px-3">Order Date</th>
              <th className="py-2 px-3">Order Details</th>
              <th className="py-2 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {merchantBillReportData?.records.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-4 px-3 text-center text-slate-500 italic">
                  No orders recorded in this period.
                </td>
              </tr>
            ) : (
              merchantBillReportData?.records.map(r => (
                <tr key={r.id}>
                  <td className="py-2 px-3">{formatOrderDate(r.date)}</td>
                  <td className="py-2 px-3 text-slate-700">{formatOrderDetails(r)}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800">
                    ৳{getRecordMerchantBill(r).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {merchantBillReportData?.records.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-bold text-slate-800">
                <td className="py-2 px-3" colSpan="2">
                  Total Bill Amount
                </td>
                <td className="py-2 px-3 text-right text-slate-900 font-bold">
                  ৳{(merchantBillReportData?.totals?.commissionBill || 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Payments Table */}
      <div className="space-y-3 mb-8">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payouts Ledger</h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-100/80 font-bold text-slate-700">
              <th className="py-2 px-3">Date Paid</th>
              <th className="py-2 px-3">Amount Paid</th>
              <th className="py-2 px-3">Notes / Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {merchantBillReportData?.payments.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-4 px-3 text-center text-slate-500 italic">
                  No payouts recorded in this period.
                </td>
              </tr>
            ) : (
              merchantBillReportData?.payments.map(p => (
                <tr key={p.id}>
                  <td className="py-2 px-3">{p.date ? p.date.slice(0, 10) : '—'}</td>
                  <td className="py-2 px-3 font-bold text-emerald-700">
                    ৳{Number(p.paidAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-slate-600 italic">{p.notes || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Period Summary & Signature Lines */}
      <div className="grid grid-cols-2 gap-8 border-t border-slate-300 pt-6 mt-8">
        {/* Signatures */}
        <div className="flex flex-col justify-end space-y-12">
          <div className="flex gap-12">
            <div className="flex-1 border-t border-slate-400 text-center pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Merchant Signature
              </span>
            </div>
            <div className="flex-1 border-t border-slate-400 text-center pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Accounts Department
              </span>
            </div>
          </div>
        </div>
        {/* Totals */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Total Bill Amount:</span>
            <span className="font-semibold text-slate-900">
              ৳{(merchantBillReportData?.totals?.commissionBill || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Total Paid:</span>
            <span className="font-semibold text-emerald-700">
              ৳{(merchantBillReportData?.totals?.paid || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t border-slate-300 pt-2 font-bold text-slate-900">
            <span>Outstanding Period Balance:</span>
            <span
              className={
                (merchantBillReportData?.totals?.ending || 0) > 0
                  ? 'text-rose-700'
                  : 'text-emerald-700'
              }
            >
              ৳{(merchantBillReportData?.totals?.ending || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
