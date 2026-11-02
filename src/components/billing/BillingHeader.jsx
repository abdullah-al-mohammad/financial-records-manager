import { Calendar } from 'lucide-react';
import { MONTHS } from './billingLogic';

// Page title plus the billing-month selector.
export default function BillingHeader({ selectedMonth, onMonthChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Merchant Billing Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track payouts due, record payouts, and carry forward balances
        </p>
      </div>

      {/* Global Cycle Selectors */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          Billing Month:
        </div>
        <select
          value={selectedMonth}
          onChange={e => onMonthChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white outline-none font-semibold focus:border-indigo-500"
        >
          {MONTHS.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
