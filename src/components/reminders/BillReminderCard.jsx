import { Volume2, X } from 'lucide-react';

// One merchant bill reminder toast.
export default function BillReminderCard({ reminder, onDismiss }) {
  return (
    <div className="glass-panel border-l-4 border-l-amber-500 border border-slate-800 bg-slate-900/95 backdrop-blur p-4 rounded-xl shadow-2xl flex items-start justify-between gap-3 animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 flex-shrink-0">
          <Volume2 className="w-4 h-4 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Merchant Bill Reminder</h4>
          <p className="text-xs text-slate-300 mt-1">
            {reminder.merchantName} bill is due.
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Last paid: {new Date(reminder.lastPaidDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDismiss(reminder.id)}
        className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all cursor-pointer"
        title="Dismiss Reminder"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
