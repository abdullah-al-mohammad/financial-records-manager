import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import { MONTH_NAMES } from '../../utils/dates';

// Drawer section 1: date, cycle month and merchant selection.
export default function SalesDateMerchantSection({
  form,
  handleChange,
  merchants,
  showAddMerchant,
  onToggleAddMerchant,
  newMerchant,
  onNewMerchantChange,
  onAddNewMerchant,
}) {
  return (
    <div className="rounded-2xl border border-indigo-500/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-4 space-y-4 shadow-lg shadow-indigo-950/10">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
          1
        </span>
        <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
          Date &amp; Merchant
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="group">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-400 transition-colors">
            Date &amp; Time
          </label>
          <DatePicker
            selected={form.date ? new Date(form.date) : null}
            onChange={date => {
              if (date) {
                handleChange({
                  target: { name: 'date', value: format(date, "yyyy-MM-dd'T'HH:mm") },
                });
              }
            }}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="MMM d, yyyy h:mm aa"
            className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200"
            wrapperClassName="w-full"
          />
        </div>

        <div className="group">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-400 transition-colors">
            Cycle Month
          </label>
          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
          >
            {MONTH_NAMES.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="group">
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-400 transition-colors">
          Merchant Name
        </label>
        <div className="flex gap-2">
          <select
            name="merchantName"
            value={form.merchantName}
            onChange={handleChange}
            className="flex-1 bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">Select a merchant…</option>
            {merchants.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleAddMerchant}
            title="Add new merchant"
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-lg font-bold transition-all cursor-pointer"
          >
            +
          </button>
        </div>
        {showAddMerchant && (
          <div className="flex gap-2 mt-2 p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
            <input
              type="text"
              placeholder="New merchant name…"
              value={newMerchant}
              onChange={e => onNewMerchantChange(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-700/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3 py-2 text-xs text-white outline-none transition-all"
            />
            <button
              type="button"
              onClick={onAddNewMerchant}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
