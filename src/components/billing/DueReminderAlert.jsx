// Amber alert listing merchant bills due today.
export default function DueReminderAlert({ dueBillReminders }) {
  if (dueBillReminders.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
            Reminder alert
          </p>
          <p className="text-sm font-semibold text-white">Merchant bills are due today.</p>
        </div>
        <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-200">
          {dueBillReminders.length} due
        </span>
      </div>
      <div className="space-y-2">
        {dueBillReminders.map(reminder => (
          <div key={reminder.id} className="rounded-xl border border-amber-400/20 bg-slate-950/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-white">{reminder.merchantName}</span>
              <span className="text-[10px] font-medium text-amber-200">
                Due on {reminder.nextDueDate}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300">
              Last payout logged on {reminder.lastPaidDate}. A follow-up merchant bill reminder is
              due now.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
