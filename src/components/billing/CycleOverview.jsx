import { CornerDownRight, ToggleLeft, ToggleRight } from 'lucide-react';
import PriorDuesList from './PriorDuesList';

// Cycle summary card with the carry-forward toggle and prior-dues breakdown.
export default function CycleOverview({
  selectedMonth,
  carryForward,
  setCarryForward,
  aggregateTotals,
  billingLedger,
}) {
  return (
    <div className="lg:col-span-2 glass-panel border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side: Metrics */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cycle Overview Balances
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Summary of dues and transfers for {selectedMonth}
              </p>
            </div>

            {/* Carry Forward Toggle */}
            <button
              onClick={() => setCarryForward(!carryForward)}
              className="flex items-center gap-2 text-xs text-slate-400 font-semibold hover:text-white cursor-pointer"
            >
              {carryForward ? (
                <>
                  <ToggleRight className="w-6 h-6 text-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Prior Dues Linked
                  </span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Month Isolation
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                Starting Dues
              </span>
              <span className="text-lg font-extrabold text-slate-300 block mt-1">
                ৳{aggregateTotals.starting.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                Billed this Month
              </span>
              <span className="text-lg font-extrabold text-indigo-400 block mt-1">
                ৳{aggregateTotals.billed.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
                Paid this Month
              </span>
              <span className="text-lg font-extrabold text-emerald-400 block mt-1">
                ৳{aggregateTotals.paid.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl shadow-inner shadow-rose-500/5">
              <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">
                Ending Balance
              </span>
              <span className="text-lg font-extrabold text-rose-400 block mt-1">
                ৳{aggregateTotals.ending.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
            {carryForward ? (
              <span className="flex items-start gap-1.5">
                <CornerDownRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                Dues carry-forward is active. The Ending Balance includes unpaid bills accumulated
                from all preceding months.
              </span>
            ) : (
              <span className="flex items-start gap-1.5">
                <CornerDownRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                Isolated month calculations. Showing outstanding bills and payments generated
                strictly during {selectedMonth}.
              </span>
            )}
          </div>
        </div>

        {/* Right side: Previous Month's Outstanding Dues Summary */}
        <PriorDuesList billingLedger={billingLedger} priorTotal={aggregateTotals.starting} />
      </div>
    </div>
  );
}
