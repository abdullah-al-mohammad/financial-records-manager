import BillReminderCard from './BillReminderCard';

// Floating stack of due reminder cards.
export default function BillReminderStack({ reminders, onDismiss }) {
  if (reminders.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {reminders.map(reminder => (
        <BillReminderCard key={reminder.id} reminder={reminder} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
