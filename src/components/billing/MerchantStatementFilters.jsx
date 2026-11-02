import { format } from 'date-fns';
import DatePicker from 'react-datepicker';

// From/to date range filter inside the merchant statement drawer.
export default function MerchantStatementFilters({
  billReportStartDate,
  setBillReportStartDate,
  billReportEndDate,
  setBillReportEndDate,
}) {
  return (
    <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4.5 space-y-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
        Merchant Bill Date Range
      </span>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
            From Date
          </label>
          <DatePicker
            selected={billReportStartDate ? new Date(billReportStartDate) : null}
            onChange={date => {
              if (date) {
                setBillReportStartDate(format(date, 'yyyy-MM-dd'));
              } else {
                setBillReportStartDate('');
              }
            }}
            dateFormat="MMMM d, yyyy"
            isClearable
            placeholderText="Select date"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
            wrapperClassName="w-full"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
            To Date
          </label>
          <DatePicker
            selected={billReportEndDate ? new Date(billReportEndDate) : null}
            onChange={date => {
              if (date) {
                setBillReportEndDate(format(date, 'yyyy-MM-dd'));
              } else {
                setBillReportEndDate('');
              }
            }}
            dateFormat="MMMM d, yyyy"
            isClearable
            placeholderText="Select date"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
            wrapperClassName="w-full"
          />
        </div>
      </div>
      {(billReportStartDate || billReportEndDate) && (
        <button
          onClick={() => {
            setBillReportStartDate('');
            setBillReportEndDate('');
          }}
          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline block cursor-pointer"
        >
          Clear Filter
        </button>
      )}
    </div>
  );
}
