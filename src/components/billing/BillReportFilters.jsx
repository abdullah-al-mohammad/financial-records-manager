import { format } from 'date-fns';
import DatePicker from 'react-datepicker';

// Merchant select + from/to date range used by the bill report.
export default function BillReportFilters({
  merchants,
  billReportMerchant,
  onMerchantChange,
  billReportStartDate,
  onStartDateChange,
  billReportEndDate,
  onEndDateChange,
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
            Merchant
          </label>
          <select
            value={billReportMerchant}
            onChange={e => onMerchantChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
          >
            <option value="">Select Merchant</option>
            {merchants.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
            Bill Date From
          </label>
          <DatePicker
            selected={billReportStartDate ? new Date(billReportStartDate) : null}
            onChange={date => {
              if (date) {
                onStartDateChange(format(date, 'yyyy-MM-dd'));
              } else {
                onStartDateChange('');
              }
            }}
            dateFormat="MMMM d, yyyy"
            isClearable
            placeholderText="Select start date"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
            wrapperClassName="w-full"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
            Bill Date To
          </label>
          <DatePicker
            selected={billReportEndDate ? new Date(billReportEndDate) : null}
            onChange={date => {
              if (date) {
                onEndDateChange(format(date, 'yyyy-MM-dd'));
              } else {
                onEndDateChange('');
              }
            }}
            dateFormat="MMMM d, yyyy"
            isClearable
            placeholderText="Select end date"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
            wrapperClassName="w-full"
          />
        </div>
      </div>

      {(billReportStartDate || billReportEndDate) && (
        <button
          type="button"
          onClick={() => {
            onStartDateChange('');
            onEndDateChange('');
          }}
          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
        >
          Clear Date Range
        </button>
      )}
    </>
  );
}
