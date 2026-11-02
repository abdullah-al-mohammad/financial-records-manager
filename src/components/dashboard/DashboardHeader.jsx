import { Activity, ArrowRightLeft, CreditCard, PlusCircle, Printer } from 'lucide-react';

// Dashboard page title plus the quick-action button row.
export default function DashboardHeader({ setActiveTab, onOpenTransfer }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Financial Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time analytics and overall ledger statistics
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setActiveTab('sales')}
          className="flex items-center gap-1.5 btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Record
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className="flex items-center gap-1.5 glass-panel border border-slate-800 hover:border-slate-700 active:scale-[0.98] text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          Record Payment
        </button>
        <button
          onClick={onOpenTransfer}
          className="flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 hover:border-violet-500/60 active:scale-[0.98] text-violet-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Transfer Funds
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 glass-panel border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Page
        </button>
      </div>
    </div>
  );
}
