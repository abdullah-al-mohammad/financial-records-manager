import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import { MONTH_NAMES } from '../../utils/dates';
import Drawer from '../shared/Drawer';
import ExpenseFormFields from './ExpenseFormFields';

// Right-side drawer containing the new/edit expense form.
export default function ExpenseFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  form,
  handleChange,
  merchants,
  editingRecord,
  isSubmitting,
  showAddMerchant,
  onToggleAddMerchant,
  newMerchant,
  onNewMerchantChange,
  onAddNewMerchant,
}) {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={editingRecord ? 'Edit Expense' : 'New Expense Entry'}
      subtitle="Log operational costs in the dedicated expense section"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : editingRecord ? 'Update Expense' : 'Save Expense'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
          Date &amp; Merchant
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Date</label>
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
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              wrapperClassName="w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Month</label>
            <select
              name="month"
              value={form.month}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
            >
              {MONTH_NAMES.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400 block">
            Linked Merchant (optional)
          </label>
          <div className="flex gap-2">
            <select
              name="merchantName"
              value={form.merchantName}
              onChange={handleChange}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
            >
              <option value="">General overhead</option>
              {merchants.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onToggleAddMerchant}
              className="px-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 text-sm cursor-pointer"
            >
              +
            </button>
          </div>
          {showAddMerchant && (
            <div className="flex gap-2 p-3 bg-slate-950/60 border border-slate-900 rounded-xl mt-2">
              <input
                type="text"
                placeholder="New merchant name..."
                value={newMerchant}
                onChange={e => onNewMerchantChange(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={onAddNewMerchant}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
          Expense Details
        </h3>
        <ExpenseFormFields form={form} handleChange={handleChange} />
      </div>
    </Drawer>
  );
}
