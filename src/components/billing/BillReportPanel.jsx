import { FileText, Printer } from 'lucide-react';
import BillReportFilters from './BillReportFilters';
import BillReportPreviewTable from './BillReportPreviewTable';

// Merchant bill report panel: header, filters and print preview.
export default function BillReportPanel({
  merchants,
  billReportMerchant,
  setBillReportMerchant,
  billReportStartDate,
  setBillReportStartDate,
  billReportEndDate,
  setBillReportEndDate,
  activeReportMerchant,
  merchantBillReportData,
  onPrint,
}) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Merchant Bill Report
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Choose a merchant and bill date range to preview or print all orders in that period
          </p>
        </div>
        <button
          type="button"
          onClick={onPrint}
          disabled={!billReportMerchant || !billReportStartDate || !billReportEndDate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Report
        </button>
      </div>

      <BillReportFilters
        merchants={merchants}
        billReportMerchant={billReportMerchant}
        onMerchantChange={setBillReportMerchant}
        billReportStartDate={billReportStartDate}
        onStartDateChange={setBillReportStartDate}
        billReportEndDate={billReportEndDate}
        onEndDateChange={setBillReportEndDate}
      />

      {activeReportMerchant ? (
        <div className="space-y-3 border-t border-slate-900 pt-4">
          <BillReportPreviewTable
            activeReportMerchant={activeReportMerchant}
            merchantBillReportData={merchantBillReportData}
            billReportStartDate={billReportStartDate}
            billReportEndDate={billReportEndDate}
          />
        </div>
      ) : (
        <p className="text-[10px] text-slate-500 italic border-t border-slate-900 pt-4">
          Select a merchant above to preview their bill report.
        </p>
      )}
    </div>
  );
}
