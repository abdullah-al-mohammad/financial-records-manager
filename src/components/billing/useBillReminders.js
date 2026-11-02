import { useEffect, useMemo, useState } from 'react';
import {
  getDueBillReminders,
  getStoredBillReminders,
  saveBillReminders,
} from '../../utils/reminders';

// Owns persisted bill reminders plus the browser-notification side effect.
export default function useBillReminders() {
  const [billReminders, setBillReminders] = useState(() => getStoredBillReminders());
  const [notifiedReminderIds, setNotifiedReminderIds] = useState([]);

  const dueBillReminders = useMemo(() => getDueBillReminders(billReminders), [billReminders]);

  useEffect(() => {
    saveBillReminders(billReminders);
  }, [billReminders]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const newDueReminders = dueBillReminders.filter(
      reminder => !notifiedReminderIds.includes(reminder.id)
    );
    if (newDueReminders.length === 0) {
      return;
    }

    setNotifiedReminderIds(prev => [...prev, ...newDueReminders.map(item => item.id)]);

    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    if (Notification.permission === 'granted') {
      newDueReminders.forEach(reminder => {
        new Notification(`Merchant bill due: ${reminder.merchantName}`, {
          body: `${reminder.merchantName} bill is due today. Last paid on ${reminder.lastPaidDate}.`,
        });
      });
    }
  }, [dueBillReminders, notifiedReminderIds]);

  return {
    billReminders,
    setBillReminders,
    dueBillReminders,
  };
}
