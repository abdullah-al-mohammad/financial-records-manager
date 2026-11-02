import BillReminderStack from './BillReminderStack';
import useBillReminderAlerts from './useBillReminderAlerts';

export default function BillReminderManager({ records, payments }) {
  const { dueReminders, handleDismiss } = useBillReminderAlerts({ records, payments });

  return <BillReminderStack reminders={dueReminders} onDismiss={handleDismiss} />;
}
