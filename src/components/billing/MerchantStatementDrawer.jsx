import { Download, Landmark, Printer } from 'lucide-react';
import MerchantStatementFilters from './MerchantStatementFilters';
import MerchantStatementMetrics from './MerchantStatementMetrics';
import MerchantStatementOrdersTable from './MerchantStatementOrdersTable';
import MerchantStatementPaymentsTable from './MerchantStatementPaymentsTable';

// Right-side merchant statement slide-over with its own audit trail.
export default function MerchantStatementDrawer({
  focusedMerchant,
  onClose,
  merchantBillReportData,
  billReportStartDate,
  setBillReportStartDate,
  billReportEndDate,
  setBillReportEndDate,
  onPrint,
  onDownloadPdf,
  isDownloadingPdf,
}) {
  if (!focusedMerchant) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl bg-[var(--drawer-bg)] border-l border-slate-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-900 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-500" />
              {focusedMerchant} Statement
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Itemized sales and payments audit trail
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Merchant Date Range Filter Options */}
          <MerchantStatementFilters
            billReportStartDate={billReportStartDate}
            setBillReportStartDate={setBillReportStartDate}
            billReportEndDate={billReportEndDate}
            setBillReportEndDate={setBillReportEndDate}
          />

          {/* Period Performance Metrics Card */}
          <MerchantStatementMetrics merchantBillReportData={merchantBillReportData} />

          {/* Sales Records */}
          <MerchantStatementOrdersTable merchantBillReportData={merchantBillReportData} />

          {/* Payments History */}
          <MerchantStatementPaymentsTable merchantBillReportData={merchantBillReportData} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
          >
            {isDownloadingPdf ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Statement
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
}
