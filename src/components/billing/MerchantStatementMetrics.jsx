// Three period-performance tiles inside the merchant statement drawer.
export default function MerchantStatementMetrics({ merchantBillReportData }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
          Billed in Period
        </span>
        <span className="text-sm font-extrabold text-indigo-400 block mt-1">
          ৳{(merchantBillReportData?.totals?.commissionBill || 0).toLocaleString()}
        </span>
      </div>
      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
          Paid in Period
        </span>
        <span className="text-sm font-extrabold text-emerald-400 block mt-1">
          ৳{(merchantBillReportData?.totals?.paid || 0).toLocaleString()}
        </span>
      </div>
      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
          Outstanding
        </span>
        <span
          className={`text-sm font-extrabold block mt-1 ${(merchantBillReportData?.totals?.ending || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
        >
          ৳{(merchantBillReportData?.totals?.ending || 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
